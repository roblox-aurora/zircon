import { LogEvent, LogLevel } from "@rbxts/log";
import { MessageTemplateParser, PlainTextMessageTemplateRenderer } from "@rbxts/message-templates";
import Roact from "@rbxts/roact";
import { ZirconStructuredMessageTemplateRenderer } from "Client/Format/ZirconStructuredMessageTemplate";
import { ZirconContext } from "Client/Types";
import ThemeContext, { getRichTextColor3, italicize } from "Client/UIKit/ThemeContext";
import Flipper, { Instant } from "@rbxts/flipper";
import Padding from "./Padding";
import { formatRichText } from "Client/Format";
import { connect } from "@rbxts/roact-rodux";
import { ConsoleReducer } from "Client/BuiltInConsole/Store/_reducers/ConsoleReducer";

function sanitise(input: string) {
	return input.gsub("[<>]", {
		">": "&gt;",
		"<": "&lt;",
	})[0];
}

export interface StructuredLogMessageProps extends MappedProps {
	readonly LogEvent: LogEvent;
	readonly Context: ZirconContext;
	readonly DetailedView?: boolean;
}
export interface StructuredLogMessageState {
	viewDetails: boolean;
	minHeight: number;
}

const keys: (keyof LogEvent)[] = ["Template", "Level", "Timestamp"];

export function getNonEventProps(logEvent: LogEvent) {
	const props = new Array<[string, unknown]>();
	for (const [key, value] of pairs(logEvent)) {
		if (!keys.includes(key)) {
			props.push([key as string, value]);
		}
	}
	return props;
}

class StructuredLogMessageComponent extends Roact.Component<StructuredLogMessageProps, StructuredLogMessageState> {
	private height: Roact.Binding<number>;
	private setHeight: Roact.BindingFunction<number>;
	private heightMotor: Flipper.SingleMotor;

	public constructor(props: StructuredLogMessageProps) {
		super(props);
		this.state = {
			viewDetails: false,
			minHeight: 25,
		};

		[this.height, this.setHeight] = Roact.createBinding(this.state.minHeight);
		this.heightMotor = new Flipper.SingleMotor(this.height.getValue());
		this.heightMotor.onStep((value) => this.setHeight(value));
	}

	public didMount() {
		const logEvent = this.props.LogEvent;
		const tokens = MessageTemplateParser.GetTokens(logEvent.Template);
		const plainText = new PlainTextMessageTemplateRenderer(tokens);
		const result = plainText.Render(logEvent);

		this.setState({ minHeight: result.split("\n").size() * 25 });
	}

	public didUpdate(_: {}, prevState: StructuredLogMessageState) {
		if (prevState.minHeight !== this.state.minHeight) {
			this.heightMotor.setGoal(new Instant(this.state.minHeight));
		}
	}

	public willUnmount() {
		this.heightMotor.destroy();
	}

	public render() {
		const { LogEvent, Context } = this.props;
		const { Template, Timestamp, Level, SourceContext } = LogEvent;
		const messages = new Array<string>();

		const tokens = MessageTemplateParser.GetTokens(sanitise(Template));
		const evtProps = getNonEventProps(this.props.LogEvent);

		return (
			<ThemeContext.Consumer
				render={(theme) => {
					const highlightRenderer = new ZirconStructuredMessageTemplateRenderer(tokens, theme);
					const text = highlightRenderer
						.Render(LogEvent)
						.split("\n")
						.map((f, i) => (i > 0 ? `${" ".rep(6)}${f}` : f))
						.join("\n");

					if (Level === LogLevel.Information) {
						messages.push(getRichTextColor3(theme, "Cyan", "INFO "));
						messages.push(getRichTextColor3(theme, "White", text));
					} else if (Level === LogLevel.Debugging) {
						messages.push(getRichTextColor3(theme, "Green", "DEBUG"));
						messages.push(getRichTextColor3(theme, "White", text));
					} else if (Level === LogLevel.Verbose) {
						messages.push(getRichTextColor3(theme, "Grey", "VERBOSE"));
						messages.push(getRichTextColor3(theme, "White", text));
					} else if (Level === LogLevel.Warning) {
						messages.push(getRichTextColor3(theme, "Yellow", "WARN "));
						messages.push(getRichTextColor3(theme, "White", text));
					} else if (Level === LogLevel.Error) {
						messages.push(getRichTextColor3(theme, "Red", "ERROR "));
						messages.push(getRichTextColor3(theme, "Yellow", text));
					} else if (Level === LogLevel.Fatal) {
						messages.push(getRichTextColor3(theme, "Red", "FATAL "));
						messages.push(getRichTextColor3(theme, "Red", text));
					}

					if (SourceContext !== undefined && this.props.showTagsInOutput) {
						messages.push(
							"- " + italicize(getRichTextColor3(theme, "Grey", tostring(LogEvent.SourceContext))),
						);
					}

					return (
						<imagebutton
							AutoButtonColor={this.props.logDetailsPaneEnabled}
							Size={this.height.map((v) => new UDim2(1, 0, 0, v))}
							BackgroundTransparency={0.5}
							BackgroundColor3={theme.SecondaryBackgroundColor3}
							BorderSizePixel={0}
							Event={{
								MouseButton1Click: () => {
									if (!this.props.logDetailsPaneEnabled) return;

									if (this.state.viewDetails) {
										this.heightMotor.setGoal(new Flipper.Spring(this.state.minHeight));
									} else {
										this.heightMotor.setGoal(
											new Flipper.Spring(this.state.minHeight + evtProps.size() * 30 + 5),
										);
									}

									this.setState({ viewDetails: !this.state.viewDetails });
								},
							}}
						>
							<frame
								Size={new UDim2(0, 5, 1, 0)}
								BackgroundColor3={
									Context === ZirconContext.Server
										? theme.ServerContextColor
										: theme.ClientContextColor
								}
								BorderSizePixel={0}
							/>
							<textlabel
								RichText
								Position={new UDim2(0, 10, 0, 0)}
								Size={new UDim2(1, -15, 0, this.state.minHeight)}
								Text={messages.join(" ")}
								BackgroundTransparency={1}
								Font={theme.ConsoleFont}
								TextColor3={theme.PrimaryTextColor3}
								TextXAlignment="Left"
								TextSize={20}
							/>
							<frame
								Position={new UDim2(0, 30, 0, this.state.minHeight)}
								ClipsDescendants
								BorderSizePixel={0}
								BackgroundTransparency={1}
								Size={this.height.map((v) => new UDim2(1, -35, 0, v - 25))}
							>
								<uilistlayout Padding={new UDim(0, 5)} />
								{this.props.logDetailsPaneEnabled &&
									this.state.viewDetails &&
									evtProps.map(([key, value]) => {
										return (
											<frame
												BackgroundTransparency={1}
												Size={new UDim2(1, 0, 0, 25)}
												BorderSizePixel={0}
											>
												<Padding Padding={{ Horizontal: 5 }} />
												<uilistlayout FillDirection="Horizontal" Padding={new UDim(0, 10)} />
												<textlabel
													Text={key}
													Font={theme.ConsoleFont}
													TextSize={16}
													BackgroundTransparency={1}
													Size={new UDim2(0.25, 0, 1, 0)}
													TextColor3={theme.PrimaryTextColor3}
													TextXAlignment="Left"
												/>
												<textlabel
													Text={formatRichText(value, undefined, theme)}
													Font={theme.ConsoleFont}
													TextSize={16}
													RichText
													BackgroundTransparency={1}
													Size={new UDim2(0.75, 0, 1, 0)}
													TextColor3={theme.PrimaryTextColor3}
													TextXAlignment="Left"
												/>
											</frame>
										);
									})}
							</frame>
						</imagebutton>
					);
				}}
			/>
		);
	}
}

export interface MappedProps {
	readonly logDetailsPaneEnabled: boolean;
	readonly showTagsInOutput: boolean;
}
const mapStateToProps = (props: ConsoleReducer): MappedProps => {
	return {
		logDetailsPaneEnabled: props.logDetailsPaneEnabled,
		showTagsInOutput: props.showTagsInOutput,
	};
};

export const StructuredLogMessage = connect(mapStateToProps)(StructuredLogMessageComponent);
