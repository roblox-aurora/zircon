import Roact from "@rbxts/roact";
import { SingleMotor, Spring } from "@rbxts/flipper";
import { connect } from "@rbxts/roact-rodux";
import { ConsoleActionName, ConsoleReducer, DEFAULT_FILTER } from "../Store/_reducers/ConsoleReducer";
import ZirconSyntaxTextBox from "../../Components/SyntaxTextBox";
import ZirconIcon, { ZirconIconButton } from "../../Components/Icon";
import Remotes, { RemoteId } from "../../../Shared/Remotes";
import { ClientSenderEvent } from "@rbxts/net/out/client/ClientEvent";
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
import { $print } from "rbxts-transform-debug";
import { $NODE_ENV } from "rbxts-transform-env";
import { GetCommandService } from "Services";

export interface DockedConsoleProps extends MappedProps, MappedDispatch {}
interface DockedConsoleState {
	isVisible: boolean;
	isFullView: boolean;
	sizeY: number;
	source: string;
	levelFilter: Set<ZirconLogLevel>;
	filterVisible?: boolean;
	historyIndex: number;
	searchQuery: string;
	context: ZirconContext;
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
	private dispatch: ClientSenderEvent<[input: string]>;

	public constructor(props: DockedConsoleProps) {
		super(props);
		this.state = {
			isVisible: props.isVisible,
			isFullView: false,
			filterVisible: false,
			levelFilter: props.levelFilter,
			historyIndex: 0,
			searchQuery: props.searchQuery,
			source: "",
			sizeY: MAX_SIZE,
			context: !props.executionEnabled ? ZirconContext.Client : ZirconContext.Server,
		};

		// Initialization
		this.positionYMotor = new SingleMotor(0);
		this.sizeYMotor = new SingleMotor(MAX_SIZE);
		this.filterSettingsSizeY = new SingleMotor(0);
		this.outputTransparencyMotor = new SingleMotor(0.1);
		let setPositionY: Roact.BindingFunction<number>;
		let setSizeY: Roact.BindingFunction<number>;
		let setOutputTransparency: Roact.BindingFunction<number>;
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

		const DispatchToServer = Remotes.Client.WaitFor(RemoteId.DispatchToServer).expect();
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

		if (prevProps.clientExecutionEnabled !== this.props.clientExecutionEnabled) {
			if (!this.props.executionEnabled) {
				this.setState({ context: ZirconContext.Client });
			}
		}

		if (prevProps.executionEnabled !== this.props.executionEnabled) {
			this.setState({ context: this.props.executionEnabled ? ZirconContext.Server : ZirconContext.Client });
		}

		if (prevProps.levelFilter !== this.props.levelFilter) {
			this.setState({ levelFilter: this.props.levelFilter });
		}

		if (prevProps.searchQuery !== this.props.searchQuery) {
			this.setState({ searchQuery: this.props.searchQuery });
		}
	}

	public renderNonExecutionBox() {
		return (
			<ThemeContext.Consumer
				render={(theme) => (
					<frame
						BorderColor3={theme.SecondaryBackgroundColor3}
						BackgroundColor3={theme.PrimaryBackgroundColor3}
						Size={new UDim2(1, 0, 0, 28)}
						Position={new UDim2(0, 0, 1, -28)}
					>
						<uilistlayout FillDirection="Horizontal" HorizontalAlignment="Right" />
						<ZirconIconButton
							Icon={this.state.isFullView ? "UpDoubleArrow" : "DownDoubleArrow"}
							Size={new UDim2(0, 32, 0, 28)}
							OnClick={() => {
								this.setState({ isFullView: !this.state.isFullView });
							}}
						/>
					</frame>
				)}
			/>
		);
	}

	public renderExecutionBox() {
		const showDropdown = this.props.executionEnabled;

		return (
			<ThemeContext.Consumer
				render={(theme) => (
					<frame
						BorderColor3={theme.PrimaryBackgroundColor3}
						BackgroundColor3={theme.SecondaryBackgroundColor3}
						Size={new UDim2(1, 0, 0, 28)}
						Position={new UDim2(0, 0, 1, -28)}
					>
						<uilistlayout FillDirection="Horizontal" />
						{showDropdown && (
							<Dropdown<ZirconContext>
								Disabled={!this.props.clientExecutionEnabled || !this.props.executionEnabled}
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
								SelectedItemId={this.state.context}
								Position={new UDim2(1, -150, 0, 0)}
								Size={new UDim2(0, 100, 1, 0)}
								ItemSelected={(value) => this.setState({ context: value.Id })}
							/>
						)}
						{/* <ZirconIconButton Size={new UDim2(0, 16, 0, 28)} Icon="Zirconium" OnClick={() => {}} /> */}
						<ZirconIcon Size={new UDim2(0, 16, 0, 28)} Icon="RightArrow" />
						<ZirconSyntaxTextBox
							RefocusOnSubmit={this.props.autoFocus}
							AutoFocus={this.props.autoFocus}
							CancelKeyCodes={this.props.toggleKeys}
							OnCancel={this.props.close}
							PlaceholderText="Enter script to execute"
							Size={new UDim2(1, -16 - 32 - (showDropdown ? 100 : 0), 1, 0)}
							Position={new UDim2(0, 16, 0, 0)}
							Focused={this.state.isVisible}
							Source={this.state.source}
							OnEnterSubmit={(input) => {
								this.props.addMessage(input);

								switch (this.state.context) {
									case ZirconContext.Server:
										this.dispatch.SendToServer(input);
										break;
									case ZirconContext.Client:
										GetCommandService("ClientDispatchService").ExecuteScript(input);
										break;
								}

								this.setState({ historyIndex: 0, source: "" });
							}}
							OnHistoryTraversal={(direction) => {
								let index = this.state.historyIndex;

								const history = this.props.history;
								let text = "";
								if (direction === "back") {
									if (index <= 0) {
										index = history.size() - 1;
									} else {
										index = index - 1;
									}

									text = history[index];
								} else if (direction === "forward") {
									if (index >= history.size() - 1) {
										index = 0;
									} else {
										index = index + 1;
									}

									text = history[index];
								}

								$print("[historyTraversal]", direction, text, history);

								this.setState({
									historyIndex: index,
									source: text,
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
			/>
		);
	}

	public render() {
		const canExec = this.props.clientExecutionEnabled || this.props.executionEnabled;

		const sizePositionBinding = Roact.joinBindings({ Size: this.sizeY, Position: this.positionY });
		return (
			<ThemeContext.Consumer
				render={(theme) => (
					<screengui ZIndexBehavior="Sibling" DisplayOrder={10000} ResetOnSpawn={false} IgnoreGuiInset>
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
								Position={this.filterSizeY.map((v) => {
									return new UDim2(0, 0, 0, this.state.isFullView ? v : 0);
								})}
								Size={this.filterSizeY.map((v) => {
									return new UDim2(1, 0, 1, this.state.isFullView ? v - 30 : -30);
								})}
								BackgroundTransparency={1}
							>
								<ZirconOutput />
							</frame>

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
									ZIndex={2}
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
												Id: ZirconLogLevel.Verbose,
												Text: "Verbose",
											},
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
									<SearchTextBox
										Value={this.state.searchQuery}
										TextChanged={(value) => {
											this.props.updateSearchFilter(value);
										}}
									/>
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

							{canExec && this.renderExecutionBox()}
							{!canExec && this.renderNonExecutionBox()}
						</frame>
					</screengui>
				)}
			/>
		);
	}
}

interface MappedDispatch {
	addMessage: (message: string) => void;
	updateSearchFilter: (search: string) => void;
	updateContextFilter: (context: ZirconContext | undefined) => void;
	updateLevelFilter: (levels: Set<ZirconLogLevel>) => void;
	close: () => void;
}
interface MappedProps {
	isVisible: boolean;
	executionEnabled: boolean;
	clientExecutionEnabled: boolean;
	history: string[];
	searchQuery: string;
	toggleKeys: Enum.KeyCode[];
	autoFocus: boolean;
	levelFilter: Set<ZirconLogLevel>;
}
const mapStateToProps = (state: ConsoleReducer): MappedProps => {
	return {
		isVisible: state.visible,
		autoFocus: state.autoFocusTextBox,
		toggleKeys: state.bindingKeys,
		levelFilter: state.filter.Levels ?? DEFAULT_FILTER,
		executionEnabled: state.executionEnabled,
		searchQuery: state.filter.SearchQuery ?? "",
		clientExecutionEnabled: state.canExecuteLocalScripts,
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
		updateSearchFilter: (query) => {
			dispatch({ type: ConsoleActionName.UpdateFilter, SearchQuery: query });
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
		close: () => dispatch({ type: ConsoleActionName.SetConsoleVisible, visible: false }),
	};
};

/**
 * A docked console
 */
const ZirconDockedConsole = connect(mapStateToProps, mapPropsToDispatch)(ZirconConsoleComponent);
export default ZirconDockedConsole;
