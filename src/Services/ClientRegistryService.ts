import { Players } from "@rbxts/services";
import ZrPlayerScriptContext from "@rbxts/zirconium/out/Runtime/PlayerScriptContext";
import ZrScriptContext from "@rbxts/zirconium/out/Runtime/ScriptContext";
import { ZirconClientConfigurationBuilder, ZirconClientScopedGlobal } from "Class/ZirconClientConfigurationBuilder";
import { ZirconEnum } from "Class/ZirconEnum";
import { ZirconFunction } from "Class/ZirconFunction";
import { ZirconNamespace } from "Class/ZirconNamespace";
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
	export function Init(configuration: ZirconClientConfigurationBuilder) {
		const conf = configuration.Build();
		for (const global of conf.Registry) {
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
