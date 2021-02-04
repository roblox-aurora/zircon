import { RunService } from "@rbxts/services";
import Remotes, { ZirconDebugInformation } from "../Shared/Remotes";
import { RemoteId } from "../RemoteId";
import { GetCommandService } from "../Services";
import Lazy from "../Shared/Lazy";
import { ZrRuntimeError } from "@rbxts/zirconium/out/Runtime/Runtime";
import { ZrParserError } from "@rbxts/zirconium-ast/out/Parser";
import { Token } from "@rbxts/zirconium-ast/out/Tokens/Tokens";
import { $dbg } from "rbxts-transform-debug";
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

	/** @internal */
	export const Definitions = Lazy(() => {
		// return ZrSO4Definitions;
	});

	function isParserError(err: ZrRuntimeError | ZrParserError): err is ZrParserError {
		return err.code >= 1000;
	}

	function getTokenInformation(source: string, token: Token) {
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

	function getLineAndColumn(source: string, token: Token): [line: number, column: number] | undefined {
		let col = 0;
		let row = 1;
		for (let i = 0; i < source.size(); i++) {
			const char = source.sub(i + 1, i + 1);

			if (i === token.startPos) {
				return [row, col];
			}

			if (char === "\n") {
				row += 1;
				col = 1;
			} else {
				col += 1;
			}
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
							type: "ExecutionOutput",
							time: DateTime.now().UnixTimestamp,
							script: "zircon",
							message,
						});
					}
				})
				.catch((err: (ZrRuntimeError | ZrParserError)[]) => {
					print("err", err);

					for (const error of err) {
						if (isParserError(error)) {
							const lineAndColumn = error.token ? getLineAndColumn(message, error.token) : undefined;
							const debug = error.token ? getTokenInformation(message, error.token) : undefined;

							StandardError.SendToPlayer(player, {
								type: "ParserError",
								script: "zircon",
								time: DateTime.now().UnixTimestamp,
								source: debug ? debug.LineAndColumn : undefined,
								debug,
								message: error.message,
								code: error.code,
							});
						} else {
							StandardError.SendToPlayer(player, {
								type: "RuntimeError",
								time: DateTime.now().UnixTimestamp,
								script: "zircon", // come the fuck on
								// source: error.node
								// 	? ([error.node.startPos ?? 0, error.node.endPos ?? 0] as const)
								// 	: undefined,
								message: error.message,
								code: error.code,
							});
						}
					}
				});
		});

		const GetPlayerOptions = Remotes.Server.Create(RemoteId.GetPlayerOptions);
		GetPlayerOptions.SetCallback(() => {
			return {};
		});
	}
}
export = Zircon;
