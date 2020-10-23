import Maid from "@rbxts/maid";
import Roact from "@rbxts/roact";
import Snapdragon, { SnapProps } from "@rbxts/snapdragon";
import UIKTheme from "../UIKit/ThemeContext";
import ZirconIcon, { IconEnum } from "./Icon";

export interface ButtonProps {
	Size?: UDim2;
	Icon: IconEnum;
	Color?: Color3;
	HoverColor?: Color3;
	Alignment: "left" | "right";
	OnClick?: () => void;
}

interface TitlebarProps extends SnapProps {
	Draggable?: boolean;
	Buttons?: Array<ButtonProps>;
	RenderContent?: () => Roact.Element;
	Size?: UDim2;
	TextColor?: Color3;
	Text?: string;
	TextSize?: number;
	DragBegan?: (pos: Vector3) => void;
	DragEnded?: (pos: Vector3) => void;
}

export const TITLEBAR_SIZE = 30;

export default class ZirconTitlebar extends Roact.Component<TitlebarProps> {
	private dragController: Snapdragon.SnapdragonController | undefined;
	private dragRef = Snapdragon.createRef();
	private frameRef = Roact.createRef<Frame>();

	private maid = new Maid();

	public constructor(props: TitlebarProps) {
		super(props);
		this.state = {};
	}

	public didMount() {
		const frameRef = this.frameRef.getValue();
		const { Draggable } = this.props;
		if (frameRef && Draggable) {
			const { SnapEnabled, SnapMargin, SnapThresholdMargin: SnapThreshold } = this.props;
			this.dragRef.Update(frameRef);
			this.dragController = Snapdragon.createDragController(this.dragRef, {
				DragGui: frameRef.Parent! as GuiObject,
				SnapEnabled,
				SnapMargin,
				SnapThreshold,
			});
			this.dragController.Connect();

			this.maid.GiveTask(this.dragController);

			if (this.props.DragBegan !== undefined) {
				this.maid.GiveTask(this.dragController.DragEnded.Connect(this.props.DragBegan));
			}

			if (this.props.DragEnded !== undefined) {
				this.maid.GiveTask(this.dragController.DragEnded.Connect(this.props.DragEnded));
			}
		}
	}

	public willUnmount() {
		this.maid.DoCleaning();
	}

	public render() {
		const { Buttons, RenderContent } = this.props;
		const leftButtons = new Array<Roact.Element>();
		const rightButtons = new Array<Roact.Element>();

		const LeftButtons = () => {
			if (leftButtons.size() > 0) {
				return (
					<frame Size={new UDim2(0.25, 0, 1, 0)} Position={new UDim2(0, 0, 0, 0)} BackgroundTransparency={1}>
						<uilistlayout
							HorizontalAlignment={Enum.HorizontalAlignment.Left}
							FillDirection={Enum.FillDirection.Horizontal}
						/>
						{leftButtons}
					</frame>
				);
			} else {
				return Roact.createFragment({});
			}
		};

		const RightButtons = () => {
			if (rightButtons.size() > 0) {
				return (
					<frame
						Size={new UDim2(0.25, 0, 1, 0)}
						Position={new UDim2(0.75, 0, 0, 0)}
						BackgroundTransparency={1}
					>
						<uilistlayout
							HorizontalAlignment={Enum.HorizontalAlignment.Right}
							FillDirection={Enum.FillDirection.Horizontal}
						/>
						{rightButtons}
					</frame>
				);
			} else {
				return Roact.createFragment({});
			}
		};

		if (Buttons) {
			for (const button of Buttons) {
				const btn = (
					<textbutton
						Text=""
						BackgroundTransparency={1}
						Size={button.Size ?? new UDim2(0, TITLEBAR_SIZE, 0, TITLEBAR_SIZE)}
						Event={{ MouseButton1Click: button.OnClick }}
					>
						<uilistlayout VerticalAlignment="Center" HorizontalAlignment="Center" />
						<ZirconIcon Icon={button.Icon} />
					</textbutton>
				);

				if (button.Alignment === "right") {
					rightButtons.push(btn);
				} else if (button.Alignment === "left") {
					leftButtons.push(btn);
				}
			}
		}

		return (
			<UIKTheme.Consumer
				render={(value) => (
					<frame
						// BackgroundTransparency={1}
						BackgroundColor3={Color3.fromRGB(33, 37, 43)}
						BorderColor3={Color3.fromRGB(33, 37, 43)}
						Size={this.props.Size || new UDim2(1, 0, 0, TITLEBAR_SIZE)}
						Ref={this.frameRef}
					>
						<textlabel
							Text={this.props.Text !== undefined ? this.props.Text : ""}
							BackgroundTransparency={1}
							Font={value.Font}
							Size={leftButtons.size() > 0 ? new UDim2(0.5, -10, 1, 0) : new UDim2(1, -10, 1, 0)}
							TextColor3={this.props.TextColor || Color3.fromRGB(220, 220, 220)}
							TextXAlignment={
								leftButtons.size() > 0 ? Enum.TextXAlignment.Center : Enum.TextXAlignment.Left
							}
							Position={leftButtons.size() > 0 ? new UDim2(0.25, 10, 0, 0) : new UDim2(0, 10, 0, 0)}
							TextSize={this.props.TextSize !== undefined ? this.props.TextSize : 18}
						/>
						<LeftButtons />
						<RightButtons />
					</frame>
				)}
			/>
		);
	}
}
