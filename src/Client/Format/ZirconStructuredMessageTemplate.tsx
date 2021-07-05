import { MessageTemplateRenderer, PropertyToken, TextToken } from "@rbxts/message-templates";
import { DestructureMode, Token } from "@rbxts/message-templates/out/MessageTemplateToken";
import { ZirconThemeDefinition } from "Client/UIKit/ThemeContext";
import { formatRichText } from ".";

export class ZirconStructuredMessageTemplateRenderer extends MessageTemplateRenderer {
	public constructor(tokens: Token[], private theme: ZirconThemeDefinition) {
		super(tokens);
	}

	protected RenderPropertyToken(propertyToken: PropertyToken, value: unknown): string {
		if (propertyToken.destructureMode === DestructureMode.Destructure) {
			return formatRichText(value, undefined, this.theme);
		} else if (propertyToken.destructureMode === DestructureMode.ToString) {
			return tostring(value);
		} else {
			return formatRichText(value, undefined, this.theme);
		}
	}
	protected RenderTextToken(textToken: TextToken): string {
		return textToken.text;
	}
}
