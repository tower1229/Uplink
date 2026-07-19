import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

const projectRoot = path.resolve(import.meta.dirname, "..");

test("packed CLI installs into an isolated prefix and shows help outside the source tree", () => {
  const sandbox = mkdtempSync(path.join(tmpdir(), "uplink-install-"));
  const commandEnvironment = {
    ...process.env,
    npm_config_cache: path.join(sandbox, "npm-cache"),
  };
  const packOutput = execFileSync("npm.cmd", ["pack", "--json", "--pack-destination", sandbox], {
    cwd: projectRoot,
    encoding: "utf8",
    env: commandEnvironment,
    shell: process.platform === "win32",
  });
  const [{ filename }] = JSON.parse(packOutput) as [{ filename: string }];
  const tarball = path.join(sandbox, filename);

  execFileSync("npm.cmd", ["install", "--global", "--prefix", sandbox, tarball], {
    cwd: sandbox,
    env: commandEnvironment,
    stdio: "pipe",
    shell: process.platform === "win32",
  });

  const executable = process.platform === "win32"
    ? path.join(sandbox, "uplink.cmd")
    : path.join(sandbox, "bin", "uplink");
  const help = execFileSync(executable, ["--help"], {
    cwd: tmpdir(),
    encoding: "utf8",
    shell: process.platform === "win32",
  });

  assert.match(help, /^Usage: uplink/m);
  assert.match(help, /init/);
  assert.match(help, /status/);
});
