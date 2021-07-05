import Roact, { InferEnumNames } from "@rbxts/roact";

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
	readonly PrimaryDisabledColor3: Color3;
	readonly SecondaryTextColor3: Color3;
	readonly ErrorTextColor3: Color3;
	readonly ServerContextColor: Color3;
	readonly IconColor3?: Color3;
	readonly ClientContextColor: Color3;
	readonly ConsoleColors: ConsoleColors;
	readonly Dock: DockOptions;
	readonly SyntaxHighlighter?: ThemeSyntaxColors;
}

export const ZirconDarkPlastic = identity<ZirconThemeDefinition>({
	IconAssetUri: "rbxassetid://6413958171",
	Font: "Ubuntu",
	ConsoleFont: "RobotoMono",
	PrimaryBackgroundColor3: Color3.fromRGB(33, 37, 43),
	PrimaryDisabledColor3: Color3.fromRGB(100, 100, 100),
	PrimaryTextColor3: Color3.fromRGB(255, 255, 255),
	SecondaryTextColor3: Color3.fromRGB(170, 170, 170),
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

export const ZirconFrost = identity<ZirconThemeDefinition>({
	IconAssetUri: "rbxassetid://6413958171",
	Font: "Ubuntu",
	ConsoleFont: "RobotoMono",
	PrimaryBackgroundColor3: Color3.fromRGB(212, 218, 212),
	PrimaryDisabledColor3: Color3.fromRGB(100, 100, 100),
	SecondaryBackgroundColor3: Color3.fromRGB(231, 229, 224),
	PrimaryTextColor3: Color3.fromRGB(33, 33, 33),
	IconColor3: Color3.fromRGB(33, 33, 33),
	SecondaryTextColor3: Color3.fromRGB(46, 46, 46),
	PrimarySelectColor3: new Color3(0.68, 0.73, 0.82),
	ErrorTextColor3: Color3.fromRGB(224, 108, 117),
	ServerContextColor: Color3.fromRGB(0, 255, 144),
	ClientContextColor: Color3.fromRGB(0, 148, 255),
	Dock: {},

	ConsoleColors: {
		Red: Color3.fromRGB(224, 108, 117),
		Yellow: Color3.fromRGB(232, 179, 77),
		Cyan: new Color3(0.19, 0.51, 0.55),
		Grey: Color3.fromRGB(90, 99, 116),
		White: Color3.fromRGB(41, 43, 43),
		Green: Color3.fromRGB(102, 148, 69),
		Orange: Color3.fromRGB(255, 135, 0),
	},
});

export const BuiltInThemes = {
	Frost: ZirconFrost,
	Plastic: ZirconDarkPlastic,
};
export type BuiltInThemes = typeof BuiltInThemes;

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
	const numeric = ((color.R * 255) << 16) | ((color.G * 255) << 8) | ((color.B * 255) << 0);
	return "#%.6X".format(numeric);
}

export function convertColorObjectToHex<T>(values: T): Color3ToHex<T> {
	const newArr: Partial<Record<keyof T, unknown>> = {};
	for (const [key, value] of pairs<typeof newArr>(values)) {
		if (typeIs(value, "Color3")) {
			const numeric = ((value.R * 255) << 16) | ((value.G * 255) << 8) | ((value.B * 255) << 0);
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

export function italicize(text: string) {
	return `<i>${text}</i>`;
}

export function makeTheme(theme: Partial<ZirconThemeDefinition>) {
	return identity<ZirconThemeDefinition>({ ...ZirconDarkPlastic, ...theme });
}

/** @deprecated */
export const ZirconTheme = makeTheme({
	Font: "Sarpanch",
	ConsoleFont: "Code",
	PrimaryBackgroundColor3: Color3.fromRGB(33, 37, 43),
	SecondaryBackgroundColor3: Color3.fromRGB(24, 26, 31),
});

const ThemeContext = Roact.createContext<ZirconThemeDefinition>(ZirconDarkPlastic);

export default ThemeContext;
