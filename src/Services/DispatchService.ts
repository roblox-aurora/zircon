import Zr from "@rbxts/zirconium";
import ZrScript from "@rbxts/zirconium/out/Runtime/Script";
import { ZrScriptCreateResult } from "@rbxts/zirconium/out/Runtime/ScriptContext";
import { $dbg } from "rbxts-transform-debug";
import { GetCommandService } from "../Services";
import { ZirconRegistryService } from "./RegistryService";

interface stdio {
	stdout: Array<string>;
	stdin: Array<string>;
}

export interface ExecutionParams extends stdio {
	pipedOutput: boolean;
}

export namespace ZirconDispatchService {
	// let Registry!: ZirconRegistryService;
	// export const dependencies = ["RegistryService"];
	const globalContext = Zr.createContext("global");

	/** @internal */
	export async function ExecuteScriptGlobal(text: string) {
		return Promise.defer<ZrScript>((resolve, reject) => {
			const execution = globalContext.createScriptFromSource(text);
			if (execution.result === ZrScriptCreateResult.OK) {
				resolve(execution.current);
			} else {
				reject(execution.errors);
			}
		});
	}

	export async function ExecuteScript(player: Player, text: string) {
		const Registry = GetCommandService("RegistryService");
		$dbg(text);
		return Promise.defer<ZrScript>((resolve, reject) => {
			const [mainScript] = Registry.GetScriptContextsForPlayer(player);
			const execution = mainScript.createScriptFromSource(text);
			if (execution.result === ZrScriptCreateResult.OK) {
				resolve(execution.current);
			} else {
				reject(execution.errors);
			}
		});
	}
}
export type ZirconDispatchService = typeof ZirconDispatchService;
