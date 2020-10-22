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
}
export type ZirconClientDispatchService = typeof ZirconClientDispatchService;
