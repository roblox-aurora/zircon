import { MessageTemplateParser, TemplateTokenKind } from "@rbxts/message-templates";
import t from "@rbxts/t";
import ZrTextStream from "@rbxts/zirconium/out/Ast/TextStream";
import { getRichTextColor3, ZirconTheme, ZirconThemeDefinition } from "Client/UIKit/ThemeContext";
interface PlainTextToken {
	Type: "Text";
	Value: string;
}
interface VariableToken {
	Type: "Variable";
	Value: string;
}
type FormatToken = PlainTextToken | VariableToken;
export function formatParse(formatString: string) {
	const tokens = new Array<FormatToken>();
	const stream = new ZrTextStream(formatString);
	const isNotEndVarBracket = (c: string) => c !== "}";

	/**
	 * Reads while the specified condition is met, or the end of stream
	 */
	function readWhile(condition: (str: string) => boolean) {
		let src = "";
		while (stream.hasNext() === true && condition(stream.peek()) === true) {
			src += stream.next();
		}
		return src;
	}

	let str = "";
	while (stream.hasNext()) {
		const char = stream.next();
		if (char === "{") {
			tokens.push(
				identity<PlainTextToken>({
					Type: "Text",
					Value: str,
				}),
			);
			str = "";
			const variable = readWhile(isNotEndVarBracket);
			tokens.push(
				identity<VariableToken>({
					Type: "Variable",
					Value: variable,
				}),
			);
			stream.next();
		} else {
			str += char;
		}
	}

	if (str !== "") {
		tokens.push(
			identity<PlainTextToken>({
				Type: "Text",
				Value: str,
			}),
		);
	}

	return tokens;
}

const isArray = t.array(t.any);
const isMap = t.map(t.string, t.any);

export function formatRichText(value: unknown, level = 1, theme: ZirconThemeDefinition): string {
	if (typeIs(value, "string")) {
		return getRichTextColor3(theme, "Green", `${value}`);
	} else if (typeIs(value, "number") || typeIs(value, "boolean")) {
		return getRichTextColor3(theme, "Cyan", tostring(value));
	} else if (isArray(value)) {
		if (level > 1) {
			return getRichTextColor3(theme, "Grey", `[...]`);
		} else {
			return getRichTextColor3(
				ZirconTheme,
				"Grey",
				`[${value.map((v) => formatRichText(v, level + 1, theme)).join(", ")}]`,
			);
		}
	} else if (isMap(value)) {
		if (level > 1) {
			return getRichTextColor3(theme, "Grey", `{...}`);
		} else {
			const arr = new Array<string>();
			for (const [k, v] of value) {
				arr.push(`${getRichTextColor3(theme, "White", k)}: ${formatRichText(v, level + 1, theme)}`);
			}
			return getRichTextColor3(theme, "Grey", `{${arr.join(", ")}}`);
		}
	} else if (typeIs(value, "Instance")) {
		return getRichTextColor3(theme, "Orange", `${value.GetFullName()}`);
	} else if (value === undefined) {
		return getRichTextColor3(theme, "Cyan", "undefined");
	} else {
		return getRichTextColor3(theme, "Yellow", `<${tostring(value)}>`);
	}
}

function formatPlainText(value: unknown, level = 1): string {
	if (typeIs(value, "string") || typeIs(value, "number") || typeIs(value, "boolean")) {
		return tostring(value);
	} else if (isArray(value)) {
		if (level > 1) {
			return `[...]`;
		} else {
			return `[${value.map((v) => formatPlainText(v, level + 1)).join(", ")}]`;
		}
	} else if (isMap(value)) {
		if (level > 1) {
			return `{...}`;
		} else {
			const arr = new Array<string>();
			for (const [k, v] of value) {
				arr.push(`${k}: ${formatPlainText(v, level + 1)}`);
			}
			return `{${arr.join(", ")}}`;
		}
	} else if (typeIs(value, "Instance")) {
		return value.GetFullName();
	} else if (value === undefined) {
		return "undefined";
	} else {
		return tostring(value);
	}
}

export function formatTokensPlain(tokens: ReadonlyArray<FormatToken>, vars: unknown[]) {
	let resultingStr = "";
	let idxOffset = 0;
	for (const token of tokens) {
		if (token.Type === "Text") {
			resultingStr += token.Value;
		} else if (token.Type === "Variable") {
			if (token.Value === "") {
				if (idxOffset > vars.size()) {
					resultingStr += `{${token.Value}}`;
				} else {
					resultingStr += formatPlainText(vars[idxOffset]);
					idxOffset += 1;
				}
			}
		}
	}
	return resultingStr;
}

export function formatMessageTemplate(template: string, values: Record<string, defined>) {
	const tokens = MessageTemplateParser.GetTokens(template);
	for (const token of tokens) {
		if (token.kind === TemplateTokenKind.Property) {
			const value = values[token.propertyName];
			return formatRichText(value, undefined, ZirconTheme);
		}
	}
}

export function formatTokens(tokens: ReadonlyArray<FormatToken>, vars: unknown[]) {
	let resultingStr = "";
	let idxOffset = 0;
	for (const token of tokens) {
		if (token.Type === "Text") {
			resultingStr += token.Value;
		} else if (token.Type === "Variable") {
			if (token.Value === "") {
				if (idxOffset > vars.size()) {
					resultingStr += getRichTextColor3(ZirconTheme, "Red", `{${token.Value}}`);
				} else {
					resultingStr += formatRichText(vars[idxOffset], undefined, ZirconTheme);
					idxOffset += 1;
				}
			}
		}
	}
	return resultingStr;
}
