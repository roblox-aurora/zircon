import { RunService } from "@rbxts/services";
import Remotes from "../Shared/Remotes";
import { RemoteId } from "../RemoteId";
import { GetCommandService } from "../Services";
import Lazy from "../Shared/Lazy";
import { ZrRuntimeError } from "@rbxts/zirconium/out/Runtime/Runtime";
import { ParserError } from "@rbxts/zirconium-ast/out/Parser";
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

	function isParserError(err: ZrRuntimeError | ParserError): err is ParserError {
		return err.code >= 1000;
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
					print("output");
					for (const message of output) {
						StandardOutput.SendToPlayer(player, message);
					}
				})
				.catch((err: (ZrRuntimeError | ParserError)[]) => {
					print("err", err);

					for (const error of err) {
						if (isParserError(error)) {
							StandardError.SendToPlayer(player, `ParserError: ${error.message}`);
						} else {
							StandardError.SendToPlayer(player, `RuntimeError: ${error.message}`);
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
