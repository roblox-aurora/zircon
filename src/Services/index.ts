import t from "@rbxts/t";
import Lazy from "../Shared/Lazy";
import TSRequire from "../Shared/tsImportShim";
import { ZirconClientDispatchService } from "./ClientDispatchService";
import { ZirconClientRegistryService } from "./ClientRegistryService";
import { ZirconDispatchService } from "./DispatchService";
import { ZirconRegistryService } from "./RegistryService";
const IS_SERVER = game.GetService("RunService").IsServer();

interface ServiceMap {
	RegistryService: ZirconRegistryService;
	DispatchService: ZirconDispatchService;
	ClientDispatchService: ZirconClientDispatchService;
	ClientRegistryService: ZirconClientRegistryService;
}

export type ServerDependencies = Array<keyof ServiceMap>;

const HasDependencyInjection = t.interface({
	dependencies: t.array(t.string),
	LoadDependencies: t.callback,
});

const serviceMap = new Map<string, ServiceMap[keyof ServiceMap]>();
const serviceLoading = new Set<string>();

function GetServiceInt<K extends keyof ServiceMap>(service: K, importingFrom?: keyof ServiceMap): ServiceMap[K] {
	if (serviceLoading.has(service)) {
		throw `Cyclic service dependency ${importingFrom}<->${service}`;
	}

	let svcImport = serviceMap.get(service);
	if (svcImport === undefined) {
		serviceLoading.add(service);

		// eslint-disable-next-line @typescript-eslint/no-var-requires
		// const serviceMaster = require(script.FindFirstChild(service) as ModuleScript) as Map<string, ServiceMap[K]>;

		const serviceMaster = TSRequire(service) as Map<string, ServiceMap[K]>;

		const importId = IS_SERVER ? `Zircon${service}` : `ZirconClient${service}`;
		svcImport = serviceMaster.get(importId) as ServiceMap[K];
		if (svcImport === undefined) {
			throw `Tried importing service: ${service}, but no matching ${importId} declaration.`;
		}
		serviceMap.set(service, svcImport);

		if (HasDependencyInjection(svcImport)) {
			const dependencies = new Array<defined>();
			for (const dependency of svcImport.dependencies) {
				dependencies.push(Lazy(() => GetServiceInt(dependency as keyof ServiceMap, service)));
			}

			svcImport.LoadDependencies(...dependencies);
		}

		serviceLoading.delete(service);
		return svcImport as ServiceMap[K];
	} else {
		return svcImport as ServiceMap[K];
	}
}

/**
 * Synchronously imports the service
 * @rbxts server
 * @internal
 * @param service The service name
 */
export function GetCommandService<K extends keyof ServiceMap>(service: K): ServiceMap[K] {
	return GetServiceInt(service);
}
