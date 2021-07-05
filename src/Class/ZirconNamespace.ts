import { ZrObjectUserdata } from "@rbxts/zirconium/out/Data/Userdata";
import ZrPlayerScriptContext from "@rbxts/zirconium/out/Runtime/PlayerScriptContext";
import { ZirconFunction } from "./ZirconFunction";

export class ZirconNamespace {
	public constructor(private name: string, private functions: ZirconFunction<any, any>[]) {}
	/** @internal */
	public RegisterToContext(context: ZrPlayerScriptContext) {
		const functionMap = new Map<string, ZirconFunction<any, any>>();
		for (const func of this.functions) {
			functionMap.set(func.GetName(), func);
		}

		const namespaceObject = ZrObjectUserdata.fromObject(functionMap);
		context.registerGlobal(this.name, namespaceObject);
	}

	public GetName() {
		return this.name;
	}

	/** @internal */
	public ToUserdata() {
		const functionMap = new Map<string, ZirconFunction<any, any>>();
		for (const func of this.functions) {
			functionMap.set(func.GetName(), func);
		}

		return ZrObjectUserdata.fromObject(functionMap);
	}
}
