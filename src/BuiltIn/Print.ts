import { LogLevel } from "@rbxts/log";
import { RunService } from "@rbxts/services";
import { ZirconFunctionBuilder } from "Class/ZirconFunctionBuilder";
import Server from "../Server";

const ZirconPrint = new ZirconFunctionBuilder("print").AddVariadicArgument("unknown").Bind((_, ...args) => {
	if (RunService.IsServer()) {
		Server.Log.WriteStructured({
			SourceContext: "ZirconPrint",
			Template: "{PrintData}",
			PrintData: args,
			Level: LogLevel.Information,
			Timestamp: DateTime.now().ToIsoDate(),
		});
	}
});

export = ZirconPrint;
