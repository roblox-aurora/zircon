import ZrContext from "@rbxts/zirconium/out/Data/Context";
import { ZrValue } from "@rbxts/zirconium/out/Data/Locals";
import ZrLuauFunction from "@rbxts/zirconium/out/Data/LuauFunction";

export default class ZirconGroup {
	private functions = new Map<string, ZrLuauFunction>();
	public constructor(private id: number, private name: string) {}
	public GetRank() {
		return this.id;
	}

	/** @internal */
	public _registerFunction(name: string, callback: (ctx: ZrContext, ...args: readonly ZrValue[]) => ZrValue | void) {
		this.functions.set(name, new ZrLuauFunction(callback));
	}

	/** @internal */
	public _getFunctions(): ReadonlyMap<string, ZrLuauFunction> {
		return this.functions;
	}
}
