import { ZirconRegistryService } from "./RegistryService";

interface stdio {
	stdout: Array<string>;
	stdin: Array<string>;
}

export interface ExecutionParams extends stdio {
	pipedOutput: boolean;
}

export namespace ZirconDispatchService {
	let Registry!: ZirconRegistryService;
	export const dependencies = ["RegistryService"];
}
export type ZirconDispatchService = typeof ZirconDispatchService;
