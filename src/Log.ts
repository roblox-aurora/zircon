import { RunService } from "@rbxts/services";
import Signal from "@rbxts/signal";
import Client from "Client";
import { ZirconLogLevel, ZirconLoggable, ZirconLogData, ZirconTag, ZirconDebugInfo } from "Client/Types";
import Server from "Server";

const logMessageSignal = new Signal<
	(level: ZirconLogLevel, tag: ZirconTag, message: string, data: ZirconLogData) => void
>();

export namespace Logger {
	type ReadonlySignal<T> = T extends (...args: any[]) => any
		? Pick<Signal<T>, "Connect">
		: T extends Signal<infer SIG>
		? Pick<Signal<SIG>, "Connect">
		: never;

	/**
	 * Signal fired when a message is logged by Zircon (using `Zircon.Log*`)
	 *
	 * This can be used to hook Zircon up to external logging (if required)
	 */
	export const LogMessage: ReadonlySignal<typeof logMessageSignal> = logMessageSignal;

	function log(
		level: ZirconLogLevel,
		tag: string | ZirconLoggable | Instance,
		message: string,
		data: ZirconLogData,
	): void;
	function log(level: ZirconLogLevel, tag: ZirconTag, message: string, data: ZirconLogData) {
		if (RunService.IsServer()) {
			Server.Log.Write(level, tostring(tag), message, data);
		} else {
			Client.Log(level, tostring(tag), message, data);
		}

		logMessageSignal.Fire(level, tag, message, data);
	}

	/**
	 * Writes a debug logging message to Zircon
	 *
	 * _Note: Only writes a message inside Studio_
	 * @param tag The tag to identify the source of this log message
	 * @param formatString The message
	 * @param formatArguments Any arguments to pass to the format string
	 */
	export function Debug(tag: ZirconTag, formatString: string, ...formatArguments: unknown[]) {
		if (RunService.IsStudio()) {
			const data = identity<ZirconLogData>({
				FormatArguments: formatArguments,
			});
			data.StackTrace ??= debug.traceback(undefined, 2).split("\n");

			const [s, l, n] = debug.info(2, "sln");
			data.CallDebugInfo = identity<ZirconDebugInfo>({
				Source: s,
				LineNumber: l,
				Name: n,
			});

			log(ZirconLogLevel.Debug, tag, formatString, data);
		}
	}

	/**
	 * Writes an information logging message to Zircon
	 * @param tag The tag to identify the source of this log message
	 * @param formatString The message
	 * @param formatArguments Any arguments to pass to the format string
	 */
	export function Info(tag: ZirconTag, message: string, ...formatArguments: unknown[]) {
		const data = identity<ZirconLogData>({
			FormatArguments: formatArguments,
		});
		data.StackTrace ??= debug.traceback(undefined, 2).split("\n");

		const [s, l, n] = debug.info(2, "sln");
		data.CallDebugInfo = identity<ZirconDebugInfo>({
			Source: s,
			LineNumber: l,
			Name: n,
		});

		log(ZirconLogLevel.Info, tag, message, data);
	}

	/**
	 * Writes a warning logging message to Zircon
	 * @param tag The tag to identify the source of this log message
	 * @param formatString The message
	 * @param formatArguments Any arguments to pass to the format string
	 */
	export function Warning(tag: ZirconTag, message: string, ...formatArguments: unknown[]) {
		const data = identity<ZirconLogData>({
			FormatArguments: formatArguments,
		});
		data.StackTrace ??= debug.traceback(undefined, 2).split("\n");

		const [s, l, n] = debug.info(2, "sln");
		data.CallDebugInfo = identity<ZirconDebugInfo>({
			Source: s,
			LineNumber: l,
			Name: n,
		});

		log(ZirconLogLevel.Warning, tag, message, data);
	}

	/**
	 * Writes an error logging message to Zircon
	 * @param tag The tag to identify the source of this log message
	 * @param formatString The message
	 * @param formatArguments Any arguments to pass to the format string
	 */
	export function Error(tag: ZirconTag, message: string, ...formatArguments: unknown[]) {
		const data = identity<ZirconLogData>({
			FormatArguments: formatArguments,
		});
		data.StackTrace ??= debug.traceback(undefined, 2).split("\n");

		const [s, l, n] = debug.info(2, "sln");
		data.CallDebugInfo = identity<ZirconDebugInfo>({
			Source: s,
			LineNumber: l,
			Name: n,
		});

		log(ZirconLogLevel.Error, tag, message, data);
	}

	/**
	 * Writes a failure logging message to Zircon
	 * @param tag The tag to identify the source of this log message
	 * @param formatString The message
	 * @param formatArguments Any arguments to pass to the format string
	 */
	export function Failure(tag: ZirconTag, message: string, ...formatArguments: unknown[]) {
		const data = identity<ZirconLogData>({
			FormatArguments: formatArguments,
		});
		data.StackTrace ??= debug.traceback(undefined, 2).split("\n");

		const [s, l, n] = debug.info(2, "sln");
		data.CallDebugInfo = identity<ZirconDebugInfo>({
			Source: s,
			LineNumber: l,
			Name: n,
		});

		log(ZirconLogLevel.Wtf, tag, message, data);
	}
}
