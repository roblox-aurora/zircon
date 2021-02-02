import Roact from "@rbxts/roact";

interface UIKTheme {
	IconAssetUri: string;
	Font: Enum.Font | InferEnumNames<Enum.Font>;
	ConsoleFont: Enum.Font | InferEnumNames<Enum.Font>;
	PrimaryBackgroundColor3: Color3;
	SecondaryBackgroundColor3: Color3;
	PrimaryTextColor3: Color3;
}

export const BaseTheme = identity<UIKTheme>({
	IconAssetUri: "rbxassetid://6330388012",
	Font: "Ubuntu",
	ConsoleFont: "RobotoMono",
	PrimaryBackgroundColor3: Color3.fromRGB(33, 37, 43),
	PrimaryTextColor3: Color3.fromRGB(220, 220, 220),
	SecondaryBackgroundColor3: Color3.fromRGB(24, 26, 31),
});

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
