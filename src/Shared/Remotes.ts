import Net from "@rbxts/net";
import { ZrRuntimeErrorCode } from "@rbxts/zirconium/out/Runtime/Runtime";
import { RemoteId } from "../RemoteId";
import { ZrParserErrorCode } from "@rbxts/zirconium/out/Ast/Parser";
import { ZirconLogData, ZirconLogLevel } from "../Client/Types";
import createPermissionMiddleware from "./NetPermissionMiddleware";
import type { ReadonlyZirconPermissionSet } from "Server/Class/ZirconGroup";

export interface ZirconiumRuntimeErrorMessage {
	type: ZirconNetworkMessageType.ZirconiumRuntimeError;
	message: string;
	time: number;
	debug?: ZirconDebugInformation;
	script?: string;
	source?: readonly [number, number];
	code: ZrRuntimeErrorCode;
}

export interface ZirconDebugInformation {
	LineAndColumn: readonly [number, number];
	CodeLine: readonly [number, number];
	TokenPosition: readonly [number, number];
	TokenLinePosition: readonly [number, number];
	Line: string;
}

export const enum ZirconNetworkMessageType {
	ZirconiumParserError = "ZrParserError",
	ZirconiumRuntimeError = "ZrRuntimeError",
	ZirconiumOutput = "ZrStandardOutput",
	ZirconStandardOutputMessage = "ZirconStandardOutput",
	ZirconStandardErrorMessage = "ZirconStandardError",
}

export interface ZirconiumParserErrorMessage {
	type: ZirconNetworkMessageType.ZirconiumParserError;
	message: string;
	time: number;
	script?: string;
	debug?: ZirconDebugInformation;
	source?: readonly [number, number];
	code: ZrParserErrorCode;
}

export interface ZirconExecutionOutput {
	type: ZirconNetworkMessageType.ZirconiumOutput;
	time: number;
	script?: string;
	message: string;
}

export interface ZirconLogOutput {
	type: ZirconNetworkMessageType.ZirconStandardOutputMessage;
	time: number;
	data: ZirconLogData;
	tag: string;
	level: ZirconLogLevel.Debug | ZirconLogLevel.Info | ZirconLogLevel.Warning;
	message: string;
}

export interface ZirconLogErrorOutput {
	type: ZirconNetworkMessageType.ZirconStandardErrorMessage;
	time: number;
	tag: string;
	data: ZirconLogData;
	level: ZirconLogLevel.Error | ZirconLogLevel.Wtf;
	message: string;
}

export type ZirconStandardOutput = ZirconExecutionOutput | ZirconLogOutput;
export type ZirconErrorOutput = ZirconiumRuntimeErrorMessage | ZirconiumParserErrorMessage | ZirconLogErrorOutput;

const Remotes = Net.Definitions.Create(
	{
		[RemoteId.StandardOutput]: Net.Definitions.ServerToClientEvent<[output: ZirconStandardOutput]>(),
		[RemoteId.StandardError]: Net.Definitions.ServerToClientEvent<[output: ZirconErrorOutput]>(),
		[RemoteId.DispatchToServer]: Net.Definitions.ClientToServerEvent<[message: string]>([
			createPermissionMiddleware("CanExecuteZirconiumScripts"),
			Net.Middleware.RateLimit({ MaxRequestsPerMinute: 25 }),
			Net.Middleware.TypeChecking((value: unknown): value is string => typeIs(value, "string")),
		]),
		[RemoteId.GetPlayerPermissions]: Net.Definitions.ServerAsyncFunction<() => ReadonlyZirconPermissionSet>([
			Net.Middleware.RateLimit({ MaxRequestsPerMinute: 1 }),
		]),
		[RemoteId.GetServerLogMessages]: Net.Definitions.ServerAsyncFunction<
			() => Array<ZirconStandardOutput | ZirconErrorOutput>
		>([createPermissionMiddleware("CanRecieveServerLogMessages")]),
	},
	[
		Net.Middleware.Global((remoteName, remoteData, callingPlayer) => {
			import("Log").then(({ Logger }) => {
				Logger.Debug(script, "Call to {} with {} from {}", remoteName, remoteData, callingPlayer ?? undefined);
			});
		}),
	],
);
export default Remotes;
