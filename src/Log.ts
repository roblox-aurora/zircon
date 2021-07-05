import { RunService } from "@rbxts/services";
import Client from "./Client";
import { LogEvent } from "@rbxts/log";
import { ILogEventSink } from "@rbxts/log/out/Core";
import Server from "./Server";

export namespace Logging {
	class LogEventConsoleSink implements ILogEventSink {
		Emit(message: LogEvent): void {
			if (RunService.IsServer()) {
				Server.Log.WriteStructured(message);
			} else {
				Client.StructuredLog(message);
			}
		}
	}

	export function Console() {
		return new LogEventConsoleSink();
	}
}
