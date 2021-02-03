import Net from "@rbxts/net";
import { ZrRuntimeErrorCode } from "@rbxts/zirconium/out/Runtime/Runtime";
import { RemoteId } from "../RemoteId";
import { ZrParserErrorCode } from "@rbxts/zirconium-ast/out/Parser";

interface RuntimeErrorMessage {
	type: "RuntimeError";
	message: string;
	code: ZrRuntimeErrorCode;
}

interface ParserErrorMessage {
	type: "ParserError";
	message: string;
	code: ZrParserErrorCode;
}

export type ErrorMessage = RuntimeErrorMessage | ParserErrorMessage;

const Remotes = Net.Definitions.Create({
	[RemoteId.StandardOutput]: Net.Definitions.Event<[], [output: string]>(),
	[RemoteId.StandardError]: Net.Definitions.Event<[], [output: ErrorMessage]>(),
	[RemoteId.DispatchToServer]: Net.Definitions.Event<[message: string]>([
		Net.Middleware.TypeChecking((value: unknown): value is string => typeIs(value, "string")),
	]),
	[RemoteId.GetPlayerOptions]: Net.Definitions.AsyncFunction<() => defined>(),
});
export default Remotes;
