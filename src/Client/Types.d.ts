import { ErrorMessage } from "../Shared/Remotes";

export const enum ExecutionContext {
	Server,
	Client,
}
export interface ConsoleStdoutMessage {
	type: "zr:output";
	context: ExecutionContext;
	message: string;
}
export interface ConsoleStderrMessage {
	type: "zr:error";
	context: ExecutionContext;
	error: ErrorMessage;
}
export type ConsoleMessage = ConsoleStdoutMessage | ConsoleStderrMessage;
