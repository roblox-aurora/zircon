import Roact from "@rbxts/roact";

interface UIKTheme {
	Font: Enum.Font | InferEnumNames<Enum.Font>;
}

export const BaseTheme = identity<UIKTheme>({
	Font: "Ubuntu",
});

export const ZirconTheme = identity<UIKTheme>({
	Font: "Sarpanch",
});

const UIKTheme = Roact.createContext<UIKTheme>(BaseTheme);

export default UIKTheme;
