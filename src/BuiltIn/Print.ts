import ZrContext from "@rbxts/zirconium/out/Data/Context";
import { ZrValue } from "@rbxts/zirconium/out/Data/Locals";
import { ZirconFunctionDeclaration } from "Shared/Types";

const ZirconPrint: ZirconFunctionDeclaration<ZrValue[], void> = {
	Name: "print",
	Function: (context: ZrContext, ...args: ZrValue[]) => {
		const printArgs = args.map((arg) => tostring(arg)).join(" ");
		context.pushOutput(printArgs);
	},
};

export = ZirconPrint;
