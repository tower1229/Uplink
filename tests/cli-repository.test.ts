import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

const projectRoot = path.resolve(import.meta.dirname, "..");
const cliPath = path.join(projectRoot, "src", "cli.ts");
const tsxPath = path.join(projectRoot, "node_modules", "tsx", "dist", "cli.mjs");

function invokeCli(args: string[], cwd: string, configDirectory: string): string {
  return execFileSync(
    process.execPath,
    [tsxPath, cliPath, ...args],
    {
      cwd,
      encoding: "utf8",
      env: { ...process.env, UPLINK_CONFIG_DIR: configDirectory },
    },
  );
}

test("init creates the versioned Repository layout and first device Binding", () => {
  const sandbox = mkdtempSync(path.join(tmpdir(), "uplink-init-"));
  const repositoryPath = path.join(sandbox, "repository");
  const configDirectory = path.join(sandbox, "config");
  mkdirSync(repositoryPath);
  const output = invokeCli(["init", "--json"], repositoryPath, configDirectory);
  const response = JSON.parse(output) as {
    ok: boolean;
    command: string;
    result: { repository: { id: string; version: number; path: string }; bindingCreated: boolean };
  };

  assert.equal(response.ok, true);
  assert.equal(response.command, "init");
  assert.equal(response.result.repository.path, repositoryPath);
  assert.match(response.result.repository.id, /^repo_[0-9a-f-]{36}$/);
  assert.equal(response.result.repository.version, 1);
  assert.equal(response.result.bindingCreated, true);

  const repository = JSON.parse(readFileSync(path.join(repositoryPath, "uplink.json"), "utf8")) as {
    repositoryId: string;
    repositoryVersion: number;
    schemaVersion: number;
    createdAt: string;
  };
  assert.equal(repository.repositoryId, response.result.repository.id);
  assert.equal(repository.repositoryVersion, 1);
  assert.equal(repository.schemaVersion, 1);
  assert.ok(!Number.isNaN(Date.parse(repository.createdAt)));

  const expectedDirectories = [
    "inbox/processed", "inbox/failed",
    "raw/chatgpt", "raw/gemini", "raw/doubao", "raw/yuanbao",
    "conversations/chatgpt", "conversations/gemini", "conversations/doubao", "conversations/yuanbao",
    "attachments/sha256", "imports", "captures/staging", "captures/completed",
    "profiles", "indexes/messages", "logs", "migrations",
  ];
  for (const directory of expectedDirectories) {
    assert.equal(existsSync(path.join(repositoryPath, directory)), true, directory);
  }
  assert.equal(existsSync(path.join(repositoryPath, "contexts")), false);
  assert.equal(existsSync(path.join(repositoryPath, "indexes", "topics")), false);

  const binding = JSON.parse(readFileSync(path.join(configDirectory, "binding.json"), "utf8")) as {
    schemaVersion: number;
    repositoryPath: string;
  };
  assert.equal(binding.schemaVersion, 1);
  assert.equal(binding.repositoryPath, repositoryPath);
});

test("init refuses to replace an existing Binding and does not create another Repository", () => {
  const sandbox = mkdtempSync(path.join(tmpdir(), "uplink-single-binding-"));
  const firstRepository = path.join(sandbox, "first");
  const secondRepository = path.join(sandbox, "second");
  const configDirectory = path.join(sandbox, "config");
  mkdirSync(firstRepository);
  mkdirSync(secondRepository);
  invokeCli(["init", "--json"], firstRepository, configDirectory);

  const attempt = spawnSync(
    process.execPath,
    [tsxPath, cliPath, "init", "--json"],
    {
      cwd: secondRepository,
      encoding: "utf8",
      env: { ...process.env, UPLINK_CONFIG_DIR: configDirectory },
    },
  );

  assert.equal(attempt.status, 1);
  const response = JSON.parse(attempt.stderr) as {
    ok: boolean;
    command: string;
    error: {
      code: string;
      formalRepositoryDataWritten: boolean;
      operationId: string;
      recoveryAction: string;
    };
  };
  assert.equal(response.ok, false);
  assert.equal(response.command, "init");
  assert.equal(response.error.code, "REPOSITORY_ALREADY_BOUND");
  assert.equal(response.error.formalRepositoryDataWritten, false);
  assert.match(response.error.operationId, /^op_[0-9a-f-]{36}$/);
  assert.equal(response.error.recoveryAction, "Run `uplink status` to inspect the active Binding.");
  assert.equal(existsSync(path.join(secondRepository, "uplink.json")), false);

  const binding = JSON.parse(readFileSync(path.join(configDirectory, "binding.json"), "utf8")) as {
    repositoryPath: string;
  };
  assert.equal(binding.repositoryPath, firstRepository);
});

test("status resolves the Binding from an unrelated directory and reports Repository health", () => {
  const sandbox = mkdtempSync(path.join(tmpdir(), "uplink-status-"));
  const repositoryPath = path.join(sandbox, "repository");
  const unrelatedPath = path.join(sandbox, "elsewhere");
  const configDirectory = path.join(sandbox, "config");
  mkdirSync(repositoryPath);
  mkdirSync(unrelatedPath);
  const init = JSON.parse(invokeCli(["init", "--json"], repositoryPath, configDirectory)) as {
    result: { repository: { id: string } };
  };

  const response = JSON.parse(invokeCli(["status", "--json"], unrelatedPath, configDirectory)) as {
    ok: boolean;
    command: string;
    result: {
      binding: { repositoryPath: string };
      repository: { id: string; version: number; path: string };
      health: { status: string; checks: Record<string, string>; issues: string[] };
    };
  };

  assert.equal(response.ok, true);
  assert.equal(response.command, "status");
  assert.equal(response.result.binding.repositoryPath, repositoryPath);
  assert.equal(response.result.repository.path, repositoryPath);
  assert.equal(response.result.repository.id, init.result.repository.id);
  assert.equal(response.result.repository.version, 1);
  assert.deepEqual(response.result.health, {
    status: "healthy",
    checks: { binding: "ok", config: "ok", layout: "ok" },
    issues: [],
  });
});

test("repeating init in the bound Repository preserves its identity", () => {
  const sandbox = mkdtempSync(path.join(tmpdir(), "uplink-repeat-init-"));
  const repositoryPath = path.join(sandbox, "repository");
  const configDirectory = path.join(sandbox, "config");
  mkdirSync(repositoryPath);

  const first = JSON.parse(invokeCli(["init", "--json"], repositoryPath, configDirectory)) as {
    result: { repository: { id: string }; bindingCreated: boolean };
  };
  const firstConfig = readFileSync(path.join(repositoryPath, "uplink.json"), "utf8");
  const second = JSON.parse(invokeCli(["init", "--json"], repositoryPath, configDirectory)) as {
    result: { repository: { id: string }; bindingCreated: boolean };
  };

  assert.equal(second.result.repository.id, first.result.repository.id);
  assert.equal(second.result.bindingCreated, false);
  assert.equal(readFileSync(path.join(repositoryPath, "uplink.json"), "utf8"), firstConfig);
});

test("status reports a missing Binding target without recreating it", () => {
  const sandbox = mkdtempSync(path.join(tmpdir(), "uplink-missing-target-"));
  const repositoryPath = path.join(sandbox, "repository");
  const movedPath = path.join(sandbox, "repository-moved");
  const unrelatedPath = path.join(sandbox, "elsewhere");
  const configDirectory = path.join(sandbox, "config");
  mkdirSync(repositoryPath);
  mkdirSync(unrelatedPath);
  invokeCli(["init", "--json"], repositoryPath, configDirectory);
  renameSync(repositoryPath, movedPath);

  const attempt = spawnSync(process.execPath, [tsxPath, cliPath, "status", "--json"], {
    cwd: unrelatedPath,
    encoding: "utf8",
    env: { ...process.env, UPLINK_CONFIG_DIR: configDirectory },
  });

  assert.equal(attempt.status, 1);
  const response = JSON.parse(attempt.stderr) as {
    error: { code: string; formalRepositoryDataWritten: boolean; recoveryAction: string };
  };
  assert.equal(response.error.code, "REPOSITORY_NOT_FOUND");
  assert.equal(response.error.formalRepositoryDataWritten, false);
  assert.match(response.error.recoveryAction, /restore|rebind/i);
  assert.equal(existsSync(repositoryPath), false);
});

test("status errors are machine-readable and do not expose invalid config contents", () => {
  const sandbox = mkdtempSync(path.join(tmpdir(), "uplink-redaction-"));
  const repositoryPath = path.join(sandbox, "repository");
  const configDirectory = path.join(sandbox, "config");
  mkdirSync(repositoryPath);
  invokeCli(["init", "--json"], repositoryPath, configDirectory);
  const sensitiveMessageBody = "PRIVATE_MESSAGE_BODY_SHOULD_NOT_APPEAR";
  writeFileSync(path.join(repositoryPath, "uplink.json"), `{${sensitiveMessageBody}`);

  const attempt = spawnSync(process.execPath, [tsxPath, cliPath, "status", "--json"], {
    cwd: sandbox,
    encoding: "utf8",
    env: { ...process.env, UPLINK_CONFIG_DIR: configDirectory },
  });

  assert.equal(attempt.status, 1);
  const response = JSON.parse(attempt.stderr) as { error: { code: string; message: string } };
  assert.equal(response.error.code, "INVALID_REPOSITORY");
  assert.doesNotMatch(attempt.stderr, new RegExp(sensitiveMessageBody));
});

test("status rejects an invalid Binding instead of reporting it healthy", () => {
  const sandbox = mkdtempSync(path.join(tmpdir(), "uplink-invalid-binding-"));
  const configDirectory = path.join(sandbox, "config");
  mkdirSync(configDirectory);
  writeFileSync(path.join(configDirectory, "binding.json"), JSON.stringify({
    schemaVersion: 0,
    repositoryPath: 42,
    boundAt: "not-a-date",
  }));

  const attempt = spawnSync(process.execPath, [tsxPath, cliPath, "status", "--json"], {
    cwd: sandbox,
    encoding: "utf8",
    env: { ...process.env, UPLINK_CONFIG_DIR: configDirectory },
  });

  assert.equal(attempt.status, 1);
  const response = JSON.parse(attempt.stderr) as {
    error: { code: string; formalRepositoryDataWritten: boolean; recoveryAction: string };
  };
  assert.equal(response.error.code, "INVALID_BINDING");
  assert.equal(response.error.formalRepositoryDataWritten, false);
  assert.match(response.error.recoveryAction, /restore/i);
});
