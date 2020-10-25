import Roact from "@rbxts/roact";
import ZrRichTextHighlighter from "../TemporaryHighlighter";
import ZirconIcon from "./Icon";

interface SyntaxTextBoxState {
	source: string;
}
interface SyntaxTextBoxProps {
	Source: string;
}

/**
 * A basic syntax text box
 */
export default class ZirconSyntaxTextBox extends Roact.Component<SyntaxTextBoxProps, SyntaxTextBoxState> {
	public constructor(props: SyntaxTextBoxProps) {
		super(props);
		this.state = {
			source: props.Source,
		};
	}
	public render() {
		const highlighter = new ZrRichTextHighlighter(this.state.source);
		return (
			<frame Size={new UDim2(1, 0, 1, 0)} BackgroundColor3={Color3.fromRGB(33, 37, 43)} BorderSizePixel={0}>
				<uipadding
					PaddingLeft={new UDim(0, 5)}
					PaddingRight={new UDim(0, 5)}
					PaddingBottom={new UDim(0, 5)}
					PaddingTop={new UDim(0, 5)}
				/>
				<textbox
					BackgroundTransparency={1}
					Font="Code"
					TextSize={18}
					TextXAlignment="Left"
					TextYAlignment="Top"
					// ClearTextOnFocus={false}
					Size={new UDim2(1, 0, 1, 0)}
					Text={this.state.source}
					Change={{ Text: (rbx) => this.setState({ source: rbx.Text }) }}
					TextTransparency={0.75}
					PlaceholderText="Run a command"
					PlaceholderColor3={Color3.fromRGB(220, 220, 220)}
					TextColor3={Color3.fromRGB(204, 204, 204)}
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
	}
}
