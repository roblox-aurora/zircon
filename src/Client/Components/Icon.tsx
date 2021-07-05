import Roact from "@rbxts/roact";
import ThemeContext from "../../Client/UIKit/ThemeContext";

interface IconDefinition {
	Offset: Vector2;
	NoOverrideColor?: boolean;
	TintColor?: Color3;
}

function icon(x: number, y: number) {
	return identity<IconDefinition>({
		Offset: new Vector2(-16 + 16 * x, -16 + 16 * y),
	});
}

function tintedIcon(x: number, y: number, defaultTint: Color3) {
	return identity<IconDefinition>({
		Offset: new Vector2(-16 + 16 * x, -16 + 16 * y),
	});
}

const IconsV2 = {
	DownArrow: identity<IconDefinition>({ Offset: new Vector2(0, 0) }),
	UpArrow: identity<IconDefinition>({ Offset: new Vector2(16, 0) }),
	RightArrow: identity<IconDefinition>({ Offset: new Vector2(16 * 2, 0) }),
	LeftArrow: identity<IconDefinition>({ Offset: new Vector2(16 * 3, 0) }),
	Close: identity<IconDefinition>({ Offset: new Vector2(16 * 4, 0) }),
	MaximizeDown: identity<IconDefinition>({ Offset: new Vector2(16 * 5, 0) }),
	MaximizeUp: identity<IconDefinition>({ Offset: new Vector2(16 * 6, 0) }),
	Minimize: identity<IconDefinition>({ Offset: new Vector2(16 * 7, 0) }),
	Zirconium: identity<IconDefinition>({ Offset: new Vector2(16 * 8, 0) }),
	ActionExecute: identity<IconDefinition>({ Offset: new Vector2(0, 16 * 2) }),
	ContextClient: identity<IconDefinition>({ Offset: new Vector2(0, 16 * 3) }),
	ContextServer: identity<IconDefinition>({ Offset: new Vector2(16, 16 * 3) }),
	ActionContextClient: identity<IconDefinition>({ Offset: new Vector2(16 * 2, 16 * 3) }),
	ActionContextServer: identity<IconDefinition>({ Offset: new Vector2(16 * 3, 16 * 3) }),
	ActionTrash: identity<IconDefinition>({ Offset: new Vector2(16 * 2, 16 * 2) }),
	ActionAdd: identity<IconDefinition>({ Offset: new Vector2(16 * 3, 16 * 2) }),
	ActionElipsisMenu: identity<IconDefinition>({ Offset: new Vector2(16, 16 * 2) }),
	SplitPanels: identity<IconDefinition>({ Offset: new Vector2(16 * 4, 16 * 2) }),
	Checkmark: identity<IconDefinition>({ Offset: new Vector2(16 * 5, 16 * 2) }),

	TypeClass: tintedIcon(1, 2, Color3.fromRGB(255, 165, 0)),
	TypeMember: tintedIcon(2, 2, Color3.fromRGB(0, 148, 255)),
	TypeFunction: tintedIcon(3, 2, Color3.fromRGB(233, 0, 255)),
	TypeProperty: tintedIcon(4, 2, Color3.fromRGB(216, 216, 216)),
	TypeKeyword: tintedIcon(5, 2, Color3.fromRGB(216, 216, 216)),

	Folder: icon(3, 5),
	FloppyDisk: icon(4, 5),
	Infinity: icon(1, 5),
	Sun: icon(2, 5),
	RightDoubleArrow: icon(5, 5),
	LeftDoubleArrow: icon(6, 5),
	UpDoubleArrow: icon(7, 5),
	DownDoubleArrow: icon(8, 5),
	Gear: icon(9, 5),
	Paper: icon(1, 6),

	Funnel: icon(8, 3),
	ListClear: icon(9, 3),

	CheckmarkHeavy: icon(1, 9),
	CrossHeavy: icon(2, 9),
	Square: icon(3, 9),
	Diamond: icon(4, 9),
	Circle: icon(5, 9),
	OuterSquare: icon(6, 9),
};

export type IconEnum = keyof typeof IconsV2;

interface IconProps {
	Icon: IconEnum;
	Position?: UDim2;
}

export default class ZirconIcon extends Roact.PureComponent<IconProps> {
	public constructor(props: IconProps) {
		super(props);
	}
	public render() {
		const icon = IconsV2[this.props.Icon];
		return (
			<ThemeContext.Consumer
				render={(theme) => {
					return (
						<imagelabel
							Size={new UDim2(0, 16, 0, 16)}
							BackgroundTransparency={1}
							Image={theme.IconAssetUri}
							ImageColor3={theme.IconColor3}
							ImageRectOffset={icon.Offset}
							Position={this.props.Position}
							ImageRectSize={new Vector2(16, 16)}
						/>
					);
				}}
			/>
		);
	}
}

interface IconButtonProps extends IconProps {
	OnClick: () => void;
	Position?: UDim2;
	Floating?: boolean;
	Size?: UDim2;
}
export function ZirconIconButton({ Icon, OnClick, Position, Size, Floating }: IconButtonProps) {
	return (
		<ThemeContext.Consumer
			render={(theme) => {
				return (
					<imagebutton
						Image=""
						Position={Position}
						Event={{ MouseButton1Down: OnClick }}
						BackgroundTransparency={Floating ? 0 : 1}
						BackgroundColor3={theme.PrimaryBackgroundColor3}
						BorderColor3={theme.SecondaryBackgroundColor3}
						Size={Size ?? new UDim2(0, 20, 0, 20)}
					>
						<uilistlayout VerticalAlignment="Center" HorizontalAlignment="Center" />
						<ZirconIcon Icon={Icon} />
					</imagebutton>
				);
			}}
		/>
	);
}
