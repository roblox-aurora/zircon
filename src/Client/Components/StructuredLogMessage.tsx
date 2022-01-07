import { LogEvent, LogLevel } from "@rbxts/log";
import { MessageTemplateParser } from "@rbxts/message-templates";
import Roact from "@rbxts/roact";
import RoactHooks from "@rbxts/roact-hooks";
import { ZirconStructuredMessageTemplateRenderer } from "Client/Format/ZirconStructuredMessageTemplate";
import { ZirconContext } from "Client/Types";
import ThemeContext, { getRichTextColor3, italicize } from "Client/UIKit/ThemeContext";
import Flipper from "@rbxts/flipper";
import Padding from "./Padding";
import { formatRichText } from "Client/Format";
import RoactRodux, { connect } from "@rbxts/roact-rodux";
import ZirconClientStore from "Client/BuiltInConsole/Store";
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
		[this.height, this.setHeight] = Roact.createBinding(25);
		this.heightMotor = new Flipper.SingleMotor(this.height.getValue());
		this.heightMotor.onStep((value) => this.setHeight(value));
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
					const renderer = new ZirconStructuredMessageTemplateRenderer(tokens, theme);
					const text = renderer.Render(LogEvent);

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

					if (SourceContext !== undefined) {
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
										this.heightMotor.setGoal(new Flipper.Spring(25));
									} else {
										this.heightMotor.setGoal(new Flipper.Spring(25 + evtProps.size() * 30 + 5));
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
								Size={new UDim2(1, -15, 0, 25)}
								Text={messages.join(" ")}
								BackgroundTransparency={1}
								Font={theme.ConsoleFont}
								TextColor3={theme.PrimaryTextColor3}
								TextXAlignment="Left"
								TextSize={20}
							/>
							<frame
								Position={new UDim2(0, 30, 0, 25)}
								ClipsDescendants
								BorderSizePixel={0}
								BackgroundTransparency={1}
								Size={this.height.map((v) => new UDim2(1, -35, 0, v - 25))}
							>
								<uilistlayout Padding={new UDim(0, 5)} />
								{/* <uigridlayout
									CellPadding={new UDim2(0, 5, 0, 5)}
									CellSize={new UDim2(0.5, -5, 0, 25)}
								/> */}
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
}
const mapStateToProps = (props: ConsoleReducer): MappedProps => {
	return {
		logDetailsPaneEnabled: props.logDetailsPaneEnabled,
	};
};

export const StructuredLogMessage = connect(mapStateToProps)(StructuredLogMessageComponent);
