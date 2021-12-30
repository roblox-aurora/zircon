import ZrSiO4Client from "./Client";
import ZrSiO4Server from "./Server";
import { Logging } from "Log";
import { ZirconFunction } from "Class/ZirconFunction";
import ZrRange from "@rbxts/zirconium/out/Data/Range";
import { ZrInstanceUserdata, ZrUserdata } from "@rbxts/zirconium/out/Data/Userdata";
import ZrUndefined from "@rbxts/zirconium/out/Data/Undefined";
import ZrObject from "@rbxts/zirconium/out/Data/Object";
import { ZrEnum } from "@rbxts/zirconium/out/Data/Enum";
import { ZrEnumItem } from "@rbxts/zirconium/out/Data/EnumItem";
import { zirconTypeIs, zirconTypeOf } from "Shared/typeId";
export { ZirconNamespaceBuilder } from "Class/ZirconNamespaceBuilder";
export { ZirconFunctionBuilder } from "Class/ZirconFunctionBuilder";
export { ZirconEnumBuilder } from "Class/ZirconEnumBuilder";
export { ZirconConfigurationBuilder, ZirconDefaultGroup } from "Class/ZirconConfigurationBuilder";
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

	export const typeIs = zirconTypeIs;
	export const typeOf = zirconTypeOf;
}

export default Zircon;
