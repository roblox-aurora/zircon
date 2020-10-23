import Roact from "@rbxts/roact";

interface IconDefinition {
	Offset: Vector2;
}

const ICONS_V2_ID = "rbxasset://icons/zirconicons.png";
const IconsV2 = {
	DownArrow: identity<IconDefinition>({ Offset: new Vector2(0, 0) }),
	UpArrow: identity<IconDefinition>({ Offset: new Vector2(16, 0) }),
	RightArrow: identity<IconDefinition>({ Offset: new Vector2(16 * 2, 0) }),
	LeftArrow: identity<IconDefinition>({ Offset: new Vector2(16 * 3, 0) }),
	Close: identity<IconDefinition>({ Offset: new Vector2(16 * 4, 0) }),
	MaximizeDown: identity<IconDefinition>({ Offset: new Vector2(16 * 5, 0) }),
	MaximizeUp: identity<IconDefinition>({ Offset: new Vector2(16 * 6, 0) }),
	Minimize: identity<IconDefinition>({ Offset: new Vector2(16 * 7, 0) }),
	TypeClass: identity<IconDefinition>({ Offset: new Vector2(0, 16) }),
	TypeMember: identity<IconDefinition>({ Offset: new Vector2(16, 16) }),
	TypeFunction: identity<IconDefinition>({ Offset: new Vector2(16 * 2, 16) }),
	TypeProperty: identity<IconDefinition>({ Offset: new Vector2(16 * 3, 16) }),
	TypeKeyword: identity<IconDefinition>({ Offset: new Vector2(16 * 4, 16) }),
	ActionExecute: identity<IconDefinition>({ Offset: new Vector2(0, 16 * 2) }),
};

export type IconEnum = keyof typeof IconsV2;

interface IconProps {
	Icon: IconEnum;
}

export default class ZirconIcon extends Roact.PureComponent<IconProps> {
	public constructor(props: IconProps) {
		super(props);
	}
	public render() {
		const icon = IconsV2[this.props.Icon];
		return (
			<imagelabel
				Size={new UDim2(0, 16, 0, 16)}
				BackgroundTransparency={1}
				Image={ICONS_V2_ID}
				ImageRectOffset={icon.Offset}
				ImageRectSize={new Vector2(16, 16)}
			/>
		);
	}
}
