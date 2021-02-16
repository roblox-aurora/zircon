type PaddingResult = Pick<UIPadding, "PaddingTop" | "PaddingBottom" | "PaddingLeft" | "PaddingRight">;
type PaddingOffset = {
	[P in keyof PaddingResult]: number;
};

type PaddingAxisOffset = { PaddingHorizontal?: number; PaddingVertical?: number };

export type WidgetPadding = Partial<PaddingOffset> | PaddingAxisOffset | number;
export type WidgetAxisPadding = PaddingAxisOffset | number;

export function CalculatePaddingUDim2(padding: WidgetAxisPadding): UDim2 {
	if (typeIs(padding, "number")) {
		return new UDim2(0, padding, 0, padding);
	} else if ("PaddingHorizontal" in padding || "PaddingVertical" in padding) {
		const { PaddingHorizontal = 0, PaddingVertical = 0 } = padding;
		return new UDim2(0, PaddingHorizontal, 0, PaddingVertical);
	}

	throw `Invalid argument to CalculatePadding`;
}

export function CalculatePadding(padding: WidgetPadding): Partial<PaddingResult> {
	if (typeIs(padding, "number")) {
		return {
			PaddingBottom: new UDim(0, padding),
			PaddingLeft: new UDim(0, padding),
			PaddingRight: new UDim(0, padding),
			PaddingTop: new UDim(0, padding),
		};
	} else if ("PaddingHorizontal" in padding || "PaddingVertical" in padding) {
		const { PaddingHorizontal = 0, PaddingVertical = 0 } = padding;
		return {
			PaddingBottom: new UDim(0, PaddingVertical),
			PaddingLeft: new UDim(0, PaddingHorizontal),
			PaddingRight: new UDim(0, PaddingHorizontal),
			PaddingTop: new UDim(0, PaddingVertical),
		};
	} else if (
		"PaddingLeft" in padding ||
		"PaddingRight" in padding ||
		"PaddingTop" in padding ||
		"PaddingBottom" in padding
	) {
		const { PaddingBottom = 0, PaddingTop = 0, PaddingLeft = 0, PaddingRight = 0 } = padding;
		return {
			PaddingBottom: new UDim(0, PaddingBottom),
			PaddingLeft: new UDim(0, PaddingLeft),
			PaddingRight: new UDim(0, PaddingRight),
			PaddingTop: new UDim(0, PaddingTop),
		};
	}

	return {
		PaddingBottom: new UDim(0, 0),
		PaddingLeft: new UDim(0, 0),
		PaddingRight: new UDim(0, 0),
		PaddingTop: new UDim(0, 0),
	};
}

import Roact from "@rbxts/roact";

interface Padding {
	Left?: number;
	Top?: number;
	Right?: number;
	Bottom?: number;
	Vertical?: number;
	Horizontal?: number;
}
export interface PaddingProps {
	Padding: Padding;
}
export default function Padding({
	Padding: { Left = 0, Right = 0, Top = 0, Bottom = 0, Vertical = 0, Horizontal = 0 },
}: PaddingProps) {
	return (
		<uipadding
			PaddingBottom={new UDim(0, Bottom + Vertical)}
			PaddingTop={new UDim(0, Top + Vertical)}
			PaddingRight={new UDim(0, Right + Horizontal)}
			PaddingLeft={new UDim(0, Left + Horizontal)}
		/>
	);
}
