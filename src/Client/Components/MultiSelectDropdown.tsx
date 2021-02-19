import Maid from "@rbxts/maid";
import Roact from "@rbxts/roact";
import { Players, UserInputService } from "@rbxts/services";
import ThemeContext from "Client/UIKit/ThemeContext";
import { setsEqual, toArray } from "Shared/Collections";
import ZirconIcon, { IconEnum } from "./Icon";
import Padding from "./Padding";
import ScrollView from "./ScrollView";

interface ItemData<T> {
	Id: T;
	SelectedText?: string;
	Text: string;
	Icon?: IconEnum;
	TextColor3?: Color3;
}

interface DropdownProps<T = string> {
	readonly Items: Array<ItemData<T>>;
	readonly Label: string;
	// readonly SelectedItemIndexes?: Set<number>;
	readonly SelectedItemIds?: ReadonlySet<T>;
	Size?: UDim2;
	Disabled?: boolean;
	ItemsSelected?: (item: Set<T>) => void;
}
interface DropdownState<T = string> {
	active: boolean;
	selectedItems: ReadonlySet<ItemData<T>>;
	selectedItemIds: ReadonlySet<T>;
}

export default class MultiSelectDropdown<T = string> extends Roact.Component<DropdownProps<T>, DropdownState<T>> {
	private dropdownRef = Roact.createRef<Frame>();
	private maid = new Maid();

	private portalPosition: Roact.RoactBinding<UDim2>;
	private setPortalPosition: Roact.RoactBindingFunc<UDim2>;

	private portalSizeX: Roact.RoactBinding<number>;
	private setPortalSizeX: Roact.RoactBindingFunc<number>;

	public constructor(props: DropdownProps<T>) {
		super(props);
		this.state = {
			selectedItems: new Set(),
			selectedItemIds: props.SelectedItemIds ?? new Set(),
			active: false,
		};

		this.updateSelectedIndexes();

		[this.portalPosition, this.setPortalPosition] = Roact.createBinding(new UDim2());
		[this.portalSizeX, this.setPortalSizeX] = Roact.createBinding(0);
	}

	private getItemSet() {
		const {
			props: { Items },
		} = this;
		const { selectedItemIds } = this.state;

		const selectedItemSet = Items.reduce((accumulator, current) => {
			if (selectedItemIds.has(current.Id)) {
				accumulator.add(current);
			}
			return accumulator;
		}, new Set<ItemData<T>>());

		return selectedItemSet;
	}

	private updateSelectedIndexes() {
		this.setState({ selectedItems: this.getItemSet() });
	}

	public setPortalPositionRelativeTo(frame: Frame) {
		const { AbsolutePosition, AbsoluteSize } = frame;
		this.setPortalPosition(new UDim2(0, AbsolutePosition.X, 0, AbsolutePosition.Y + AbsoluteSize.Y));
		this.setPortalSizeX(AbsoluteSize.X);
	}

	public didUpdate(prevProps: DropdownProps<T>) {
		if (!setsEqual(prevProps.SelectedItemIds, this.props.SelectedItemIds)) {
			this.setState({
				selectedItems: this.getItemSet(),
				selectedItemIds: this.props.SelectedItemIds ?? new Set(),
			});
		}
	}

	public didMount() {
		const frame = this.dropdownRef.getValue();
		if (frame) {
			this.maid.GiveTask(
				frame.GetPropertyChangedSignal("AbsoluteSize").Connect(() => {
					this.setPortalPositionRelativeTo(frame);
				}),
			);

			this.maid.GiveTask(
				frame.GetPropertyChangedSignal("AbsolutePosition").Connect(() => {
					this.setPortalPositionRelativeTo(frame);
				}),
			);

			this.setPortalPositionRelativeTo(frame);
		}

		// Hack to re-render it
		this.setState({ selectedItems: this.getItemSet() });
	}

	public willUnmount() {
		this.maid.DoCleaning();
	}

	public renderDropdownItems() {
		const { selectedItems, selectedItemIds } = this.state;

		return this.props.Items.map((item, idx) => {
			return (
				<ThemeContext.Consumer
					render={(theme) => (
						<frame
							Size={new UDim2(1, 0, 0, 30)}
							BackgroundColor3={
								selectedItemIds.has(item.Id)
									? theme.PrimarySelectColor3
									: theme.SecondaryBackgroundColor3
							}
							BorderSizePixel={1}
							BorderColor3={theme.PrimaryBackgroundColor3}
						>
							<frame Size={new UDim2(1, 0, 1, 0)} BackgroundTransparency={1}>
								<Padding Padding={{ Right: 20, Horizontal: 5 }} />
								{selectedItemIds.has(item.Id) && (
									<ZirconIcon Icon="CheckmarkHeavy" Position={new UDim2(0, 0, 0.5, -8)} />
								)}
								<textbutton
									Font={theme.Font}
									TextXAlignment="Left"
									TextSize={15}
									BackgroundTransparency={1}
									Size={new UDim2(1, 0, 1, 0)}
									Position={new UDim2(0, 20, 0, 0)}
									TextColor3={theme.PrimaryTextColor3}
									Text={item.Text}
									Event={{
										MouseButton1Click: () => {
											const selectedSet = new Set<ItemData<T>>();
											const newSet = new Set<T>();
											for (const existingItem of this.state.selectedItems) {
												newSet.add(existingItem.Id);
												selectedSet.add(existingItem);
											}

											if (newSet.has(item.Id)) {
												newSet.delete(item.Id);
												selectedSet.delete(item);
											} else {
												newSet.add(item.Id);
												selectedSet.add(item);
											}

											if (UserInputService.IsKeyDown(Enum.KeyCode.LeftControl)) {
												newSet.clear();
												selectedSet.clear();
												newSet.add(item.Id);
												selectedSet.add(item);
											}

											this.setState({ selectedItems: selectedSet, selectedItemIds: newSet });
											if (this.props.ItemsSelected !== undefined) {
												this.props.ItemsSelected(newSet);
											}
										},
									}}
								/>
							</frame>
						</frame>
					)}
				/>
			);
		});
	}

	public renderDropdown() {
		const { active } = this.state;
		if (active === false) {
			return <Roact.Fragment />;
		}

		const activeSizeY = math.min(this.props.Items.size() * 30, 30 * 4);

		const portal = (
			<ThemeContext.Consumer
				render={(theme) => (
					<frame
						Key="DropdownPortal"
						// BackgroundTransparency={1}
						BackgroundColor3={theme.PrimaryBackgroundColor3}
						BorderColor3={theme.SecondaryBackgroundColor3}
						Position={this.portalPosition}
						Size={this.portalSizeX.map((x) => {
							return new UDim2(0, x, 0, activeSizeY);
						})}
						Event={{ MouseLeave: () => this.setState({ active: false }) }}
					>
						<ScrollView>{this.renderDropdownItems()}</ScrollView>
					</frame>
				)}
			/>
		);

		return (
			<Roact.Portal target={Players.LocalPlayer.FindFirstChildOfClass("PlayerGui")!}>
				<screengui DisplayOrder={10500} Key="HostedDropdownPortal">
					{portal}
				</screengui>
			</Roact.Portal>
		);
	}

	public render() {
		const { Items, Disabled, Size = new UDim2(0, 150, 0, 30) } = this.props;
		const { selectedItems } = this.state;

		const values = toArray(selectedItems);
		const fullString = values.map((f) => f.SelectedText ?? f.Text).join(", ");

		return (
			<ThemeContext.Consumer
				render={(theme) => (
					<frame
						BackgroundColor3={theme.SecondaryBackgroundColor3}
						BorderColor3={theme.PrimaryBackgroundColor3}
						Size={Size}
						Ref={this.dropdownRef}
					>
						<frame Key="Content" Size={new UDim2(1, -25, 1, 0)} BackgroundTransparency={1}>
							<Padding Padding={{ Horizontal: 10 }} />
							<textbutton
								Size={new UDim2(1, 0, 1, 0)}
								BackgroundTransparency={1}
								Font={theme.Font}
								TextSize={15}
								TextXAlignment="Left"
								TextColor3={Disabled ? new Color3(50, 50, 50) : new Color3(200, 200, 200)}
								TextStrokeTransparency={0.5}
								Text={this.props.Label.format(values.size())}
								Event={{
									MouseButton1Click: () => !Disabled && this.setState({ active: !this.state.active }),
								}}
							/>
						</frame>
						<imagelabel
							Image="rbxassetid://2657038128"
							ImageColor3={Disabled ? Color3.fromRGB(100, 100, 100) : Color3.fromRGB(255, 255, 255)}
							Position={new UDim2(1, -25, 0, 5)}
							BackgroundTransparency={1}
							Rotation={this.state.active ? 0 : 180}
							Size={new UDim2(0, 20, 0, 20)}
						/>
						{this.renderDropdown()}
					</frame>
				)}
			/>
		);
	}
}
