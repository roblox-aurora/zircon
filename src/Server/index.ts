import Net from "@rbxts/net";
import { createTypeChecker } from "@rbxts/net/out/middleware";
import { RunService } from "@rbxts/services";
import t from "@rbxts/t";
import { RemoteId } from "../RemoteId";
import { GetCommandService } from "../Services";
import Lazy from "../Shared/Lazy";
const IsServer = RunService.IsServer();

type ZirconTag = string | Instance | { ToString(): string };

namespace Zircon {
	export const Registry = Lazy(() => {
		assert(IsServer, "Zircon Service only accessible on server");
		return GetCommandService("RegistryService");
	});
	export const Dispatch = Lazy(() => {
		assert(IsServer, "Zircon Service only accessible on server");
		return GetCommandService("DispatchService");
	});

	if (RunService.IsServer()) {
		const stdout = new Net.Server.Event<[], [string]>(RemoteId.StandardOutput);
		const stderr = new Net.Server.Event<[], [string]>(RemoteId.StandardError);
		const DispatchToServer = new Net.Server.Event(RemoteId.DispatchToServer, [createTypeChecker(t.string)]);
		DispatchToServer.Connect((player, text) => {});
	}
}
export = Zircon;
