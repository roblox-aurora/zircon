import { RemoteId } from "../RemoteId";
import Remotes from "../Shared/Remotes";
import { ZirconClientRegistryService } from "./ClientRegistryService";

export enum DispatchContext {
	Server,

	/** @internal */
	Client,
}

export namespace ZirconClientDispatchService {
	let Registry!: ZirconClientRegistryService;

	/** @internal */
	export const dependencies = ["ClientRegistryService"];

	const DispatchToServer = Remotes.Client.WaitFor(RemoteId.DispatchToServer).expect();
	export function Dispatch(input: string) {
		DispatchToServer.SendToServer(input);
	}

	export const StandardOutput = Remotes.Server.Create(RemoteId.StandardOutput);
	export const StandardError = Remotes.Server.Create(RemoteId.StandardError);
}
export type ZirconClientDispatchService = typeof ZirconClientDispatchService;
