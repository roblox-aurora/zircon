/**
 * Zircon Server Namespace
 */

import ZrSO4Client from "./Client";
import ZrSO4Server from "./Server";
import { ZirconContext, ZirconLoggable, ZirconLogLevel, ZirconTag } from "./Client/Types";
import { RunService } from "@rbxts/services";

/**
 * The Zircon Framework
 */
namespace Zircon {
	/**
	 * The client side functionalities for Zircon
	 */
	export const Client = ZrSO4Client;
	/**
	 * The server side functionalities for Zircon
	 */
	export const Server = ZrSO4Server;

	function log(
		level: ZirconLogLevel,
		tag: string | ZirconLoggable | Instance,
		message: string,
		data?: Record<string, defined>,
	): void;
	function log(level: ZirconLogLevel, tag: ZirconTag, message: string, data?: Record<string, defined>) {
		if (RunService.IsServer()) {
			Server.Log.Write(level, tostring(tag), message, data);
		} else {
			Client.Log(level, tostring(tag), message, data);
		}
	}

	export function LogDebug(tag: ZirconTag, message: string) {
		if (RunService.IsStudio()) {
			log(ZirconLogLevel.Debug, tag, message);
		}
	}

	export function LogInfo(tag: ZirconTag, message: string) {
		log(ZirconLogLevel.Info, tag, message);
	}

	export function LogWarning(tag: ZirconTag, message: string) {
		log(ZirconLogLevel.Warning, tag, message);
	}

	export function LogError(tag: ZirconTag, message: string) {
		log(ZirconLogLevel.Error, tag, message);
	}

	export function LogWtf(tag: ZirconTag, message: string) {
		log(ZirconLogLevel.Wtf, tag, message);
	}
}

export = Zircon;
