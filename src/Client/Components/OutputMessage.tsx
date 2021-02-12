import Roact from "@rbxts/roact";
import { LocalizationService } from "@rbxts/services";
import {
	ZrOutputMessage,
	ZirconLogMessage,
	ZirconMessageType,
	ZirconLogLevel,
	ZirconContext,
	ZrErrorMessage,
	ZirconLogError,
	ConsoleMessage,
} from "../../Client/Types";
import ThemeContext, {
	getRichTextColor3,
	ZirconThemeDefinition,
	getThemeRichTextColor,
} from "../../Client/UIKit/ThemeContext";
import { ZirconDebugInformation, ZirconNetworkMessageType } from "../../Shared/Remotes";
import { ZrRichTextHighlighter } from "@rbxts/zirconium-ast";

interface OutputMessageProps {
	Message: ZrOutputMessage | ZirconLogMessage;
}
function OutputMessage(props: OutputMessageProps) {
	const output = props.Message;

	return (
		<ThemeContext.Consumer
			render={(theme) => {
				const messages = new Array<string>();

				switch (output.type) {
					case ZirconMessageType.ZirconiumOutput: {
						const { message } = output;
						messages.push(
							getRichTextColor3(
								theme,
								"Grey",
								`[${DateTime.fromUnixTimestamp(message.time).FormatLocalTime(
									"LT",
									LocalizationService.SystemLocaleId,
								)}]`,
							),
						);
						break;
					}
					case ZirconMessageType.ZirconLogOutputMesage: {
						const { message } = output;
						messages.push(
							getRichTextColor3(
								theme,
								"Grey",
								`[${DateTime.fromUnixTimestamp(message.time).FormatLocalTime(
									"LT",
									LocalizationService.SystemLocaleId,
								)}]`,
							),
						);

						if (message.level === ZirconLogLevel.Info) {
							messages.push(getRichTextColor3(theme, "Cyan", "info"));
							messages.push(getRichTextColor3(theme, "White", message.message));
						} else if (message.level === ZirconLogLevel.Debug) {
							messages.push(getRichTextColor3(theme, "Green", "debug"));
							messages.push(getRichTextColor3(theme, "White", message.message));
						} else if (message.level === ZirconLogLevel.Warning) {
							messages.push(getRichTextColor3(theme, "Yellow", "warn"));
							messages.push(getRichTextColor3(theme, "White", message.message));
						}
						break;
					}
				}

				return (
					<frame Size={new UDim2(1, 0, 0, 25)} BackgroundTransparency={1}>
						<frame
							Size={new UDim2(0, 5, 1, 0)}
							BackgroundColor3={
								props.Message.context === ZirconContext.Server
									? theme.ServerContextColor
									: theme.ClientContextColor
							}
							BorderSizePixel={0}
						/>
						<textlabel
							RichText
							Position={new UDim2(0, 10, 0, 0)}
							Size={new UDim2(1, -15, 0, 25)}
							Text={messages.join(" ")}
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
}

function OutputError(props: { Message: ZrErrorMessage | ZirconLogError }) {
	const output = props.Message;

	return (
		<ThemeContext.Consumer
			render={(theme) => {
				const messages = new Array<string>();

				if (output.type === ZirconMessageType.ZirconiumError) {
					const { error } = output;
					messages.push(
						getRichTextColor3(
							theme,
							"Grey",
							`[${DateTime.fromUnixTimestamp(error.time).FormatLocalTime(
								"LT",
								LocalizationService.SystemLocaleId,
							)}]`,
						),
					);

					if (error.script !== undefined) {
						let inner = getRichTextColor3(theme, "Cyan", error.script);
						if (error.source !== undefined) {
							inner += `:${getRichTextColor3(
								theme,
								"Yellow",
								tostring(error.source[0]),
							)}:${getRichTextColor3(theme, "Yellow", tostring(error.source[1]))}`;
						}
						messages.push(getRichTextColor3(theme, "White", inner + " -"));
					}
					messages.push(getRichTextColor3(theme, "Red", "error"));
					messages.push(getRichTextColor3(theme, "Grey", `ZR${"%.4d".format(error.code)}:`));
					messages.push(getRichTextColor3(theme, "White", error.message));
				} else if (output.type === ZirconMessageType.ZirconLogErrorMessage) {
					const { error } = output;
					messages.push(
						getRichTextColor3(
							theme,
							"Grey",
							`[${DateTime.fromUnixTimestamp(error.time).FormatLocalTime(
								"LT",
								LocalizationService.SystemLocaleId,
							)}]`,
						),
					);

					if (error.level === ZirconLogLevel.Error) {
						messages.push(getRichTextColor3(theme, "Red", "error"));
						messages.push(getRichTextColor3(theme, "Yellow", error.message));
					} else if (error.level === ZirconLogLevel.Wtf) {
						messages.push(getRichTextColor3(theme, "Red", "wtf"));
						messages.push(getRichTextColor3(theme, "Yellow", error.message));
					}
				}

				return (
					<frame Size={new UDim2(1, 0, 0, 25)} BackgroundTransparency={1}>
						<frame
							Size={new UDim2(0, 5, 1, 0)}
							BackgroundColor3={
								props.Message.context === ZirconContext.Server
									? theme.ServerContextColor
									: theme.ClientContextColor
							}
							BorderSizePixel={0}
						/>
						<textlabel
							RichText
							Position={new UDim2(0, 10, 0, 0)}
							Size={new UDim2(1, -15, 0, 25)}
							Text={messages.join(" ")}
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
}

function ErrorLine({ TokenInfo, Highlight = true }: { TokenInfo: ZirconDebugInformation; Highlight?: boolean }) {
	return (
		<ThemeContext.Consumer
			render={(theme) => {
				return (
					<frame BackgroundTransparency={1} Size={new UDim2(1, 0, 0, 30)} Position={new UDim2(0.1, 0, 0, 0)}>
						<textlabel
							Text={tostring(TokenInfo.LineAndColumn[0])}
							TextColor3={theme.PrimaryBackgroundColor3}
							BackgroundColor3={theme.PrimaryTextColor3}
							Size={new UDim2(0, 20, 1, 0)}
							Position={new UDim2(0, 20, 0, 0)}
							Font={theme.ConsoleFont}
							TextSize={20}
							TextXAlignment="Center"
						/>
						<textlabel
							RichText
							BackgroundTransparency={1}
							Size={new UDim2(1, 0, 0, 30)}
							Position={new UDim2(0, 20 + 25, 0, 0)}
							Text={Highlight ? new ZrRichTextHighlighter(TokenInfo.Line).parse() : TokenInfo.Line}
							Font={theme.ConsoleFont}
							TextSize={20}
							TextXAlignment="Left"
							TextColor3={theme.PrimaryTextColor3}
						/>
						<textlabel
							BackgroundTransparency={1}
							TextXAlignment="Left"
							RichText
							Font={theme.ConsoleFont}
							TextSize={20}
							TextColor3={theme.PrimaryTextColor3}
							Text={getErrorLine(theme, TokenInfo).ErrorLine}
							Size={new UDim2(1, 0, 0, 30)}
							Position={new UDim2(0, 20 + 25, 0, 0)}
						/>
					</frame>
				);
			}}
		/>
	);
}

function getErrorLine(theme: ZirconThemeDefinition, { Line, TokenLinePosition }: ZirconDebugInformation) {
	const red = getThemeRichTextColor(theme, "Red");
	let resultingString = "";
	let errorArrows = "";
	for (let i = 1; i <= Line.size(); i++) {
		const char = " "; // Line.sub(i, i);
		if (i === TokenLinePosition[0] && i === TokenLinePosition[1]) {
			resultingString += '<font color="' + red + '"><u>' + char + "</u></font>";
			errorArrows += '<font color="' + red + '"><u>^</u></font>';
		} else if (i === TokenLinePosition[0]) {
			resultingString += '<font color="' + red + '"><u>' + char;
			errorArrows += '<font color="' + red + '"><u>^';
		} else if (i > TokenLinePosition[0] && i < TokenLinePosition[1]) {
			resultingString += " ";
			errorArrows += "^";
		} else if (i === TokenLinePosition[1]) {
			resultingString += char + "</u></font>";
			errorArrows += char + "^</u></font>";
		} else {
			resultingString += char;
		}
	}
	return {
		ErrorLine: resultingString,
	};
}

interface ZirconOutputMessageProps {
	Message: ConsoleMessage;
}
export default class ZirconOutputMessage extends Roact.PureComponent<ZirconOutputMessageProps> {
	public render() {
		const { Message } = this.props;

		if (
			Message.type === ZirconMessageType.ZirconiumError ||
			Message.type === ZirconMessageType.ZirconLogErrorMessage
		) {
			const { error } = Message;

			if (
				error.type === ZirconNetworkMessageType.ZirconiumParserError ||
				error.type === ZirconNetworkMessageType.ZirconiumRuntimeError
			) {
				if (error.debug !== undefined) {
					return (
						<Roact.Fragment>
							<OutputError Message={Message} />
							<ErrorLine Highlight TokenInfo={error.debug} />
						</Roact.Fragment>
					);
				}
			}

			return <OutputError Message={Message} />;
		} else if (
			Message.type === ZirconMessageType.ZirconiumOutput ||
			Message.type === ZirconMessageType.ZirconLogOutputMesage
		) {
			return <OutputMessage Message={Message} />;
		}

		print(`undefined === "${Message.type}"`);
		return undefined;
	}
}
