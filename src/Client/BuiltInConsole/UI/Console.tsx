import Roact from "@rbxts/roact";
import { SingleMotor, Spring } from "@rbxts/flipper";
import { connect } from "@rbxts/roact-rodux";
import { ConsoleReducer } from "../Store/_reducers/ConsoleReducer";
import ZirconSyntaxTextBox from "../../Components/SyntaxTextBox";

interface ConsoleProps extends MappedProps {}
interface ConsoleState {
	isVisible: boolean;
}

/**
 * The console
 */
class ZirconConsoleComponent extends Roact.Component<ConsoleProps, ConsoleState> {
	private sizeY: Roact.RoactBinding<number>;
	private sizeYMotor: SingleMotor;

	public constructor(props: ConsoleProps) {
		super(props);
		this.sizeYMotor = new SingleMotor(0);
		let setSizeY: Roact.RoactBindingFunc<number>;
		[this.sizeY, setSizeY] = Roact.createBinding(this.sizeYMotor.getValue());
		this.sizeYMotor.onStep((value) => setSizeY(value));
	}

	public didMount() {}

	public didUpdate(prevProps: ConsoleProps) {
		if (prevProps.isVisible !== this.props.isVisible) {
			this.sizeYMotor.setGoal(new Spring(this.props.isVisible ? 50 : 0));
		}
	}

	public render() {
		return (
			<screengui DisplayOrder={10000}>
				<frame
					Key="ZirconViewport"
					BackgroundTransparency={0.5}
					ClipsDescendants
					Size={this.sizeY.map((v) => new UDim2(1, 0, 0, v))}
					Position={this.sizeY.map((v) => new UDim2(0, 0, 1, -v))}
				>
					<ZirconSyntaxTextBox Source="" />
				</frame>
			</screengui>
		);
	}
}

interface MappedProps {
	isVisible: boolean;
}
const mapStateToProps = (state: ConsoleReducer): MappedProps => {
	return {
		isVisible: state.visible,
	};
};

const ZirconConsole = connect(mapStateToProps)(ZirconConsoleComponent);
export default ZirconConsole;
