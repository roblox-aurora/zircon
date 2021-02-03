import { ErrorMessage, Output } from "../Shared/Remotes";

export const enum ExecutionContext {
	Server,
	Client,
}
export interface ConsoleStdoutMessage {
	type: "zr:output";
	context: ExecutionContext;
	script?: string;
	message: Output;
}
export interface ConsoleStderrMessage {
	type: "zr:error";
	context: ExecutionContext;
	script?: string;
	error: ErrorMessage;
}
export type ConsoleMessage = ConsoleStdoutMessage | ConsoleStderrMessage;
