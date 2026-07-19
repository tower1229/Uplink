export type UplinkErrorCode =
  | "BINDING_WRITE_FAILED"
  | "INTERNAL_ERROR"
  | "INVALID_BINDING"
  | "INVALID_REPOSITORY"
  | "REBIND_CONFIRMATION_REQUIRED"
  | "REBIND_TARGET_REQUIRED"
  | "REPOSITORY_ALREADY_BOUND"
  | "REPOSITORY_NOT_BOUND"
  | "REPOSITORY_NOT_FOUND"
  | "UNKNOWN_COMMAND";

export class UplinkError extends Error {
  constructor(
    readonly code: UplinkErrorCode,
    message: string,
    readonly recoveryAction: string,
    readonly formalRepositoryDataWritten = false,
  ) {
    super(message);
    this.name = "UplinkError";
  }
}
