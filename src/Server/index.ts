import { LogService, RunService } from "@rbxts/services";
import Remotes, { ZirconDebugInformation, ZirconNetworkMessageType } from "../Shared/Remotes";
import { RemoteId } from "../RemoteId";
import { GetCommandService } from "../Services";
import Lazy from "../Shared/Lazy";
import { ZrRuntimeError } from "@rbxts/zirconium/out/Runtime/Runtime";
import { ZrParserError } from "@rbxts/zirconium-ast/out/Parser";
import { Token } from "@rbxts/zirconium-ast/out/Tokens/Tokens";
import { Node } from "@rbxts/zirconium-ast/out/Nodes/NodeTypes";
import { $dbg } from "rbxts-transform-debug";
import { ZirconLogLevel } from "../Client/Types";
import { ReadonlyZirconPermissionSet, ZirconGroupConfiguration } from "./Class/ZirconGroup";
const IsServer = RunService.IsServer();

namespace Zircon {
	export const Registry = Lazy(() => {
		assert(IsServer, "Zircon Service only accessible on server");
		return GetCommandService("RegistryService");
	});
	export const Dispatch = Lazy(() => {
		assert(IsServer, "Zircon Service only accessible on server");
		return GetCommandService("DispatchService");
	});

	export const Log = Lazy(() => {
		assert(IsServer, "Zircon Service only accessible on server");
		return GetCommandService("LogService");
	});

	function isParserError(err: ZrRuntimeError | ZrParserError): err is ZrParserError {
		return err.code >= 1000;
	}

	function getDebugInformationForNode(source: string, node: Node) {
		const startPos = node.startPos ?? 0;
		const endPos = node.endPos ?? startPos;

		let col = 0;
		let row = 1;
		let lineStart = 0;
		let lineEnd = source.size();
		let reachedToken = false;
		let reachedEndToken = false;
		for (let i = 0; i < source.size(); i++) {
			const char = source.sub(i + 1, i + 1);

			if (i === startPos) {
				reachedToken = true;
			}

			if (i === endPos) {
				reachedEndToken = true;
			}

			if (char === "\n") {
				lineEnd = i;
				if (!reachedToken) {
					lineStart = i + 1;
				} else if (reachedEndToken) {
					break;
				}

				row += 1;
				col = 1;
			} else {
				col += 1;
			}
		}
		if (reachedToken) {
			return $dbg(
				identity<ZirconDebugInformation>({
					LineAndColumn: [row, col],
					CodeLine: [lineStart, lineEnd],
					TokenPosition: [startPos, endPos],
					TokenLinePosition: [startPos - lineStart, endPos - lineStart],
					Line: source.sub(lineStart + 1, lineEnd + 1),
				}),
			);
		}
	}

	function getDebugInformation(source: string, token: Token) {
		let col = 0;
		let row = 1;
		let lineStart = 0;
		let lineEnd = source.size();
		let reachedToken = false;
		for (let i = 0; i < source.size(); i++) {
			const char = source.sub(i + 1, i + 1);

			if (i === token.startPos) {
				reachedToken = true;
			}

			if (char === "\n") {
				lineEnd = i;
				if (reachedToken) {
					break;
				}
				lineStart = i + 1;
				row += 1;
				col = 1;
			} else {
				col += 1;
			}
		}

		if (reachedToken) {
			return $dbg(
				identity<ZirconDebugInformation>({
					LineAndColumn: [row, col],
					CodeLine: [lineStart, lineEnd],
					TokenPosition: [token.startPos, token.endPos],
					TokenLinePosition: [token.startPos - lineStart, token.endPos - lineStart],
					Line: source.sub(lineStart + 1, lineEnd + 1),
				}),
			);
		}
	}

	if (RunService.IsServer()) {
		const StandardOutput = Remotes.Server.Create(RemoteId.StandardOutput);
		const StandardError = Remotes.Server.Create(RemoteId.StandardError);
		const DispatchToServer = Remotes.Server.Create(RemoteId.DispatchToServer);

		async function dispatch(player: Player, text: string) {
			return Dispatch.ExecuteScript(player, text).then((result) => result.execute());
		}

		DispatchToServer.Connect((player, message) => {
			print(player, message);
			dispatch(player, message)
				.then((output) => {
					for (const message of output) {
						StandardOutput.SendToPlayer(player, {
							type: ZirconNetworkMessageType.ZirconiumOutput,
							time: DateTime.now().UnixTimestamp,
							script: "zircon",
							message,
						});
					}
				})
				.catch((err: (ZrRuntimeError | ZrParserError)[]) => {
					print("err", err);

					for (const zrError of err) {
						if (isParserError(zrError)) {
							const debug = zrError.token ? getDebugInformation(message, zrError.token) : undefined;

							StandardError.SendToPlayer(player, {
								type: ZirconNetworkMessageType.ZirconiumParserError,
								script: "zircon",
								time: DateTime.now().UnixTimestamp,
								source: debug ? debug.LineAndColumn : undefined,
								debug,
								message: zrError.message,
								code: zrError.code,
							});
						} else {
							const debug = zrError.node ? getDebugInformationForNode(message, zrError.node) : undefined;

							StandardError.SendToPlayer(player, {
								type: ZirconNetworkMessageType.ZirconiumRuntimeError,
								time: DateTime.now().UnixTimestamp,
								debug,
								script: "zircon",
								message: zrError.message,
								code: zrError.code,
							});
						}
					}
				});
		});

		const GetPlayerOptions = Remotes.Server.Create(RemoteId.GetPlayerPermissions);
		GetPlayerOptions.SetCallback((player) => {
			const group = Registry.GetHighestPlayerGroup(player);
			if (group) {
				return group.GetPermissions();
			} else {
				Log.Write(ZirconLogLevel.Wtf, "GetPlayerPermissions", `Could not fetch permissions for player {}`, {
					Variables: [player],
				});
				return new ReadonlySet() as ReadonlyZirconPermissionSet;
			}
		});
	}
}
export = Zircon;
