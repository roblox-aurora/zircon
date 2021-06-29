import Roact from "@rbxts/roact";
import { connect } from "@rbxts/roact-rodux";
import {
	ConsoleMessage,
	ConsolePlainMessage,
	ConsoleSyntaxMessage,
	ZirconMessageType,
	isContextMessage,
	getMessageText,
	getLogLevel,
} from "../../Client/Types";
import ThemeContext from "../../Client/UIKit/ThemeContext";
import { ConsoleReducer } from "../../Client/BuiltInConsole/Store/_reducers/ConsoleReducer";
import ScrollView from "./ScrollView";
import { ZrRichTextHighlighter } from "@rbxts/zirconium/out/Ast";
import ZirconIcon from "./Icon";
import ZirconOutputMessage from "./OutputMessage";
import { last } from "Shared/Collections";
import StringUtils from "@rbxts/string-utils";

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
									output.type === ZirconMessageType.ZirconiumOutput ||
									output.type === ZirconMessageType.StructuredLog
								) {
									return <ZirconOutputMessage ShowTags={this.props.showTags} Message={output} />;
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
	readonly showTags: boolean;
}
const mapStateToProps = (state: ConsoleReducer): MappedProps => {
	const { filter } = state;

	let output = state.output;

	if (filter) {
		if (filter.Context !== undefined) {
			output = output.filter((message) => isContextMessage(message) && message.context === filter.Context);
		}
		if (typeIs(filter.SearchQuery, "string")) {
			const { SearchQuery } = filter;
			output = output.filter((message) => {
				return StringUtils.includes(getMessageText(message), SearchQuery);
			});
		}

		output = output.filter((message) => filter.Levels.has(getLogLevel(message)));
	}

	return {
		output: filter?.Tail ? last(output, 25) : last(output, 100),
		showTags: state.showTagsInOutput,
	};
};

/**
 * A docked console
 */
const ZirconOutput = connect(mapStateToProps)(OutputComponent);
export default ZirconOutput;
