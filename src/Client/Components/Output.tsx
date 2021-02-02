import Roact from "@rbxts/roact";
import { connect } from "@rbxts/roact-rodux";
import { ConsoleMessage } from "../../Client/Types";
import UIKTheme from "../../Client/UIKit/ThemeContext";
import { ConsoleReducer } from "../../Client/BuiltInConsole/Store/_reducers/ConsoleReducer";
import ScrollView from "./ScrollView";

function OutputMessage(props: { Message: ConsoleMessage }) {
	return (
		<UIKTheme.Consumer
			render={(theme) => {
				return (
					<textlabel
						RichText
						Size={new UDim2(1, 0, 0, 20)}
						Text={props.Message.message}
						BackgroundTransparency={1}
						Font={theme.ConsoleFont}
						TextColor3={theme.PrimaryTextColor3}
						TextXAlignment="Left"
						TextSize={20}
					/>
				);
			}}
		/>
	);
}

interface OutputProps extends MappedProps {}
interface OutputState {
	output: ConsoleMessage[];
}
class OutputComponent extends Roact.Component<OutputProps, OutputState> {
	public constructor(props: OutputProps) {
		super(props);
		this.state = {
			output: props.output,
		};
	}

	public didUpdate(prevProps: OutputProps) {
		if (prevProps.output !== this.props.output) {
			this.setState({ output: this.props.output });
		}
	}

	public render() {
		return (
			<UIKTheme.Consumer
				render={(theme) => {
					return (
						<ScrollView Padding={{ PaddingHorizontal: 10 }}>
							{this.state.output.map((r) => (
								<OutputMessage Message={r} />
							))}
						</ScrollView>
					);
				}}
			/>
		);
	}
}

interface MappedProps {
	readonly output: ConsoleMessage[];
}
const mapStateToProps = (state: ConsoleReducer): MappedProps => {
	return {
		output: state.output,
	};
};

/**
 * A docked console
 */
const ZirconOutput = connect(mapStateToProps)(OutputComponent);
export default ZirconOutput;
