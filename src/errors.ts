export class UplinkError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly recoveryAction: string,
  ) {
    super(message);
    this.name = "UplinkError";
  }
}
