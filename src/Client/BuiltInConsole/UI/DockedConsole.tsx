import Roact from "@rbxts/roact";
import { SingleMotor, Spring } from "@rbxts/flipper";
import { connect } from "@rbxts/roact-rodux";
import { ConsoleActionName, ConsoleReducer } from "../Store/_reducers/ConsoleReducer";
import ZirconSyntaxTextBox from "../../Components/SyntaxTextBox";
import { ZirconIconButton } from "../../Components/Icon";
import Remotes from "../../../Shared/Remotes";
import { RemoteId } from "../../../RemoteId";
import ClientEvent from "@rbxts/net/out/client/ClientEvent";
import ZirconOutput from "../../../Client/Components/Output";
import { DispatchParam } from "@rbxts/rodux";
import ZirconClientStore from "../Store";
import ThemeContext from "../../../Client/UIKit/ThemeContext";
import { ZirconMessageType } from "../../../Client/Types";

export interface DockedConsoleProps extends MappedProps, MappedDispatch {}
interface DockedConsoleState {
	isVisible: boolean;
	isFullView: boolean;
	sizeY: number;
	source: string;
	historyIndex: number;
}

const MAX_SIZE = 28 * 10; // 18

/**
 * The console
 */
class ZirconConsoleComponent extends Roact.Component<DockedConsoleProps, DockedConsoleState> {
	private sizeY: Roact.RoactBinding<number>;
	private outputTransparency: Roact.RoactBinding<number>;
	private sizeYMotor: SingleMotor;
	private outputTransparencyMotor: SingleMotor;
	private dispatch: ClientEvent<[], [input: string]>;

	public constructor(props: DockedConsoleProps) {
		super(props);
		this.state = {
			isVisible: props.isVisible,
			isFullView: false,
			historyIndex: 0,
			source: "",
			sizeY: MAX_SIZE,
		};

		// Initialization
		this.sizeYMotor = new SingleMotor(0);
		this.outputTransparencyMotor = new SingleMotor(0.1);
		let setSizeY: Roact.RoactBindingFunc<number>;
		let setOutputTransparency: Roact.RoactBindingFunc<number>;

		// Bindings
		[this.sizeY, setSizeY] = Roact.createBinding(this.sizeYMotor.getValue());
		[this.outputTransparency, setOutputTransparency] = Roact.createBinding(this.outputTransparencyMotor.getValue());

		//  Binding updates
		this.sizeYMotor.onStep((value) => setSizeY(value));
		this.outputTransparencyMotor.onStep((value) => setOutputTransparency(value));

		const DispatchToServer = Remotes.Client.Get(RemoteId.DispatchToServer);
		this.dispatch = DispatchToServer;
	}

	public didMount() {}

	public didUpdate(prevProps: DockedConsoleProps) {
		if (prevProps.isVisible !== this.props.isVisible) {
			this.sizeYMotor.setGoal(new Spring(this.props.isVisible ? this.state.sizeY + 40 : 0));
			this.setState({ isVisible: this.props.isVisible });
		}
	}

	public render() {
		return (
			<ThemeContext.Consumer
				render={(theme) => (
					<screengui DisplayOrder={10000} IgnoreGuiInset>
						<frame
							Size={new UDim2(1, 0, 0, 40)}
							BackgroundColor3={theme.PrimaryBackgroundColor3}
							BorderSizePixel={0}
							Position={this.state.isVisible ? new UDim2(0, 0, 0, 0) : new UDim2(0, 0, 0, -40)}
						/>
						<frame
							Key="ZirconViewport"
							BorderSizePixel={0}
							//BackgroundTransparency={this.outputTransparency}
							BackgroundTransparency={theme.Dock.Transparency ?? this.outputTransparency}
							BackgroundColor3={theme.PrimaryBackgroundColor3}
							ClipsDescendants
							Size={new UDim2(1, 0, 0, this.state.sizeY)}
							Position={this.sizeY.map((v) => new UDim2(0, 0, 0, -this.state.sizeY + v))}
						>
							<frame
								Size={new UDim2(1, 0, 1, this.props.executionEnabled ? -30 : 0)}
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
									<ZirconIconButton
										Size={new UDim2(0, 16, 0, 28)}
										Icon="RightArrow"
										OnClick={() => {}}
									/>
									<ZirconSyntaxTextBox
										Size={new UDim2(1, -16, 1, 0)}
										Position={new UDim2(0, 16, 0, 0)}
										Focused={this.state.isVisible}
										AutoFocus
										Source={this.state.source}
										OnEnterSubmit={(input) => {
											this.props.addMessage(input);
											this.dispatch.SendToServer(input);
											this.setState({ historyIndex: 0, source: "" });
										}}
										OnHistoryTraversal={(direction) => {
											let index = this.state.historyIndex;
											if (direction === "back") {
												index = this.state.historyIndex--;
											} else if (direction === "forward") {
												index = this.state.historyIndex++;
											}

											this.setState({
												historyIndex: index,
												source: this.props.history[
													index < 0 ? this.props.history.size() - index : index
												],
											});
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
}
interface MappedProps {
	isVisible: boolean;
	executionEnabled: boolean;
	history: string[];
}
const mapStateToProps = (state: ConsoleReducer): MappedProps => {
	return {
		isVisible: state.visible,
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
	};
};

/**
 * A docked console
 */
const ZirconDockedConsole = connect(mapStateToProps, mapPropsToDispatch)(ZirconConsoleComponent);
export default ZirconDockedConsole;
