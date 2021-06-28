import { LogLevel, StructuredMessage } from "@rbxts/log/out/Configuration";
import { RunService } from "@rbxts/services";
import Signal from "@rbxts/signal";
import Client from "Client";
import { ZirconLogLevel, ZirconLoggable, ZirconLogData, ZirconTag, ZirconDebugInfo } from "Client/Types";
import Server from "Server";
import { MessageTemplateParser } from "@rbxts/message-templates/out/MessageTemplateParser";
import { MessageTemplateRenderer, PropertyToken, TextToken } from "@rbxts/message-templates";
import { DestructureMode } from "@rbxts/message-templates/out/MessageTemplateToken";

const logMessageSignal = new Signal<
	(level: ZirconLogLevel, tag: ZirconTag, message: string, data: ZirconLogData) => void
>();

export namespace Logging {
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

	function GetLogLevel(logLevel: LogLevel) {
		switch (logLevel) {
			case LogLevel.Verbose:
				return ZirconLogLevel.Verbose;
			case LogLevel.Debugging:
				return ZirconLogLevel.Debug;
			case LogLevel.Information:
				return ZirconLogLevel.Info;
			case LogLevel.Warning:
				return ZirconLogLevel.Warning;
			case LogLevel.Error:
				return ZirconLogLevel.Error;
			case LogLevel.Fatal:
				return ZirconLogLevel.Wtf;
		}
	}

	export const ZirconTag = (message: StructuredMessage) => {
		const [n, s] = debug.info(5, "ns");
		// eslint-disable-next-line roblox-ts/lua-truthiness
		message.Source = s;
		message.ZirconTag = n;
	};

	export function Console() {
		return (message: StructuredMessage) => {
			if (RunService.IsServer()) {
				Server.Log.WriteStructured(message);
			} else {
				Client.StructuredLog(message);
			}
		};
	}

	const warned = new Set<string>();
	function warnOnce(...args: string[]) {
		const trace = debug.traceback();
		if (!warned.has(trace)) {
			warned.add(trace);
			warn(...args);
		}
	}

	/**
	 * Writes a debug logging message to Zircon
	 *
	 * _Note: Only writes a message inside Studio_
	 * @param tag The tag to identify the source of this log message
	 * @param formatString The message
	 * @param formatArguments Any arguments to pass to the format string
	 * @deprecated Use `@rbxts/log`
	 */
	export function Debug(tag: ZirconTag, formatString: string, ...formatArguments: unknown[]) {
		if (RunService.IsStudio()) {
			warnOnce("Zircon.Log.Debug is deprecated, use @rbxts/log!");
			const data = identity<ZirconLogData>({
				Variables: formatArguments,
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
	 * @deprecated Use `@rbxts/log`
	 */
	export function Info(tag: ZirconTag, message: string, ...formatArguments: unknown[]) {
		warnOnce("Zircon.Log.Info is deprecated, use @rbxts/log!");
		const data = identity<ZirconLogData>({
			Variables: formatArguments,
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
	 * @deprecated Use `@rbxts/log`
	 */
	export function Warning(tag: ZirconTag, message: string, ...formatArguments: unknown[]) {
		warnOnce("Zircon.Log.Warning is deprecated, use @rbxts/log!");
		const data = identity<ZirconLogData>({
			Variables: formatArguments,
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
	 * @deprecated Use `@rbxts/log`
	 */
	export function Error(tag: ZirconTag, message: string, ...formatArguments: unknown[]) {
		warnOnce("Zircon.Log.Error is deprecated, use @rbxts/log!");
		const data = identity<ZirconLogData>({
			Variables: formatArguments,
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
	 * @deprecated Use `@rbxts/log`
	 */
	export function Failure(tag: ZirconTag, message: string, ...formatArguments: unknown[]) {
		warnOnce("Zircon.Log.Failure is deprecated, use @rbxts/log!");
		const data = identity<ZirconLogData>({
			Variables: formatArguments,
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
