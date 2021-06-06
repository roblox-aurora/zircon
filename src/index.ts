/**
 * Zircon Server Namespace
 */

import ZrSiO4Client from "./Client";
import ZrSiO4Server from "./Server";
import { ZrValue } from "@rbxts/zirconium/out/Data/Locals";
import { Logger } from "Log";
import ZrUndefined from "@rbxts/zirconium/out/Data/Undefined";

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
	export type Argument = ZrValue | ZrUndefined;
	/**
	 * A value type for Zircon functions
	 */
	export type Value = ZrValue;
}

export = Zircon;
