import Roact from "@rbxts/roact";
import { SingleMotor, Spring } from "@rbxts/flipper";
import { connect } from "@rbxts/roact-rodux";
import { ConsoleActionName, ConsoleReducer, DEFAULT_FILTER } from "../Store/_reducers/ConsoleReducer";
import ZirconSyntaxTextBox from "../../Components/SyntaxTextBox";
import { ZirconIconButton } from "../../Components/Icon";
import Remotes from "../../../Shared/Remotes";
import { RemoteId } from "../../../RemoteId";
import ClientEvent from "@rbxts/net/out/client/ClientEvent";
import ZirconOutput from "../../../Client/Components/Output";
import { DispatchParam } from "@rbxts/rodux";
import ZirconClientStore from "../Store";
import ThemeContext from "../../../Client/UIKit/ThemeContext";
import { ZirconContext, ZirconLogLevel, ZirconMessageType } from "../../../Client/Types";
import Dropdown from "Client/Components/Dropdown";
import { Workspace } from "@rbxts/services";
import Padding from "Client/Components/Padding";
import SearchTextBox from "Client/Components/SearchTextBox";
import MultiSelectDropdown from "Client/Components/MultiSelectDropdown";

export interface DockedConsoleProps extends MappedProps, MappedDispatch {}
interface DockedConsoleState {
	isVisible: boolean;
	isFullView: boolean;
	sizeY: number;
	source: string;
	levelFilter: Set<ZirconLogLevel>;
	filterVisible?: boolean;
	historyIndex: number;
}

const MAX_SIZE = 28 * 10; // 18

/**
 * The console
 */
class ZirconConsoleComponent extends Roact.Component<DockedConsoleProps, DockedConsoleState> {
	private positionY: Roact.Binding<number>;
	private outputTransparency: Roact.Binding<number>;

	private sizeY: Roact.Binding<number>;
	private filterSizeY: Roact.Binding<number>;

	private filterSettingsSizeY: SingleMotor;
	private positionYMotor: SingleMotor;
	private sizeYMotor: SingleMotor;
	private outputTransparencyMotor: SingleMotor;
	private dispatch: ClientEvent<[], [input: string]>;

	public constructor(props: DockedConsoleProps) {
		super(props);
		this.state = {
			isVisible: props.isVisible,
			isFullView: false,
			filterVisible: false,
			levelFilter: props.levelFilter,
			historyIndex: 0,
			source: "",
			sizeY: MAX_SIZE,
		};

		// Initialization
		this.positionYMotor = new SingleMotor(0);
		this.sizeYMotor = new SingleMotor(MAX_SIZE);
		this.filterSettingsSizeY = new SingleMotor(0);
		this.outputTransparencyMotor = new SingleMotor(0.1);
		let setPositionY: Roact.RoactBindingFunc<number>;
		let setSizeY: Roact.RoactBindingFunc<number>;
		let setOutputTransparency: Roact.RoactBindingFunc<number>;
		let setFilterSizeY: Roact.BindingFunction<number>;

		// Bindings
		[this.positionY, setPositionY] = Roact.createBinding(this.positionYMotor.getValue());
		[this.sizeY, setSizeY] = Roact.createBinding(this.sizeYMotor.getValue());
		[this.filterSizeY, setFilterSizeY] = Roact.createBinding(this.filterSettingsSizeY.getValue());
		[this.outputTransparency, setOutputTransparency] = Roact.createBinding(this.outputTransparencyMotor.getValue());

		//  Binding updates
		this.filterSettingsSizeY.onStep((value) => setFilterSizeY(value));
		this.positionYMotor.onStep((value) => setPositionY(value));
		this.sizeYMotor.onStep((value) => setSizeY(value));
		this.outputTransparencyMotor.onStep((value) => setOutputTransparency(value));

		const DispatchToServer = Remotes.Client.Get(RemoteId.DispatchToServer);
		this.dispatch = DispatchToServer;
	}

	public didMount() {}

	public didUpdate(prevProps: DockedConsoleProps, prevState: DockedConsoleState) {
		if (
			prevProps.isVisible !== this.props.isVisible ||
			prevState.isFullView !== this.state.isFullView ||
			prevState.filterVisible !== this.state.filterVisible
		) {
			const fullScreenViewSize = Workspace.CurrentCamera!.ViewportSize;
			const size = this.state.isFullView ? fullScreenViewSize.Y - 40 : MAX_SIZE;
			this.positionYMotor.setGoal(new Spring(this.props.isVisible ? size + 40 : 0));
			this.outputTransparencyMotor.setGoal(new Spring(this.state.isFullView ? 0.35 : 0.1));
			this.filterSettingsSizeY.setGoal(new Spring(this.state.isFullView || this.state.filterVisible ? 40 : 0));
			this.sizeYMotor.setGoal(new Spring(size));
			this.setState({ isVisible: this.props.isVisible });
		}

		if (prevProps.levelFilter !== this.props.levelFilter) {
			this.setState({ levelFilter: this.props.levelFilter });
		}
	}

	public render() {
		const sizePositionBinding = Roact.joinBindings({ Size: this.sizeY, Position: this.positionY });
		return (
			<ThemeContext.Consumer
				render={(theme) => (
					<screengui DisplayOrder={10000} IgnoreGuiInset>
						<frame
							Key="ZirconViewport"
							Active={this.state.isFullView}
							BorderSizePixel={0}
							BackgroundTransparency={theme.Dock.Transparency ?? this.outputTransparency}
							BackgroundColor3={theme.PrimaryBackgroundColor3}
							ClipsDescendants
							Size={sizePositionBinding.map((v) => new UDim2(1, 0, 0, v.Size))}
							Position={sizePositionBinding.map((v) => new UDim2(0, 0, 0, -v.Size + v.Position))}
						>
							<frame
								Size={new UDim2(0, 100, 0, 30)}
								Position={new UDim2(1, -100, 0, 5)}
								BackgroundTransparency={1}
							>
								<uilistlayout
									FillDirection="Horizontal"
									HorizontalAlignment="Right"
									Padding={new UDim(0, 5)}
								/>
								<Padding Padding={{ Right: 25 }} />
								<ZirconIconButton
									Icon="Funnel"
									Floating
									Size={new UDim2(0, 30, 0, 30)}
									OnClick={() => this.setState({ filterVisible: true })}
								/>
							</frame>
							<frame
								Key="FilterLayout"
								Size={this.filterSizeY.map((v) => new UDim2(1, 0, 0, v))}
								ClipsDescendants
								BackgroundColor3={theme.PrimaryBackgroundColor3}
								BorderSizePixel={1}
								BorderColor3={theme.SecondaryBackgroundColor3}
							>
								<frame Key="LeftContent" BackgroundTransparency={1} Size={new UDim2(0.5, 0, 1, 0)}>
									<uilistlayout
										FillDirection="Horizontal"
										HorizontalAlignment="Left"
										Padding={new UDim(0, 10)}
									/>
									<Padding Padding={{ Horizontal: 20, Vertical: 5 }} />
									<Dropdown<ZirconContext | undefined>
										Items={[
											{
												SelectedText: "(Context)",
												Text: "All Contexts",
												Id: undefined,
												TextColor3: Color3.fromRGB(150, 150, 150),
											},
											{
												Text: "Server",
												Id: ZirconContext.Server,
												Icon: "ContextServer",
											},
											{
												Text: "Client",
												Icon: "ContextClient",
												Id: ZirconContext.Client,
											},
										]}
										SelectedItemId={undefined}
										ItemSelected={(item) => {
											this.props.updateContextFilter(item.Id);
										}}
									/>
									<MultiSelectDropdown<ZirconLogLevel>
										Label="Level Filter"
										SelectedItemIds={this.state.levelFilter}
										Items={[
											{
												Id: ZirconLogLevel.Debug,
												Text: "Debugging",
											},
											{
												Id: ZirconLogLevel.Info,
												Text: "Information",
											},
											{
												Id: ZirconLogLevel.Warning,
												Text: "Warnings",
											},
											{
												Id: ZirconLogLevel.Error,
												Text: "Errors",
											},
											{
												Id: ZirconLogLevel.Wtf,
												Text: "Fatal Errors",
											},
										]}
										ItemsSelected={(items) => this.props.updateLevelFilter(items)}
									/>
								</frame>
								<frame
									Key="RightContent"
									Size={new UDim2(0.5, 0, 1, 0)}
									Position={new UDim2(0.5, 0, 0, 0)}
									BackgroundTransparency={1}
								>
									<uilistlayout
										FillDirection="Horizontal"
										HorizontalAlignment="Right"
										Padding={new UDim(0, 10)}
									/>
									<Padding Padding={{ Horizontal: 25, Vertical: 5 }} />
									<SearchTextBox />
									{!this.state.isFullView && (
										<ZirconIconButton
											Icon="UpDoubleArrow"
											Floating
											Size={new UDim2(0, 30, 0, 30)}
											OnClick={() => this.setState({ filterVisible: false })}
										/>
									)}
								</frame>
							</frame>

							<frame
								Position={this.filterSizeY.map((v) => {
									return new UDim2(0, 0, 0, this.state.isFullView ? v : 0);
								})}
								Size={this.filterSizeY.map((v) => {
									return new UDim2(
										1,
										0,
										1,
										this.props.executionEnabled ? -30 - (this.state.isFullView ? v : 0) : 0,
									);
								})}
								BackgroundTransparency={1}
							>
								<ZirconOutput />
							</frame>
							{this.props.executionEnabled && (
								<frame
									BorderColor3={Color3.fromRGB(40, 40, 40)}
									BackgroundColor3={theme.SecondaryBackgroundColor3}
									Size={new UDim2(1, 0, 0, 28)}
									Position={new UDim2(0, 0, 1, -28)}
								>
									<uilistlayout FillDirection="Horizontal" />
									<Dropdown<ZirconContext>
										Disabled
										Items={[
											{
												Id: ZirconContext.Server,
												Text: "Server",
												Icon: "ContextServer",
											},
											{
												Id: ZirconContext.Client,
												Text: "Client",
												Icon: "ContextClient",
											},
										]}
										Position={new UDim2(1, -150, 0, 0)}
										Size={new UDim2(0, 100, 1, 0)}
									/>
									<ZirconIconButton
										Size={new UDim2(0, 16, 0, 28)}
										Icon="RightArrow"
										OnClick={() => {}}
									/>
									<ZirconSyntaxTextBox
										Size={new UDim2(1, -16 - 32 - 100, 1, 0)}
										Position={new UDim2(0, 16, 0, 0)}
										Focused={this.state.isVisible}
										// PlaceholderText="Enter Script"
										// AutoFocus
										Source={this.state.source}
										OnEnterSubmit={(input) => {
											this.props.addMessage(input);
											this.dispatch.SendToServer(input);
											this.setState({ historyIndex: 0, source: "" });
										}}
										OnHistoryTraversal={(direction) => {
											let index = this.state.historyIndex;
											if (direction === "back") {
												index = this.state.historyIndex - 1;
											} else if (direction === "forward") {
												index = this.state.historyIndex + 1;
											}

											print("[historyTraversal]", direction);

											this.setState({
												historyIndex: index,
												source: this.props.history[
													index < 0 ? this.props.history.size() - index : index
												],
											});
										}}
									/>
									<ZirconIconButton
										Icon={this.state.isFullView ? "UpDoubleArrow" : "DownDoubleArrow"}
										Size={new UDim2(0, 32, 0, 28)}
										OnClick={() => {
											this.setState({ isFullView: !this.state.isFullView });
										}}
									/>
								</frame>
							)}
						</frame>
					</screengui>
				)}
			/>
		);
	}
}

interface MappedDispatch {
	addMessage: (message: string) => void;
	updateContextFilter: (context: ZirconContext | undefined) => void;
	updateLevelFilter: (levels: Set<ZirconLogLevel>) => void;
}
interface MappedProps {
	isVisible: boolean;
	executionEnabled: boolean;
	history: string[];
	levelFilter: Set<ZirconLogLevel>;
}
const mapStateToProps = (state: ConsoleReducer): MappedProps => {
	return {
		isVisible: state.visible,
		levelFilter: state.filter.Levels ?? DEFAULT_FILTER,
		executionEnabled: state.executionEnabled,
		history: state.history,
	};
};
const mapPropsToDispatch = (dispatch: DispatchParam<ZirconClientStore>): MappedDispatch => {
	return {
		addMessage: (source) => {
			dispatch({
				type: ConsoleActionName.AddHistory,
				message: source,
			});
			dispatch({
				type: ConsoleActionName.AddOutput,
				message: {
					type: ZirconMessageType.ZirconiumExecutionMessage,
					source,
				},
			});
		},
		updateContextFilter: (Context) => {
			if (Context !== undefined) {
				dispatch({ type: ConsoleActionName.UpdateFilter, Context });
			} else {
				dispatch({ type: ConsoleActionName.RemoveFilter, filter: "Context" });
			}
		},
		updateLevelFilter: (Levels) => {
			if (Levels !== undefined) {
				dispatch({ type: ConsoleActionName.UpdateFilter, Levels });
			} else {
				dispatch({ type: ConsoleActionName.RemoveFilter, filter: "Levels" });
			}
		},
	};
};

/**
 * A docked console
 */
const ZirconDockedConsole = connect(mapStateToProps, mapPropsToDispatch)(ZirconConsoleComponent);
export default ZirconDockedConsole;
