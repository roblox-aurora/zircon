/**
 * Zircon Server Namespace
 */

import ZrSiO4Client from "./Client";
import ZrSiO4Server from "./Server";
import { ZirconDebugInfo, ZirconLogData, ZirconLoggable, ZirconLogLevel, ZirconTag } from "./Client/Types";
import { RunService } from "@rbxts/services";
import Signal from "@rbxts/signal";
import { ZrValue } from "@rbxts/zirconium/out/Data/Locals";
import ZirconFunction from "Server/Class/ZirconFunction";
import { Logger } from "Log";

/**
 * The Zircon console framework
 */
namespace Zircon {
	/**
	 * The client side functionalities for Zircon
	 */
	export const Client = ZrSiO4Client;
	/**
	 * The server side functionalities for Zircon
	 */
	export const Server = ZrSiO4Server;

	export const Log = Logger;

	/**
	 * A function argument for Zircon functions
	 */
	export type Argument = ZrValue;
	/**
	 * A value type for Zircon functions
	 */
	export type Value = ZrValue;
}

export = Zircon;
