import Zr from "@rbxts/zirconium";
import { ZrScriptVersion } from "@rbxts/zirconium/out/Ast/Parser";
import ZrScript from "@rbxts/zirconium/out/Runtime/Script";
import { ZrScriptCreateResult } from "@rbxts/zirconium/out/Runtime/ScriptContext";
import { GetCommandService } from "../Services";

interface stdio {
	stdout: Array<string>;
	stdin: Array<string>;
}

export interface ExecutionParams extends stdio {
	pipedOutput: boolean;
}

export namespace ZirconDispatchService {
	const globalContext = Zr.createContext("global");

	/** @internal */
	export async function ExecuteScriptGlobal(text: string) {
		return Promise.defer<ZrScript>((resolve, reject) => {
			// const source = globalContext.parseSource(text);
			// // const execution = globalContext.createScript()
			// // const execution = globalContext.createScriptFromSource(text);
			// // if (execution.result === ZrScriptCreateResult.OK) {
			// // 	resolve(execution.current);
			// // } else {
			// // 	reject(execution.errors);
			// // }
		});
	}

	export async function ExecuteScript(player: Player, text: string) {
		const Registry = GetCommandService("RegistryService");
		return Promise.defer<ZrScript>((resolve, reject) => {
			const [mainScript] = Registry.GetScriptContextsForPlayer(player);
			const source = mainScript.parseSource(text, ZrScriptVersion.Zr2022);
			if (source.isOk()) {
				resolve(mainScript.createScript(source.okValue));
			} else {
				reject(source.unwrapErr().errors);
			}
		});
	}
}
export type ZirconDispatchService = typeof ZirconDispatchService;
