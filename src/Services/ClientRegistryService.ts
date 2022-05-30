import { Players } from "@rbxts/services";
import ZrPlayerScriptContext from "@rbxts/zirconium/out/Runtime/PlayerScriptContext";
import {
	ZirconClientConfiguration,
	ZirconClientConfigurationBuilder,
	ZirconClientScopedGlobal,
} from "Class/ZirconClientConfigurationBuilder";
import { ZirconEnum } from "Class/ZirconEnum";
import { ZirconFunction } from "Class/ZirconFunction";
import ZirconClientStore from "Client/BuiltInConsole/Store";
import { ConsoleActionName } from "Client/BuiltInConsole/Store/_reducers/ConsoleReducer";

export namespace ZirconClientRegistryService {
	const globals = new Array<ZirconClientScopedGlobal>();
	let initialized = false;
	/**
	 * Creates a scripting environment on the client for Zircon.
	 *
	 * NOTE: This is 100% insecure because it's on the client, and thus shouldn't use any elevated functions
	 * (WIP client)
	 * @param configuration
	 * @hidden @deprecated
	 */
	export function Init(configuration: ZirconClientConfiguration) {
		for (const global of configuration.Registry) {
			globals.push(global);
		}
		initialized = true;

		if (globals.size() > 0) {
			ZirconClientStore.dispatch({ type: ConsoleActionName.SetClientExecutionEnabled, enabled: true });
		}
	}

	/** @internal */
	export function GetScriptContextsForLocalPlayer() {
		const context = new ZrPlayerScriptContext(Players.LocalPlayer);
		for (const global of globals) {
			if (global instanceof ZirconFunction) {
				context.registerGlobal(global.GetName(), global);
			} else if (global instanceof ZirconEnum) {
				context.registerGlobal(global.getEnumName(), global);
			}
		}
		return context;
	}
}
export type ZirconClientRegistryService = typeof ZirconClientRegistryService;
