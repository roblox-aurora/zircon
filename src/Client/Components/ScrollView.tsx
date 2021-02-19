import Maid from "@rbxts/maid";
import Roact from "@rbxts/roact";
import ThemeContext from "../../Client/UIKit/ThemeContext";
import delayAsync from "../BuiltInConsole/DelayAsync";
import ZirconIcon from "./Icon";
import { CalculatePadding, CalculatePaddingUDim2, WidgetAxisPadding, WidgetPadding } from "./Padding";

interface ScrollViewEvents {
	ContentSizeChanged?: (size: Vector2, view: ScrollView<never>) => void;
	CanvasPositionChanged?: (position: Vector2, view: ScrollView<never>) => void;
}

export type InferEnumNames<T> = T extends { EnumType: Enum.EnumType<infer A> } ? A["Name"] : never;
interface ScrollViewProps extends ScrollViewEvents {
	Size?: UDim2;
	Position?: UDim2;
	Bordered?: boolean;

	Style?: "NoButtons" | "ButtonsOnBar" | "Buttons";
	Padding?: WidgetPadding;

	ViewRef?: (view: ScrollView<never>) => void;

	AutoScrollToEnd?: boolean;

	SortOrder?: Enum.SortOrder | Enum.SortOrder["Name"];

	/**
	 * Enables GridLayout mode
	 *
	 * Note: Will require a `ItemSize` prop.
	 */
	GridLayout?: boolean;
	/**
	 * Percentage scroll for the auto scroll feature
	 */
	AutoScrollToEndThreshold?: number;
}

interface GridContent {
	GridLayout: true;
	ItemPadding?: WidgetAxisPadding;
	ItemSize: UDim2;
}

interface ListContent {
	ItemPadding?: number | UDim;
	ItemAlignment?: Enum.VerticalAlignment | InferEnumNames<Enum.VerticalAlignment>;
}

interface ScrollViewState {
	size: Vector2;
	barScale: number;
	barPos: number;
	loaded: boolean;

	barShown: boolean;
}

type ScrollViewInfer<T> = T extends { GridLayout: true }
	? ScrollViewProps & GridContent
	: ScrollViewProps & ListContent;

export type ScrollViewLike = ScrollView<ScrollViewProps>;
export type GridScrollViewProps = ScrollViewProps & GridContent;

export default class ScrollView<T extends ScrollViewProps> extends Roact.Component<
	ScrollViewInfer<T>,
	ScrollViewState
> {
	private scrollFrame!: ScrollingFrame;
	private maid: Maid;
	private scrollListLayout!: UIListLayout | UIGridLayout;
	/** weird hack for AutoScrollToEnd with frames that start not scrollable */
	private initScrollToBottom = false;

	public constructor(props: RbxJsxProps & ScrollViewInfer<T>) {
		super(props);
		this.state = {
			size: new Vector2(),
			barScale: 1,
			barPos: 0,
			barShown: false,
			loaded: false,
		};

		this.maid = new Maid();
	}

	public invokeUpdate = () => {
		const size = this.scrollListLayout.AbsoluteContentSize;
		if (this.props.ContentSizeChanged) {
			const canvasSize = this.scrollFrame.AbsoluteSize;
			// TODO: Change if ROBLOX fixes AbsoluteContentSize
			const contentSize = new Vector2(canvasSize.X - 20, size.Y); // since AbsoluteContentSize doesn't calculate X?
			this.props.ContentSizeChanged(contentSize, this);
		}
	};

	// ? CanvasPosition changed handler
	public canvasPositionUpdated = () => {
		const canvasPosition = this.scrollFrame.CanvasPosition;
		const padding = CalculatePadding(this.props.Padding ?? {});
		const paddingBottomOffset = padding.PaddingBottom?.Offset ?? 0;
		const paddingTopOffset = padding.PaddingTop?.Offset ?? 0;

		const size = this.scrollListLayout.AbsoluteContentSize.add(
			new Vector2(0, paddingBottomOffset + paddingTopOffset),
		);

		this.setState({
			barPos: canvasPosition.Y / (size.Y - this.scrollFrame.AbsoluteSize.Y),
		});
		this.initScrollToBottom = false;

		this.props.CanvasPositionChanged && this.props.CanvasPositionChanged(canvasPosition, this);
	};

	// ? AbsoluteContentSize changed handler
	public absoluteContentSizeChanged = () => {
		const { AutoScrollToEndThreshold = 0.8, AutoScrollToEnd } = this.props;

		const padding = CalculatePadding(this.props.Padding ?? {});
		const paddingBottomOffset = padding.PaddingBottom?.Offset ?? 0;
		const paddingTopOffset = padding.PaddingTop?.Offset ?? 0;

		const size = this.scrollListLayout.AbsoluteContentSize.add(
			new Vector2(0, paddingBottomOffset + paddingTopOffset),
		);

		this.setState({
			size,
		});

		const scale = this.scrollFrame.AbsoluteSize.Y / size.Y;

		const canvasPosition = this.scrollFrame.CanvasPosition;
		const canvasSize = this.scrollFrame.AbsoluteSize;
		const canvasAbsoluteSize = this.scrollListLayout.AbsoluteContentSize;

		this.setState({
			barScale: scale,
			barShown: scale < 1,
			barPos: canvasPosition.Y / (size.Y - canvasSize.Y),
		});

		if (this.props.ContentSizeChanged) {
			// TODO: Change if ROBLOX fixes AbsoluteContentSize
			const contentSize = new Vector2(canvasSize.X - 20, size.Y); // since AbsoluteContentSize doesn't calculate X?
			this.props.ContentSizeChanged(contentSize, this);
		}

		const calculatedSize = canvasAbsoluteSize.Y - this.scrollFrame.AbsoluteWindowSize.Y + paddingBottomOffset;

		if (
			AutoScrollToEnd &&
			(canvasPosition.Y / calculatedSize >= AutoScrollToEndThreshold || this.initScrollToBottom)
		) {
			this.scrollToEnd();
		}
	};

	public didMount() {
		const { AutoScrollToEnd } = this.props;

		if (AutoScrollToEnd) {
			this.initScrollToBottom = true;
		}

		if (this.scrollFrame === undefined) {
			warn("Missing ScrollFrame to ScrollView");
			return;
		}
		if (this.scrollListLayout === undefined) {
			warn("Missing UIListLayout to ScrollView");
			return;
		}

		const size = this.scrollListLayout.AbsoluteContentSize;

		// Have to wait a frame because of ROBLOX's quirkiness.
		delayAsync().then(() => this.absoluteContentSizeChanged());

		this.setState({ size });

		if (this.props.ViewRef) {
			this.props.ViewRef(this);
		}
	}

	public willUnmount() {
		this.maid.DoCleaning();
	}

	public renderBar() {
		if (this.state.barShown) {
			return (
				<ThemeContext.Consumer
					render={(theme) => {
						const scale = this.state.barScale;
						return (
							<frame
								BorderSizePixel={0}
								BackgroundTransparency={0}
								BackgroundColor3={theme.SecondaryBackgroundColor3}
								Size={new UDim2(1, 0, this.state.barScale, 0)}
								Position={new UDim2(0, 0, this.state.barPos * (1 - this.state.barScale), 0)}
							>
								{scale >= 0.1 && <ZirconIcon Icon="UpArrow" Position={UDim2.fromOffset(2, 0)} />}
								{scale >= 0.1 && <ZirconIcon Icon="DownArrow" Position={new UDim2(0, 2, 1, -16)} />}
							</frame>
						);
					}}
				/>
			);
		} else {
			return undefined;
		}
	}

	public scrollToPositionY(position: number) {
		this.scrollFrame.CanvasPosition = new Vector2(0, position);
	}

	public scrollToEnd() {
		this.scrollFrame.CanvasPosition = new Vector2(0, this.scrollFrame.CanvasSize.Height.Offset);
		this.initScrollToBottom = true;
	}

	public getScrollFrame() {
		return this.scrollFrame;
	}

	public renderContentHandler() {
		const { ItemPadding } = this.props;

		let computedPadding: UDim | undefined;
		if (typeIs(ItemPadding, "UDim")) {
			computedPadding = ItemPadding;
		} else if (typeIs(ItemPadding, "number")) {
			computedPadding = new UDim(0, ItemPadding);
		}

		if (this.props.GridLayout === true) {
			const { ItemSize, ItemPadding = 0 } = (this.props as unknown) as GridContent;
			return (
				<uigridlayout
					Key="ScrollViewGrid"
					CellSize={ItemSize}
					Change={{ AbsoluteContentSize: this.absoluteContentSizeChanged }}
					CellPadding={CalculatePaddingUDim2(ItemPadding)}
					Ref={(ref) => (this.scrollListLayout = ref)}
					SortOrder={this.props.SortOrder ?? Enum.SortOrder.LayoutOrder}
				/>
			);
		} else {
			return (
				<uilistlayout
					Key="ScrollViewList"
					VerticalAlignment={this.props.ItemAlignment}
					Change={{ AbsoluteContentSize: this.absoluteContentSizeChanged }}
					Padding={computedPadding}
					SortOrder={this.props.SortOrder ?? Enum.SortOrder.LayoutOrder}
					Ref={(ref) => (this.scrollListLayout = ref)}
				/>
			);
		}
	}

	public render() {
		const { Style = "NoButtons", Padding = 0 } = this.props;
		const padding = CalculatePadding(Padding);
		// Include the scrollbar in the equation
		padding.PaddingRight = (padding.PaddingRight ?? new UDim(0, 0)).add(new UDim(0, 20));

		const useButtons = Style === "Buttons";
		return (
			<ThemeContext.Consumer
				render={(theme) => (
					<frame Size={this.props.Size || new UDim2(1, 0, 1, 0)} BackgroundTransparency={1}>
						<scrollingframe
							Ref={(frame) => (this.scrollFrame = frame)}
							Key="ScrollFrameHost"
							Size={new UDim2(1, 0, 1, 0)}
							Position={this.props.Position}
							BackgroundTransparency={1}
							BorderSizePixel={0}
							CanvasSize={new UDim2(0, this.state.size.X, 0, this.state.size.Y)}
							BottomImage=""
							MidImage=""
							ScrollingDirection="Y"
							TopImage=""
							Change={{
								AbsoluteSize: this.absoluteContentSizeChanged,
								CanvasPosition: this.canvasPositionUpdated,
							}}
							ScrollBarThickness={20}
						>
							{this.renderContentHandler()}
							<uipadding Key="ScrollPadding" {...padding} />
							{this.props[Roact.Children]}
						</scrollingframe>
						<frame
							Key="ScrollFrameBar"
							BackgroundTransparency={1}
							Size={true ? new UDim2(0, 20, 1, 0) : new UDim2(0, 0, 1, 0)}
							Position={new UDim2(1, -20, 0, 0)}
						>
							<frame
								Key="ScrollFrameBarTrackUpButtonContainer"
								Size={new UDim2(0, 20, 0, 20)}
								BackgroundTransparency={1}
							/>
							<frame
								Key="ScrollFrameBarTrack"
								Size={useButtons ? new UDim2(1, 0, 1, -40) : new UDim2(1, 0, 1, 0)}
								Position={new UDim2(0, 0, 0, useButtons ? 20 : 0)}
								BackgroundTransparency={0}
								BackgroundColor3={theme.PrimaryBackgroundColor3}
								BorderColor3={theme.SecondaryBackgroundColor3}
								BorderSizePixel={1}
							>
								{this.renderBar()}
							</frame>
							<frame
								Key="ScrollFrameBarTrackDnButtonContainer"
								Size={new UDim2(0, 20, 0, 20)}
								Position={new UDim2(0, 0, 1, -20)}
								BackgroundTransparency={1}
							/>
						</frame>
					</frame>
				)}
			/>
		);
	}
}
