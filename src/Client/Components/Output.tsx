import Roact from "@rbxts/roact";
import { connect } from "@rbxts/roact-rodux";
import {
	ConsoleMessage,
	ConsolePlainMessage,
	ZrOutputMessage,
	ConsoleSyntaxMessage,
	ZirconContext,
	ZirconMessageType,
} from "../../Client/Types";
import ThemeContext, { getRichTextColor3 } from "../../Client/UIKit/ThemeContext";
import { ConsoleReducer } from "../../Client/BuiltInConsole/Store/_reducers/ConsoleReducer";
import ScrollView from "./ScrollView";
import { ZrRichTextHighlighter } from "@rbxts/zirconium-ast";
import ZirconIcon from "./Icon";
import { LocalizationService } from "@rbxts/services";
import ZirconOutputMessage from "./OutputMessage";
import { ZirconNetworkMessageType } from "../../Shared/Remotes";

function OutputPlain(props: { Message: ConsolePlainMessage | ConsoleSyntaxMessage }) {
	const message = props.Message;
	if (message.type === ZirconMessageType.ZirconiumExecutionMessage) {
		return (
			<ThemeContext.Consumer
				render={(theme) => {
					return (
						<frame Size={new UDim2(1, 0, 0, 25)} BackgroundTransparency={1}>
							<ZirconIcon Icon="RightArrow" Position={new UDim2(0, -3, 0, 6)} />
							<textlabel
								RichText
								Position={new UDim2(0, 20, 0, 0)}
								Size={new UDim2(1, -20, 1, 0)}
								Text={new ZrRichTextHighlighter(message.source).parse()}
								BackgroundTransparency={1}
								Font={theme.ConsoleFont}
								TextColor3={theme.PrimaryTextColor3}
								TextXAlignment="Left"
								TextSize={20}
							/>
						</frame>
					);
				}}
			/>
		);
	} else {
		return (
			<ThemeContext.Consumer
				render={(theme) => {
					return (
						<textlabel
							RichText
							Size={new UDim2(1, 0, 0, 25)}
							Text={message.message}
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
			<ThemeContext.Consumer
				render={() => {
					return (
						<ScrollView
							AutoScrollToEnd
							Padding={{ PaddingHorizontal: 5, PaddingVertical: 5 }}
							ItemPadding={new UDim(0, 5)}
						>
							{this.state.output.map((output) => {
								if (
									output.type === ZirconMessageType.ZirconiumError ||
									output.type === "luau:error" ||
									output.type === ZirconMessageType.ZirconLogErrorMessage ||
									output.type === ZirconMessageType.ZirconLogOutputMesage ||
									output.type === ZirconMessageType.ZirconiumOutput
								) {
									return <ZirconOutputMessage Message={output} />;
								} else {
									return <OutputPlain Message={output} />;
								}
							})}
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
