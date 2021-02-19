/**
 * Zircon Server Namespace
 */

import ZrSiO4Client from "./Client";
import ZrSiO4Server from "./Server";
import { ZirconLogData, ZirconLoggable, ZirconLogLevel, ZirconTag } from "./Client/Types";
import { RunService } from "@rbxts/services";
import Signal from "@rbxts/signal";

const logMessageSignal = new Signal<
	(level: ZirconLogLevel, tag: ZirconTag, message: string, data: ZirconLogData) => void
>();

/**
 * The Zircon console framework
 */
namespace Zircon {
	type ReadonlySignal<T> = T extends (...args: any[]) => any
		? Pick<Signal<T>, "Connect">
		: T extends Signal<infer SIG>
		? Pick<Signal<SIG>, "Connect">
		: never;

	/**
	 * The client side functionalities for Zircon
	 */
	export const Client = ZrSiO4Client;
	/**
	 * The server side functionalities for Zircon
	 */
	export const Server = ZrSiO4Server;

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

	export function LogDebug(tag: ZirconTag, message: string, data: ZirconLogData = {}) {
		if (RunService.IsStudio()) {
			data.StackTrace ??= debug.traceback(undefined, 2).split("\n");
			log(ZirconLogLevel.Debug, tag, message, data);
		}
	}

	export function LogInfo(tag: ZirconTag, message: string, data: ZirconLogData = {}) {
		data.StackTrace ??= debug.traceback(undefined, 2).split("\n");
		log(ZirconLogLevel.Info, tag, message, data);
	}

	export function LogWarning(tag: ZirconTag, message: string, data: ZirconLogData = {}) {
		data.StackTrace ??= debug.traceback(undefined, 2).split("\n");
		log(ZirconLogLevel.Warning, tag, message, data);
	}

	export function LogError(tag: ZirconTag, message: string, data: ZirconLogData = {}) {
		data.StackTrace ??= debug.traceback(undefined, 2).split("\n");
		log(ZirconLogLevel.Error, tag, message, data);
	}

	export function LogWtf(tag: ZirconTag, message: string, data: ZirconLogData = {}) {
		data.StackTrace ??= debug.traceback(undefined, 2).split("\n");
		log(ZirconLogLevel.Wtf, tag, message, data);
	}
}

export = Zircon;
