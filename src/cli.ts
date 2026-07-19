#!/usr/bin/env node

import { randomUUID } from "node:crypto";
import { UplinkError } from "./errors.js";
import { getRepositoryStatus, initializeRepository, rebindRepository } from "./repository.js";

const HELP = `Usage: uplink <command> [options]

Local-first personal Repository for AI conversations.

Commands:
  init       Initialize a Repository in the current directory
  rebind     Point this device at another existing Repository
  status     Show the bound Repository and its health

Options:
  --json     Print a stable machine-readable result
  --yes      Confirm a rebind after reviewing the source and target paths
  -h, --help Show this help
`;

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const json = args.includes("--json");
  const command = args.find((argument) => !argument.startsWith("-"));
  const operationId = `op_${randomUUID()}`;

  if (!command || args.includes("--help") || args.includes("-h")) {
    process.stdout.write(HELP);
    return;
  }

  try {
    if (command === "init") {
      const result = await initializeRepository(process.cwd());
      if (json) {
        process.stdout.write(`${JSON.stringify({ ok: true, command, operationId, result })}\n`);
      } else {
        process.stdout.write(`Initialized Repository ${result.repository.id} at ${result.repository.path}\n`);
      }
      return;
    }

    if (command === "status") {
      const result = await getRepositoryStatus();
      if (json) {
        process.stdout.write(`${JSON.stringify({ ok: true, command, operationId, result })}\n`);
      } else {
        process.stdout.write([
          `Repository: ${result.repository.path}`,
          `ID: ${result.repository.id}`,
          `Version: ${result.repository.version}`,
          `Health: ${result.health.status}`,
          "",
        ].join("\n"));
      }
      return;
    }

    if (command === "rebind") {
      const commandIndex = args.indexOf(command);
      const targetPath = args[commandIndex + 1];
      if (!targetPath || targetPath.startsWith("-")) {
        throw new UplinkError(
          "REBIND_TARGET_REQUIRED",
          "The rebind command requires a Repository path.",
          "Run `uplink rebind <path>` with an existing Repository path.",
        );
      }
      const result = await rebindRepository(targetPath, args.includes("--yes"));
      if (json) {
        process.stdout.write(`${JSON.stringify({ ok: true, command, operationId, result })}\n`);
      } else {
        process.stdout.write(`Rebound this device to Repository ${result.repository.id} at ${result.repository.path}\n`);
      }
      return;
    }

    throw new UplinkError(
      "UNKNOWN_COMMAND",
      `Unknown command: ${command}`,
      "Run `uplink --help` to list available commands.",
    );
  } catch (error) {
    const knownError = error instanceof UplinkError;
    const details = knownError
      ? error
      : new UplinkError(
          "INTERNAL_ERROR",
          "Uplink could not complete the command.",
          "Run the command again, then run `uplink status` if the problem continues.",
        );
    const event = `${command}.failed`;
    if (json) {
      process.stderr.write(`${JSON.stringify({
        ok: false,
        command,
        error: {
          code: details.code,
          message: details.message,
          event,
          formalRepositoryDataWritten: details.formalRepositoryDataWritten,
          operationId,
          recoveryAction: details.recoveryAction,
        },
      })}\n`);
    } else {
      process.stderr.write([
        `${details.code}: ${details.message}`,
        `Event: ${event}`,
        `Operation ID: ${operationId}`,
        `Formal Repository data written: ${details.formalRepositoryDataWritten}`,
        details.recoveryAction,
        "",
      ].join("\n"));
    }
    process.exitCode = 1;
  }
}

await main();
