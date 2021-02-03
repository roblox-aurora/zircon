import Roact from "@rbxts/roact";
import { SingleMotor, Spring } from "@rbxts/flipper";
import { connect } from "@rbxts/roact-rodux";
import { ConsoleActionName, ConsoleReducer } from "../Store/_reducers/ConsoleReducer";
import ZirconSyntaxTextBox from "../../Components/SyntaxTextBox";
import { ZirconIconButton } from "../../Components/Icon";
import Zircon from "../..";
import Remotes from "../../../Shared/Remotes";
import { RemoteId } from "../../../RemoteId";
import ClientEvent from "@rbxts/net/out/client/ClientEvent";
import { $dbg } from "rbxts-transform-debug";
import ZirconOutput from "../../../Client/Components/Output";
import { DispatchParam } from "@rbxts/rodux";
import ZirconClientStore from "../Store";

export interface DockedConsoleProps extends MappedProps, MappedDispatch {}
interface DockedConsoleState {
	isVisible: boolean;
	isFullView: boolean;
	sizeY: number;
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
			sizeY: MAX_SIZE,
		};

		// Initialization
		this.sizeYMotor = new SingleMotor(0);
		this.outputTransparencyMotor = new SingleMotor(0);
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
			this.sizeYMotor.setGoal(new Spring(this.props.isVisible ? this.state.sizeY : 0));
			this.setState({ isVisible: this.props.isVisible });
		}
	}

	public render() {
		return (
			<screengui DisplayOrder={10000}>
				<frame
					Key="ZirconViewport"
					BorderSizePixel={0}
					BackgroundTransparency={this.outputTransparency}
					BackgroundColor3={Color3.fromRGB(33, 37, 43)}
					//BackgroundColor3={Color3.fromRGB(24, 26, 31)}
					ClipsDescendants
					Size={new UDim2(1, 0, 0, this.state.sizeY)}
					// Size={this.sizeY.map((v) => new UDim2(1, 0, 0, v))}
					Position={this.sizeY.map((v) => new UDim2(0, 0, 1, -v))}
				>
					<frame Size={new UDim2(1, 0, 1, -30)} BackgroundTransparency={1}>
						<ZirconOutput />
					</frame>
					{this.props.executionEnabled && (
						<frame
							BorderColor3={Color3.fromRGB(40, 40, 40)}
							//BorderSizePixel={0}
							// BackgroundColor3={Color3.fromRGB(33, 37, 43)}
							BackgroundColor3={Color3.fromRGB(24, 26, 31)}
							Size={new UDim2(1, 0, 0, 28)}
							Position={new UDim2(0, 0, 1, -28)}
						>
							<ZirconIconButton Size={new UDim2(0, 16, 0, 28)} Icon="RightArrow" OnClick={() => {}} />
							<ZirconSyntaxTextBox
								Size={new UDim2(1, -16, 1, 0)}
								Position={new UDim2(0, 16, 0, 0)}
								Focused={this.state.isVisible}
								AutoFocus
								Source=""
								OnEnterSubmit={(input) => {
									$dbg(input);
									this.props.addMessage("> " + input);
									this.dispatch.SendToServer(input);
								}}
							/>
						</frame>
					)}
				</frame>
			</screengui>
		);
	}
}

interface MappedDispatch {
	addMessage: (message: string) => void;
}
interface MappedProps {
	isVisible: boolean;
	executionEnabled: boolean;
}
const mapStateToProps = (state: ConsoleReducer): MappedProps => {
	return {
		isVisible: state.visible,
		executionEnabled: state.executionEnabled,
	};
};
const mapPropsToDispatch = (dispatch: DispatchParam<ZirconClientStore>): MappedDispatch => {
	return {
		addMessage: (message) => {
			dispatch({
				type: ConsoleActionName.AddOutput,
				message: {
					type: "plain",
					message,
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
