import { RunService } from "@rbxts/services";
import Signal from "@rbxts/signal";
import Client from "Client";
import { ZirconLogLevel, ZirconLogData, ZirconTag } from "Client/Types";
import Server from "Server";
import { LogEvent } from "@rbxts/log";
import { ILogEventSink } from "@rbxts/log/out/Core";

const logMessageSignal = new Signal<
	(level: ZirconLogLevel, tag: ZirconTag, message: string, data: ZirconLogData) => void
>();

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
