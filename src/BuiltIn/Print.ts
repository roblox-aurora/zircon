import { ZirconFunctionBuilder } from "Class/ZirconFunctionBuilder";

const ZirconPrint = new ZirconFunctionBuilder("print").AddVariadicArgument("unknown").Bind((context, ...args) => {
	context.LogInfo(args.map(tostring).join(" "));
});

export = ZirconPrint;
