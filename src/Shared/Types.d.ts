import ZrContext from "@rbxts/zirconium/out/Data/Context";
import { ZrValue } from "@rbxts/zirconium/out/Data/Locals";

export interface ZirconFunctionDeclaration<
	T extends ZrValue[] = ZrValue[],
	R extends ZrValue | undefined | void = void
> {
	Name: string;
	Function: (context: ZrContext, ...args: T) => R;
}
