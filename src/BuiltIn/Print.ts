import ZrContext from "@rbxts/zirconium/out/Data/Context";
import { ZrValue } from "@rbxts/zirconium/out/Data/Locals";
import { ZrLuauArgument } from "@rbxts/zirconium/out/Data/LuauFunction";
import { ZirconFunctionDeclaration } from "Shared/Types";

const ZirconPrint: ZirconFunctionDeclaration<ZrLuauArgument[], void> = {
	Name: "print",
	Function: (context: ZrContext, ...args: ZrLuauArgument[]) => {
		const printArgs = args.map((arg) => tostring(arg)).join(" ");
		context.getOutput().write(printArgs);
	},
};

export = ZirconPrint;
