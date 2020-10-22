import Net from "@rbxts/net";
import { RunService } from "@rbxts/services";
import t from "@rbxts/t";
import { RemoteId } from "../RemoteId";
import { GetCommandService } from "../Services";
import Lazy from "../Shared/Lazy";
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

	if (RunService.IsServer()) {
		const stdout = new Net.ServerEvent(RemoteId.StandardOutput);
		const stderr = new Net.ServerEvent(RemoteId.StandardError);
		const DispatchToServer = new Net.ServerEvent(RemoteId.DispatchToServer, t.string);
		DispatchToServer.Connect((player, text) => {});
	}
}
export = Zircon;
