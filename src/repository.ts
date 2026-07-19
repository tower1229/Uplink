import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { UplinkError } from "./errors.js";

const REPOSITORY_VERSION = 1;
const SCHEMA_VERSION = 1;

const REPOSITORY_DIRECTORIES = [
  "inbox/processed",
  "inbox/failed",
  "raw/chatgpt",
  "raw/gemini",
  "raw/doubao",
  "raw/yuanbao",
  "conversations/chatgpt",
  "conversations/gemini",
  "conversations/doubao",
  "conversations/yuanbao",
  "attachments/sha256",
  "imports",
  "captures/staging",
  "captures/completed",
  "profiles",
  "indexes/messages",
  "logs",
  "migrations",
] as const;

interface RepositoryConfig {
  repositoryVersion: number;
  repositoryId: string;
  createdAt: string;
  schemaVersion: number;
}

interface BindingConfig {
  schemaVersion: number;
  repositoryPath: string;
  boundAt: string;
}

export interface InitializedRepository {
  repository: {
    id: string;
    version: number;
    path: string;
  };
  bindingCreated: boolean;
}

export interface RepositoryStatus {
  binding: {
    repositoryPath: string;
    boundAt: string;
  };
  repository: {
    id: string;
    version: number;
    schemaVersion: number;
    path: string;
  };
  health: {
    status: "healthy" | "degraded";
    checks: {
      binding: "ok";
      config: "ok";
      layout: "ok" | "issues";
    };
    issues: string[];
  };
}

function configDirectory(): string {
  if (process.env.UPLINK_CONFIG_DIR) {
    return path.resolve(process.env.UPLINK_CONFIG_DIR);
  }
  if (process.platform === "win32" && process.env.APPDATA) {
    return path.join(process.env.APPDATA, "Uplink");
  }
  return path.join(process.env.XDG_CONFIG_HOME ?? path.join(os.homedir(), ".config"), "uplink");
}

async function readJsonIfPresent<T>(filePath: string): Promise<T | undefined> {
  try {
    return JSON.parse(await readFile(filePath, "utf8")) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return undefined;
    }
    throw error;
  }
}

async function writeJsonAtomic(filePath: string, value: unknown): Promise<void> {
  const temporaryPath = `${filePath}.${randomUUID()}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(value, null, 2)}\n`, { flag: "wx", mode: 0o600 });
  await rename(temporaryPath, filePath);
}

async function isDirectory(directoryPath: string): Promise<boolean> {
  try {
    return (await stat(directoryPath)).isDirectory();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

function isRepositoryConfig(value: unknown): value is RepositoryConfig {
  if (!value || typeof value !== "object") {
    return false;
  }
  const config = value as Partial<RepositoryConfig>;
  return typeof config.repositoryId === "string"
    && config.repositoryId.startsWith("repo_")
    && config.repositoryVersion === REPOSITORY_VERSION
    && config.schemaVersion === SCHEMA_VERSION
    && typeof config.createdAt === "string";
}

function isBindingConfig(value: unknown): value is BindingConfig {
  if (!value || typeof value !== "object") {
    return false;
  }
  const binding = value as Partial<BindingConfig>;
  return binding.schemaVersion === SCHEMA_VERSION
    && typeof binding.repositoryPath === "string"
    && path.isAbsolute(binding.repositoryPath)
    && typeof binding.boundAt === "string"
    && !Number.isNaN(Date.parse(binding.boundAt));
}

async function readBindingIfPresent(bindingPath: string): Promise<BindingConfig | undefined> {
  let binding: unknown;
  try {
    binding = await readJsonIfPresent<unknown>(bindingPath);
  } catch (error) {
    if (!(error instanceof SyntaxError)) {
      throw new UplinkError(
        "INVALID_BINDING",
        `Uplink could not read the device Binding: ${bindingPath}.`,
        "Make the device Binding readable, then run `uplink status` again.",
      );
    }
    throw new UplinkError(
      "INVALID_BINDING",
      `The device Binding is not valid JSON: ${bindingPath}.`,
      "Restore the device Binding from backup, then run `uplink status` again.",
    );
  }
  if (binding !== undefined && !isBindingConfig(binding)) {
    throw new UplinkError(
      "INVALID_BINDING",
      `The device Binding is unsupported or invalid: ${bindingPath}.`,
      "Restore a version 1 device Binding, then run `uplink status` again.",
    );
  }
  return binding;
}

export async function initializeRepository(repositoryPath: string): Promise<InitializedRepository> {
  const canonicalPath = path.resolve(repositoryPath);
  const bindingPath = path.join(configDirectory(), "binding.json");
  const existingBinding = await readBindingIfPresent(bindingPath);
  if (existingBinding && path.resolve(existingBinding.repositoryPath) !== canonicalPath) {
    throw new UplinkError(
      "REPOSITORY_ALREADY_BOUND",
      `This device is already bound to ${existingBinding.repositoryPath}.`,
      "Run `uplink status` to inspect the active Binding.",
    );
  }

  const repositoryConfigPath = path.join(canonicalPath, "uplink.json");
  let existingRepositoryConfig: unknown;
  try {
    existingRepositoryConfig = await readJsonIfPresent<unknown>(repositoryConfigPath);
  } catch {
    throw new UplinkError(
      "INVALID_REPOSITORY",
      `The existing Repository config is not valid JSON: ${repositoryConfigPath}.`,
      "Restore `uplink.json` from backup or initialize an empty directory.",
    );
  }
  if (existingRepositoryConfig !== undefined && !isRepositoryConfig(existingRepositoryConfig)) {
    throw new UplinkError(
      "INVALID_REPOSITORY",
      `The existing Repository config is unsupported or invalid: ${repositoryConfigPath}.`,
      "Restore a version 1 `uplink.json` or initialize an empty directory.",
    );
  }
  if (existingBinding && existingRepositoryConfig === undefined) {
    throw new UplinkError(
      "INVALID_REPOSITORY",
      `The bound Repository config is missing: ${repositoryConfigPath}.`,
      "Restore `uplink.json` from backup, then run `uplink status` again.",
    );
  }

  const createdAt = new Date().toISOString();
  const repositoryConfig: RepositoryConfig = existingRepositoryConfig ?? {
      repositoryVersion: REPOSITORY_VERSION,
      repositoryId: `repo_${randomUUID()}`,
      createdAt,
      schemaVersion: SCHEMA_VERSION,
    };

  for (const directory of REPOSITORY_DIRECTORIES) {
    await mkdir(path.join(canonicalPath, directory), { recursive: true });
  }
  if (!existingRepositoryConfig) {
    await writeJsonAtomic(repositoryConfigPath, repositoryConfig);
  }

  let bindingCreated = false;
  if (!existingBinding) {
    try {
      await mkdir(path.dirname(bindingPath), { recursive: true });
      await writeJsonAtomic(bindingPath, {
        schemaVersion: SCHEMA_VERSION,
        repositoryPath: canonicalPath,
        boundAt: createdAt,
      } satisfies BindingConfig);
    } catch {
      throw new UplinkError(
        "BINDING_WRITE_FAILED",
        "The Repository was initialized, but Uplink could not create the device Binding.",
        `Make the device config directory writable, then run \`uplink init\` again in ${canonicalPath}.`,
        true,
      );
    }
    bindingCreated = true;
  }

  return {
    repository: {
      id: repositoryConfig.repositoryId,
      version: repositoryConfig.repositoryVersion,
      path: canonicalPath,
    },
    bindingCreated,
  };
}

export async function getRepositoryStatus(): Promise<RepositoryStatus> {
  const bindingPath = path.join(configDirectory(), "binding.json");
  const binding = await readBindingIfPresent(bindingPath);
  if (!binding) {
    throw new UplinkError(
      "REPOSITORY_NOT_BOUND",
      "This device has no active Repository Binding.",
      "Run `uplink init` inside the directory that should become the Repository.",
    );
  }

  const repositoryPath = path.resolve(binding.repositoryPath);
  if (!(await isDirectory(repositoryPath))) {
    throw new UplinkError(
      "REPOSITORY_NOT_FOUND",
      `The bound Repository does not exist at ${repositoryPath}.`,
      "Restore that path or run `uplink rebind <path>` to select a valid Repository.",
    );
  }

  let repositoryConfig: unknown;
  try {
    repositoryConfig = JSON.parse(await readFile(path.join(repositoryPath, "uplink.json"), "utf8"));
  } catch {
    throw new UplinkError(
      "INVALID_REPOSITORY",
      `The bound path is not a valid Repository: ${repositoryPath}.`,
      "Restore `uplink.json` from backup, then run `uplink status` again.",
    );
  }
  if (!isRepositoryConfig(repositoryConfig)) {
    throw new UplinkError(
      "INVALID_REPOSITORY",
      `The bound path has an unsupported or invalid Repository config: ${repositoryPath}.`,
      "Restore a version 1 `uplink.json`, then run `uplink status` again.",
    );
  }

  const issues: string[] = [];
  for (const directory of REPOSITORY_DIRECTORIES) {
    if (!(await isDirectory(path.join(repositoryPath, directory)))) {
      issues.push(`Missing Repository directory: ${directory}`);
    }
  }

  return {
    binding: {
      repositoryPath,
      boundAt: binding.boundAt,
    },
    repository: {
      id: repositoryConfig.repositoryId,
      version: repositoryConfig.repositoryVersion,
      schemaVersion: repositoryConfig.schemaVersion,
      path: repositoryPath,
    },
    health: {
      status: issues.length === 0 ? "healthy" : "degraded",
      checks: {
        binding: "ok",
        config: "ok",
        layout: issues.length === 0 ? "ok" : "issues",
      },
      issues,
    },
  };
}
