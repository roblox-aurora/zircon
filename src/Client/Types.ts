import {
	ZirconStandardOutput,
	ZirconiumRuntimeErrorMessage,
	ZirconiumParserErrorMessage,
	ZirconLogOutput,
	ZirconLogErrorOutput,
} from "Shared/Remotes";

export const enum ZirconContext {
	Server,
	Client,
}

export type ZirconTag = string | Instance | { toString(): string };
export interface ZirconLoggable {
	toString(): string;
}

export enum ZirconLogLevel {
	Debug,
	Info,
	Warning,
	Error,

	/**
	 * "What a terrible failure"
	 * Used if the result should never happen, yet
	 */
	Wtf,
}

export const enum ZirconMessageType {
	ZirconiumOutput = "zr:output",
	ZirconiumError = "zr:error",
	ZirconiumExecutionMessage = "zr:execute",
	ZirconLogOutputMesage = "zirclog:message",
	ZirconLogErrorMessage = "zirclog:error",
	PlainText = "plain",
}

export interface ZrOutputMessage {
	readonly type: ZirconMessageType.ZirconiumOutput;
	readonly context: ZirconContext;
	readonly script?: string;
	readonly message: ZirconStandardOutput;
}
export interface ConsolePlainMessage {
	readonly type: ZirconMessageType.PlainText;
	readonly message: string;
}

export interface ConsoleSyntaxMessage {
	readonly type: ZirconMessageType.ZirconiumExecutionMessage;
	readonly source: string;
}

export interface ZrErrorMessage {
	readonly type: ZirconMessageType.ZirconiumError;
	readonly context: ZirconContext;
	readonly script?: string;
	readonly error: ZirconiumRuntimeErrorMessage | ZirconiumParserErrorMessage;
}
export interface ConsoleLuauError {
	readonly type: "luau:error";
	readonly context: ZirconContext;
	readonly error: string;
	readonly stackTrace?: string[];
}

export interface ZirconLogMessage {
	readonly type: ZirconMessageType.ZirconLogOutputMesage;
	readonly context: ZirconContext;
	readonly message: ZirconLogOutput;
}

export interface ZirconLogErrorData {}

export interface ZirconLogError {
	readonly type: ZirconMessageType.ZirconLogErrorMessage;
	readonly context: ZirconContext;
	readonly error: ZirconLogErrorOutput;
}

export type ConsoleMessage =
	| ZrOutputMessage
	| ZrErrorMessage
	| ConsolePlainMessage
	| ConsoleLuauError
	| ConsoleSyntaxMessage
	| ZirconLogMessage
	| ZirconLogError;
