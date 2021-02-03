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

interface UIKTheme {
	readonly IconAssetUri: string;
	readonly Font: Enum.Font | InferEnumNames<Enum.Font>;
	readonly ConsoleFont: Enum.Font | InferEnumNames<Enum.Font>;
	readonly PrimaryBackgroundColor3: Color3;
	readonly SecondaryBackgroundColor3: Color3;
	readonly PrimaryTextColor3: Color3;
	readonly ErrorTextColor3: Color3;
	readonly ServerContextColor: Color3;
	readonly ClientContextColor: Color3;
	readonly ConsoleColors: ConsoleColors;
}

export const BaseTheme = identity<UIKTheme>({
	IconAssetUri: "rbxassetid://6330388012",
	Font: "Ubuntu",
	ConsoleFont: "RobotoMono",
	PrimaryBackgroundColor3: Color3.fromRGB(33, 37, 43),
	PrimaryTextColor3: Color3.fromRGB(220, 220, 220),
	SecondaryBackgroundColor3: Color3.fromRGB(24, 26, 31),
	ErrorTextColor3: Color3.fromRGB(224, 108, 117),
	ServerContextColor: Color3.fromRGB(0, 255, 144),
	ClientContextColor: Color3.fromRGB(0, 148, 255),

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
export function getThemeRichTextColor(theme: UIKTheme, color3: Color3Keys<UIKTheme["ConsoleColors"]>) {
	const color = theme.ConsoleColors[color3];
	const numeric = ((color.r * 255) << 16) | ((color.g * 255) << 8) | ((color.b * 255) << 0);
	return "#%.6X".format(numeric);
}

export function getRichTextColor3(theme: UIKTheme, color3: Color3Keys<UIKTheme["ConsoleColors"]>, text: string) {
	return `<font color="${getThemeRichTextColor(theme, color3)}">${text}</font>`;
}

export function makeTheme(theme: Partial<UIKTheme>) {
	return identity<UIKTheme>({ ...BaseTheme, ...theme });
}

export const ZirconTheme = makeTheme({
	Font: "Sarpanch",
	ConsoleFont: "Code",
	PrimaryBackgroundColor3: Color3.fromRGB(33, 37, 43),
	SecondaryBackgroundColor3: Color3.fromRGB(24, 26, 31),
});

const UIKTheme = Roact.createContext<UIKTheme>(BaseTheme);

export default UIKTheme;
