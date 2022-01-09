import { Logging } from "Log";
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
	export const Log = Logging;

	export const typeIs = zirconTypeIs;
	export const typeOf = zirconTypeOf;
}

export default Zircon;
