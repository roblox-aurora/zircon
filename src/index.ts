import ZrSiO4Client from "./Client";
import ZrSiO4Server from "./Server";
import { Logging } from "Log";
export { ZirconNamespaceBuilder } from "Class/ZirconNamespaceBuilder";
export { ZirconFunctionBuilder } from "Class/ZirconFunctionBuilder";
export { ZirconEnumBuilder } from "Class/ZirconEnumBuilder";
export { ZirconConfigurationBuilder } from "Class/ZirconConfigurationBuilder";
export { default as ZirconServer } from "./Server";
export { default as ZirconClient } from "./Client";

/**
 * The Zircon console framework
 */
namespace Zircon {
	/**
	 * The client side functionalities for Zircon
	 * @deprecated Use `ZirconClient` @internal
	 */
	export const Client = ZrSiO4Client;
	/**
	 * The server side functionalities for Zircon
	 * @deprecated Use `ZirconServer` @internal
	 */
	export const Server = ZrSiO4Server;

	export const Log = Logging;
}

export default Zircon;
