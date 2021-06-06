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
	italicize,
} from "../../Client/UIKit/ThemeContext";
import { ZirconDebugInformation, ZirconNetworkMessageType } from "../../Shared/Remotes";
import { ZrRichTextHighlighter } from "@rbxts/zirconium/out/Ast";
import StringUtils from "@rbxts/string-utils";
import { padEnd } from "Shared/Strings";
import { formatParse, formatTokens } from "Client/Format";

interface OutputMessageProps {
	Message: ZrOutputMessage | ZirconLogMessage | ZrOutputMessage;
	ShowTags?: boolean;
}
function OutputMessage(props: OutputMessageProps) {
	const output = props.Message;

	return (
		<ThemeContext.Consumer
			render={(theme) => {
				const messages = new Array<string>();

				if (output.type === ZirconMessageType.ZirconiumOutput) {
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
					messages.push(message.message);
				} else if (output.type === ZirconMessageType.ZirconLogOutputMesage) {
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

					const text =
						(message.data.Variables?.size() ?? 0) > 0
							? formatTokens(formatParse(message.message), message.data.Variables)
							: message.message;

					if (message.level === ZirconLogLevel.Info) {
						messages.push(getRichTextColor3(theme, "Cyan", "INFO "));
						messages.push(getRichTextColor3(theme, "White", text));
					} else if (message.level === ZirconLogLevel.Debug) {
						messages.push(getRichTextColor3(theme, "Green", "DEBUG"));
						messages.push(getRichTextColor3(theme, "White", text));
					} else if (message.level === ZirconLogLevel.Warning) {
						messages.push(getRichTextColor3(theme, "Yellow", "WARN "));
						messages.push(getRichTextColor3(theme, "White", text));
					}

					if (props.ShowTags && message.tag) {
						// const toAppend = padEnd(message.tag ?? "", 20, " ");
						messages.push("- " + italicize(getRichTextColor3(theme, "Grey", message.tag)));
					}
				}

				return (
					<frame
						Size={new UDim2(1, 0, 0, 25)}
						BackgroundTransparency={0.5}
						BackgroundColor3={theme.PrimaryBackgroundColor3}
						BorderSizePixel={0}
					>
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

function OutputError(props: { Message: ZrErrorMessage | ZirconLogError; ShowTags: boolean }) {
	const output = props.Message;

	return (
		<ThemeContext.Consumer
			render={(theme) => {
				const messages = new Array<string>();

				if (output.type === ZirconMessageType.ZirconiumError) {
					const { error: zrError } = output;
					messages.push(
						getRichTextColor3(
							theme,
							"Grey",
							`[${DateTime.fromUnixTimestamp(zrError.time).FormatLocalTime(
								"LT",
								LocalizationService.SystemLocaleId,
							)}]`,
						),
					);

					if (zrError.script !== undefined) {
						let inner = getRichTextColor3(theme, "Cyan", zrError.script);
						if (zrError.source !== undefined) {
							inner += `:${getRichTextColor3(
								theme,
								"Yellow",
								tostring(zrError.source[0]),
							)}:${getRichTextColor3(theme, "Yellow", tostring(zrError.source[1]))}`;
						}
						messages.push(getRichTextColor3(theme, "White", inner + " -"));
					}
					messages.push(getRichTextColor3(theme, "Red", "error"));
					messages.push(getRichTextColor3(theme, "Grey", `ZR${"%.4d".format(zrError.code)}:`));
					messages.push(getRichTextColor3(theme, "White", zrError.message));
				} else if (output.type === ZirconMessageType.ZirconLogErrorMessage) {
					const { error: zrError } = output;
					messages.push(
						getRichTextColor3(
							theme,
							"Grey",
							`[${DateTime.fromUnixTimestamp(zrError.time).FormatLocalTime(
								"LT",
								LocalizationService.SystemLocaleId,
							)}]`,
						),
					);

					if (zrError.level === ZirconLogLevel.Error) {
						messages.push(getRichTextColor3(theme, "Red", "ERROR"));
						messages.push(getRichTextColor3(theme, "Yellow", zrError.message));
					} else if (zrError.level === ZirconLogLevel.Wtf) {
						messages.push(getRichTextColor3(theme, "Red", "FAIL "));
						messages.push(getRichTextColor3(theme, "Yellow", zrError.message));
					}

					if (props.ShowTags && zrError.tag) {
						// const toAppend = padEnd(zrError.tag ?? "", 20, " ");
						messages.push("- " + italicize(getRichTextColor3(theme, "Grey", zrError.tag)));
					}
				}

				return (
					<frame
						Size={new UDim2(1, 0, 0, 25)}
						BackgroundTransparency={0.5}
						BackgroundColor3={theme.PrimaryBackgroundColor3}
						BorderSizePixel={0}
					>
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
					<frame Size={new UDim2(1, 0, 0, 30)} Position={new UDim2(0.1, 0, 0, 0)} BackgroundTransparency={1}>
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
	ShowTags: boolean;
}
export default class ZirconOutputMessage extends Roact.PureComponent<ZirconOutputMessageProps> {
	public render() {
		const { Message } = this.props;

		if (
			Message.type === ZirconMessageType.ZirconiumError ||
			Message.type === ZirconMessageType.ZirconLogErrorMessage
		) {
			const { error: zrError } = Message;

			if (
				zrError.type === ZirconNetworkMessageType.ZirconiumParserError ||
				zrError.type === ZirconNetworkMessageType.ZirconiumRuntimeError
			) {
				if (zrError.debug !== undefined) {
					return (
						<Roact.Fragment>
							<OutputError ShowTags={this.props.ShowTags} Message={Message} />
							<ErrorLine Highlight TokenInfo={zrError.debug} />
						</Roact.Fragment>
					);
				}
			}

			return <OutputError ShowTags={this.props.ShowTags} Message={Message} />;
		} else if (
			Message.type === ZirconMessageType.ZirconiumOutput ||
			Message.type === ZirconMessageType.ZirconLogOutputMesage
		) {
			return <OutputMessage ShowTags={this.props.ShowTags} Message={Message} />;
		}

		return undefined;
	}
}
