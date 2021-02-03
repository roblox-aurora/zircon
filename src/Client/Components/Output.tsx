import Roact from "@rbxts/roact";
import { connect } from "@rbxts/roact-rodux";
import { ConsoleMessage, ConsoleStderrMessage, ConsoleStdoutMessage } from "../../Client/Types";
import UIKTheme, { getRichTextColor3, getThemeRichTextColor } from "../../Client/UIKit/ThemeContext";
import { ConsoleReducer } from "../../Client/BuiltInConsole/Store/_reducers/ConsoleReducer";
import ScrollView from "./ScrollView";

function OutputError(props: { Message: ConsoleStderrMessage }) {
	const { error } = props.Message;
	return (
		<UIKTheme.Consumer
			render={(theme) => {
				const grey = getThemeRichTextColor(theme, "Grey");
				return (
					<textlabel
						RichText
						Size={new UDim2(1, 0, 0, 25)}
						Text={`${getRichTextColor3(theme, "Grey", "[Zr]")} ${getRichTextColor3(
							theme,
							"Red",
							"error",
						)} ${getRichTextColor3(theme, "Grey", `ZR${"%.4d".format(error.code)}:`)} ${getRichTextColor3(
							theme,
							"White",
							error.message,
						)}`}
						BackgroundTransparency={1}
						Font={theme.ConsoleFont}
						TextColor3={theme.ErrorTextColor3}
						TextXAlignment="Left"
						TextSize={20}
					/>
				);
			}}
		/>
	);
}

function OutputMessage(props: { Message: ConsoleStdoutMessage }) {
	return (
		<UIKTheme.Consumer
			render={(theme) => {
				return (
					<textlabel
						RichText
						Size={new UDim2(1, 0, 0, 25)}
						Text={`${getRichTextColor3(theme, "Grey", "[Zr]")} ${props.Message.message}`}
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
						<ScrollView AutoScrollToEnd Padding={{ PaddingHorizontal: 10 }}>
							{this.state.output.map((r) =>
								r.type === "zr:error" ? <OutputError Message={r} /> : <OutputMessage Message={r} />,
							)}
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
