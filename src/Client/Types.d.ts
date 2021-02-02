export const enum ExecutionContext {
	Server,
	Client,
}
interface ConsoleStdoutMessage {
	type: "stdout";
	context: ExecutionContext;
	message: string;
}
interface CosnoleStderrMessage {
	type: "stderr";
	context: ExecutionContext;
	message: string;
}
export type ConsoleMessage = ConsoleStdoutMessage | CosnoleStderrMessage;
