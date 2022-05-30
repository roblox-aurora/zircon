import { LogEvent } from "@rbxts/log";
import { MessageTemplateParser, PlainTextMessageTemplateRenderer } from "@rbxts/message-templates";
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

	/** @deprecated */
	export const typeIs = zirconTypeIs;
	/** @deprecated */
	export const typeOf = zirconTypeOf;

	export const TypeIs = zirconTypeIs;
	export const TypeOf = zirconTypeOf;

	/**
	 * Converts a log event to a plain text string
	 * @param event The log event
	 * @returns A string representation of the log event
	 */
	export function LogEventToString(event: LogEvent): string {
		const plainTextRenderer = new PlainTextMessageTemplateRenderer(MessageTemplateParser.GetTokens(event.Template));
		return plainTextRenderer.Render(event);
	}
}

export default Zircon;
