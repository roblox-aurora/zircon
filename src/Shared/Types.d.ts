import ZrContext from "@rbxts/zirconium/out/Data/Context";
import { ZrValue } from "@rbxts/zirconium/out/Data/Locals";
import { ZrLuauArgument } from "@rbxts/zirconium/out/Data/LuauFunction";
import ZrUndefined from "@rbxts/zirconium/out/Data/Undefined";

export interface ZirconFunctionDeclaration<
	T extends ZrLuauArgument[] = ZrLuauArgument[],
	R extends ZrValue | undefined | void = void
> {
	Name: string;
	Function: (context: ZrContext, ...args: T) => R;
}
