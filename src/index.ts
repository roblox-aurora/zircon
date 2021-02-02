/**
 * Zircon Server Namespace
 */

import ZrSO4Log from "./Logger";
import ZrSO4Client from "./Client";
import ZrSO4Server from "./Server";

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

	/**
	 * The logging library for Zircon
	 */
	export const Log = ZrSO4Log;
}

export = Zircon;
