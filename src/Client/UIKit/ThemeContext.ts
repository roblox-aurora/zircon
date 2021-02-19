import Roact from "@rbxts/roact";

interface ConsoleColors {
	readonly Yellow: Color3;
	readonly Cyan: Color3;
	readonly Grey: Color3;
	readonly White: Color3;
	readonly Orange: Color3;
	readonly Green: Color3;
	readonly Red: Color3;
}

export interface ThemeSyntaxColors {
	VariableColor: Color3 | string;
	KeywordColor: Color3 | string;
	NumberColor: Color3 | string;
	StringColor: Color3 | string;
	OperatorColor: Color3 | string;
	CommentColor?: Color3 | string;
	BooleanLiteral?: Color3 | string;
	ControlCharacters: Color3 | string;
}

interface DockOptions {
	Transparency?: number;
}

export interface ZirconThemeDefinition {
	readonly IconAssetUri: string;
	readonly Font: Enum.Font | InferEnumNames<Enum.Font>;
	readonly ConsoleFont: Enum.Font | InferEnumNames<Enum.Font>;
	readonly PrimaryBackgroundColor3: Color3;
	readonly SecondaryBackgroundColor3: Color3;
	readonly PrimarySelectColor3: Color3;
	readonly PrimaryTextColor3: Color3;
	readonly ErrorTextColor3: Color3;
	readonly ServerContextColor: Color3;
	readonly ClientContextColor: Color3;
	readonly ConsoleColors: ConsoleColors;
	readonly Dock: DockOptions;
	readonly SyntaxHighlighter?: ThemeSyntaxColors;
}

export const BaseTheme = identity<ZirconThemeDefinition>({
	IconAssetUri: "rbxassetid://6413958171",
	Font: "Ubuntu",
	ConsoleFont: "RobotoMono",
	PrimaryBackgroundColor3: Color3.fromRGB(33, 37, 43),
	PrimaryTextColor3: Color3.fromRGB(255, 255, 255),
	SecondaryBackgroundColor3: Color3.fromRGB(24, 26, 31),
	PrimarySelectColor3: Color3.fromRGB(53, 57, 64),
	ErrorTextColor3: Color3.fromRGB(224, 108, 117),
	ServerContextColor: Color3.fromRGB(0, 255, 144),
	ClientContextColor: Color3.fromRGB(0, 148, 255),
	Dock: {},

	ConsoleColors: {
		Red: Color3.fromRGB(224, 108, 117),
		Yellow: Color3.fromRGB(229, 192, 123),
		Cyan: Color3.fromRGB(86, 182, 194),
		Grey: Color3.fromRGB(90, 99, 116),
		White: Color3.fromRGB(220, 223, 228),
		Green: Color3.fromRGB(152, 195, 121),
		Orange: Color3.fromRGB(255, 135, 0),
	},
});

type Color3Keys<T> = { [P in keyof T]: T[P] extends Color3 ? P & string : never }[keyof T];
type Color3ToHex<T> = {
	[P in keyof T]: T[P] extends Color3 | string
		? string
		: T[P] extends Color3 | string | undefined
		? string | undefined
		: T[P];
};
export function getThemeRichTextColor(
	theme: ZirconThemeDefinition,
	color3: Color3Keys<ZirconThemeDefinition["ConsoleColors"]>,
) {
	const color = theme.ConsoleColors[color3];
	const numeric = ((color.r * 255) << 16) | ((color.g * 255) << 8) | ((color.b * 255) << 0);
	return "#%.6X".format(numeric);
}

export function convertColorObjectToHex<T>(values: T): Color3ToHex<T> {
	const newArr: Partial<Record<keyof T, unknown>> = {};
	for (const [key, value] of pairs(values)) {
		if (typeIs(value, "Color3")) {
			const numeric = ((value.r * 255) << 16) | ((value.g * 255) << 8) | ((value.b * 255) << 0);
			newArr[key] = "#%.6X".format(numeric);
		}
	}
	return newArr as Color3ToHex<T>;
}

export function getRichTextColor3(
	theme: ZirconThemeDefinition,
	color3: Color3Keys<ZirconThemeDefinition["ConsoleColors"]>,
	text: string,
) {
	return `<font color="${getThemeRichTextColor(theme, color3)}">${text}</font>`;
}

export function makeTheme(theme: Partial<ZirconThemeDefinition>) {
	return identity<ZirconThemeDefinition>({ ...BaseTheme, ...theme });
}

export const ZirconTheme = makeTheme({
	Font: "Sarpanch",
	ConsoleFont: "Code",
	PrimaryBackgroundColor3: Color3.fromRGB(33, 37, 43),
	SecondaryBackgroundColor3: Color3.fromRGB(24, 26, 31),
});

const ThemeContext = Roact.createContext<ZirconThemeDefinition>(BaseTheme);

export default ThemeContext;
