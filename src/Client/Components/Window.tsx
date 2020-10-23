import Maid from "@rbxts/maid";
import Roact from "@rbxts/roact";
import Snapdragon, { SnapdragonController, SnapMargin } from "@rbxts/snapdragon";
import ZirconTitlebar, { ButtonProps, TITLEBAR_SIZE } from "./Titlebar";

interface WindowProps {
	/**
	 * Whether or not this window is draggable
	 */
	IsDraggable?: boolean;

	/**
	 * Whether or not the titlebar is enabled
	 */
	TitlebarEnabled?: boolean;

	/**
	 * The display order of this window
	 */
	DisplayOrder?: number;

	/**
	 * The title text
	 *
	 * Only shows if `TitlebarEnabled` is true.
	 */
	TitleText?: string;

	/**
	 * The position of this window
	 */
	Position?: UDim2;

	/**
	 * The size of this window
	 */
	Size?: UDim2;

	/**
	 * @deprecated Just nest a `ScrollView` in this component
	 */
	ContentType?: "Scrollable" | "Fixed";

	/**
	 * Whether or not snapping is enabled for this window
	 */
	SnapEnabled?: boolean;

	/**
	 * If true, the snap will ignore the offset set by GuiService.
	 */
	SnapIgnoresOffset?: boolean;

	/**
	 * The margin of the screen the snap adheres to
	 */
	SnapMargin?: SnapMargin;

	/**
	 * The threshold margin for snapping.
	 *
	 * The bigger it is, the more snappy the snapping gets.
	 *
	 * The value for each axis is added onto the `SnapMargin`.
	 *
	 * So a SnapMargin of {Vertical: 50, Horizontal: 50}
	 *
	 * plus a SnapThresholdMargin of {Vertical: 25, Horizontal: 25}
	 *
	 * Will case the snap to occur at {Vertical: 75, Horizontal: 75}
	 */
	SnapThresholdMargin?: SnapMargin;

	TitlebarButtons?: Array<ButtonProps>;
	TitlebarCloseAction?: () => void;

	/**
	 * @deprecated Use `SnapIgnoresOffset`
	 */
	IgnoreGuiInset?: boolean;

	/**
	 * Whether or not to wrap this in a ScreenGui.
	 *
	 * Defaults to `true`.
	 */
	NativeWindow?: boolean;

	/**
	 * The background transparency of this window
	 */
	Transparency?: number;

	/**
	 * The ZIndexBehaviour of this window, only works if `NativeWindow` is true (which it is by default)
	 */
	ZIndexBehaviour?: Enum.ZIndexBehavior;

	/**
	 * Event called when the window begins dragging
	 */
	DragBegan?: (pos: Vector3) => void;

	/**
	 * Event called when the window finishes dragging
	 */
	DragEnded?: (pos: Vector3) => void;

	// /**
	//  * @experimental
	//  * Save the position of the window
	//  */
	// SavePosition?: boolean;

	/**
	 * Event called when the position is changed
	 */
	PositionChanged?: (pos: UDim2) => void;
}
interface WindowState {}

export default class ZirconWindow extends Roact.Component<WindowProps, WindowState> {
	private dragRef = Snapdragon.createRef();
	private windowRef = Roact.createRef<Frame>();
	private dragController: SnapdragonController | undefined;
	private maid = new Maid();

	public didMount() {
		const {
			TitlebarEnabled = false,
			IsDraggable = false,
			SnapEnabled = true,
			SnapMargin,
			SnapThresholdMargin: SnapThreshold,
		} = this.props;
		const windowRef = this.windowRef.getValue();
		if (windowRef !== undefined) {
			this.dragRef.Update(windowRef);

			this.dragController = new SnapdragonController(this.dragRef, {
				SnapEnabled,
				SnapThreshold,
				SnapMargin,
			});

			if (TitlebarEnabled === false && IsDraggable === true) {
				this.dragController.Connect();

				if (this.props.DragBegan !== undefined) {
					this.maid.GiveTask(this.dragController.DragBegan.Connect(this.props.DragBegan));
				}

				if (this.props.DragEnded !== undefined) {
					this.maid.GiveTask(this.dragController.DragBegan.Connect(this.props.DragEnded));
				}
			}

			this.maid.GiveTask(this.dragController);

			this.maid.GiveTask(
				windowRef.GetPropertyChangedSignal("Position").Connect(() => {
					this.props.PositionChanged?.(windowRef.Position);
				}),
			);
		}
	}

	public render() {
		const props = this.props;
		const {
			NativeWindow = true,
			IsDraggable = false,
			TitlebarEnabled = false,
			SnapEnabled,
			SnapIgnoresOffset,
			SnapThresholdMargin,
			SnapMargin,
			ZIndexBehaviour = Enum.ZIndexBehavior.Global,
			TitlebarButtons = [],
			TitlebarCloseAction,
			DragBegan,
			DragEnded,
		} = props;

		if (TitlebarCloseAction !== undefined) {
			TitlebarButtons.push({
				Alignment: "right",
				Icon: "Close",
				OnClick: TitlebarCloseAction,
				Color: Color3.fromRGB(170, 0, 0),
			});
		}

		const childComponents = new Array<Roact.Element>();
		const children = this.props[Roact.Children];
		if (children && next(children)[0] !== undefined) {
			const frame = (
				<frame
					Size={new UDim2(1, 0, 1, TitlebarEnabled ? -TITLEBAR_SIZE : 0)}
					Position={new UDim2(0, 0, 0, TitlebarEnabled ? TITLEBAR_SIZE : 0)}
					BackgroundTransparency={1}
				>
					{children}
				</frame>
			);

			childComponents.push(frame);
		}

		if (TitlebarEnabled) {
			childComponents.push(
				<ZirconTitlebar
					SnapThresholdMargin={SnapThresholdMargin}
					SnapEnabled={SnapEnabled}
					SnapIgnoresOffset={SnapIgnoresOffset}
					SnapMargin={SnapMargin}
					Draggable={IsDraggable}
					DragBegan={DragBegan}
					DragEnded={DragEnded}
					Text={props.TitleText}
					Buttons={TitlebarButtons}
				/>,
			);
		}

		const hostFrame = (
			<frame
				Active={true}
				Size={this.props.Size ?? new UDim2(0, 200, 0, 200)}
				Position={this.props.Position}
				// BackgroundTransparency={1}
				BorderColor3={Color3.fromRGB(33, 37, 43)}
				BackgroundColor3={Color3.fromRGB(24, 26, 31)}
				Ref={this.windowRef}
			>
				{childComponents}
			</frame>
		);

		return NativeWindow ? (
			<screengui
				ZIndexBehavior={ZIndexBehaviour}
				DisplayOrder={props.DisplayOrder}
				IgnoreGuiInset={SnapIgnoresOffset}
			>
				{hostFrame}
			</screengui>
		) : (
			hostFrame
		);
	}
}
