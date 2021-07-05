import { LogLevel } from "@rbxts/log";
import { RunService } from "@rbxts/services";
import { ZirconFunctionBuilder } from "Class/ZirconFunctionBuilder";
import { Server } from "index";

const ZirconPrint = new ZirconFunctionBuilder("print").Bind((_, ...args) => {
	if (RunService.IsServer()) {
		Server.Log.WriteStructured({
			Template: "{PrintData}",
			PrintData: args,
			Level: LogLevel.Information,
			Timestamp: DateTime.now().ToIsoDate(),
		});
	}
});

export = ZirconPrint;
