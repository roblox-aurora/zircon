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
export interface ConsolePlainMessage {
	type: "plain";
	message: string;
}

export interface ConsoleSyntaxMessage {
	type: "zr:execute";
	source: string;
}

export interface ConsoleStderrMessage {
	type: "zr:error";
	context: ExecutionContext;
	script?: string;
	error: ErrorMessage;
}
export interface ConsoleLuauError {
	type: "luau:error";
	context: ExecutionContext;
	error: string;
	stackTrace?: string[];
}
export type ConsoleMessage =
	| ConsoleStdoutMessage
	| ConsoleStderrMessage
	| ConsolePlainMessage
	| ConsoleLuauError
	| ConsoleSyntaxMessage;
