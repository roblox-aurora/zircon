import { MessageTemplateRenderer, PropertyToken, TextToken } from "@rbxts/message-templates";
import { DestructureMode } from "@rbxts/message-templates/out/MessageTemplateToken";
import { formatRichText } from ".";

export class ZirconStructuredMessageTemplateRenderer extends MessageTemplateRenderer {
	protected RenderPropertyToken(propertyToken: PropertyToken, value: unknown): string {
		if (propertyToken.destructureMode === DestructureMode.Destructure) {
			return formatRichText(value);
		} else if (propertyToken.destructureMode === DestructureMode.ToString) {
			return tostring(value);
		} else {
			return formatRichText(value);
		}
	}
	protected RenderTextToken(textToken: TextToken): string {
		return textToken.text;
	}
}
