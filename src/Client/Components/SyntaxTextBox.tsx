import Roact from "@rbxts/roact";
import ZirconIcon from "./Icon";
import { ZrRichTextHighlighter } from "@rbxts/zirconium/out/Ast";
import ThemeContext, { convertColorObjectToHex, ThemeSyntaxColors } from "../../Client/UIKit/ThemeContext";
import Maid from "@rbxts/maid";
import { UserInputService } from "@rbxts/services";

interface SyntaxTextBoxState {
	source: string;
	cursorPosition: number;
	virtualCursorPosition: number;
	focused?: boolean;
}
interface SyntaxTextBoxProps {
	/**
	 * The source string
	 */
	Source: string;

	/** The size of this textbox */
	Size?: UDim2;
	/** The position of this textbox */
	Position?: UDim2;
	/** Whether or not this textbox is focused */
	Focused?: boolean;
	/**
	 * Whether or not to auto focus this text box
	 */
	AutoFocus?: boolean;
	/**
	 * Whether or not this textbox is multi lined
	 */
	MultiLine?: boolean;

	/**
	 * The placeholder text
	 */
	PlaceholderText?: string;

	/**
	 * When this text box is submitted (if not `MultiLine`)
	 */
	OnEnterSubmit?: (input: string) => void;

	OnHistoryTraversal?: (direction: "back" | "forward") => void;
}

/**
 * A basic syntax text box
 */
export default class ZirconSyntaxTextBox extends Roact.Component<SyntaxTextBoxProps, SyntaxTextBoxState> {
	private ref = Roact.createRef<TextBox>();
	private maid = new Maid();
	public constructor(props: SyntaxTextBoxProps) {
		super(props);
		this.state = {
			source: props.Source,
			cursorPosition: 0,
			virtualCursorPosition: 0,
		};
	}

	public didMount() {
		const textBox = this.ref.getValue();
		if (textBox) {
			this.maid.GiveTask(
				UserInputService.InputEnded.Connect((io, gameProcessed) => {
					if (this.state.focused) {
						if (io.KeyCode === Enum.KeyCode.Up) {
							this.props.OnHistoryTraversal?.("back");
						} else if (io.KeyCode === Enum.KeyCode.Down) {
							this.props.OnHistoryTraversal?.("forward");
						}
					}
				}),
			);
		}
	}

	public willUnmount() {
		this.maid.DoCleaning();
	}

	public didUpdate(prevProps: SyntaxTextBoxProps) {
		const textBox = this.ref.getValue();
		if (prevProps.Focused !== this.props.Focused && this.props.AutoFocus && textBox) {
			if (this.props.Focused) {
				textBox.CaptureFocus();
			} else {
				textBox.ReleaseFocus();
			}
		}

		if (this.props.Source !== prevProps.Source) {
			this.setState({ source: this.props.Source });
		}
	}

	public render() {
		return (
			<ThemeContext.Consumer
				render={(theme) => {
					const highlighter = new ZrRichTextHighlighter(
						this.state.source,
						theme.SyntaxHighlighter
							? convertColorObjectToHex<ThemeSyntaxColors>(theme.SyntaxHighlighter)
							: undefined,
					);
					return (
						<frame
							Size={this.props.Size ?? new UDim2(1, 0, 1, 0)}
							Position={this.props.Position}
							BackgroundColor3={theme.SecondaryBackgroundColor3}
							BorderSizePixel={0}
						>
							<uipadding
								PaddingLeft={new UDim(0, 5)}
								PaddingRight={new UDim(0, 5)}
								PaddingBottom={new UDim(0, 5)}
								PaddingTop={new UDim(0, 5)}
							/>
							<textbox
								Ref={this.ref}
								BackgroundTransparency={1}
								Font="Code"
								TextSize={18}
								TextXAlignment="Left"
								TextYAlignment="Top"
								PlaceholderColor3={theme.SecondaryTextColor3}
								PlaceholderText={this.props.PlaceholderText}
								CursorPosition={this.state.cursorPosition}
								MultiLine={this.props.MultiLine}
								Size={new UDim2(1, 0, 1, 0)}
								Text={this.state.source}
								Change={{
									Text: (rbx) => this.setState({ source: rbx.Text.gsub("\t", " ")[0] }),
									CursorPosition: (rbx) =>
										this.setState({ virtualCursorPosition: rbx.CursorPosition }),
								}}
								TextTransparency={0.75}
								Event={{
									Focused: (textBox) => {
										this.setState({ focused: true });
									},
									FocusLost: (textBox, enterPressed, inputThatCausedFocusLoss) => {
										if (enterPressed && !this.props.MultiLine) {
											this.props.OnEnterSubmit?.(textBox.Text);
										}
										this.setState({ focused: false });
									},
								}}
								TextColor3={theme.PrimaryTextColor3}
							/>
							<textlabel
								TextXAlignment="Left"
								TextYAlignment="Top"
								Font="Code"
								Size={new UDim2(1, 0, 1, 0)}
								TextSize={18}
								RichText
								BackgroundTransparency={1}
								Text={highlighter.parse()}
								TextColor3={Color3.fromRGB(198, 204, 215)}
							/>
							{this.state.source !== "" && (
								<textbutton
									BackgroundTransparency={1}
									Text=""
									Size={new UDim2(0, 20, 0, 20)}
									Position={new UDim2(1, -25, 0, 0)}
									Event={{ MouseButton1Click: () => this.setState({ source: "" }) }}
								>
									<uilistlayout VerticalAlignment="Center" HorizontalAlignment="Center" />
									<ZirconIcon Icon="Close" />
								</textbutton>
							)}
						</frame>
					);
				}}
			/>
		);
	}
}
