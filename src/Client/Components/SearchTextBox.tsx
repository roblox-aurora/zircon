import Roact from "@rbxts/roact";
import ThemeContext from "Client/UIKit/ThemeContext";
import ZirconIcon from "./Icon";
import Padding from "./Padding";

interface SearchTextBoxProps {
	Value?: string;
	Size?: UDim2;
	TextChanged?: (text: string) => void;
}
interface SearchTextBoxState {
	Value?: string;
}
export default class SearchTextBox extends Roact.Component<SearchTextBoxProps, SearchTextBoxState> {
	public constructor(props: SearchTextBoxProps) {
		super(props);
		this.state = {
			Value: props.Value,
		};
	}
	public render() {
		const { Size = new UDim2(0, 400, 0, 30) } = this.props;
		return (
			<ThemeContext.Consumer
				render={(theme) => {
					return (
						<frame Size={Size} BackgroundTransparency={1}>
							<uilistlayout
								FillDirection="Horizontal"
								HorizontalAlignment="Right"
								Padding={new UDim(0, 2)}
							/>
							<frame
								Size={new UDim2(0, 30, 0, 30)}
								BackgroundColor3={theme.PrimaryBackgroundColor3}
								BorderColor3={theme.SecondaryBackgroundColor3}
							>
								<uilistlayout VerticalAlignment="Center" HorizontalAlignment="Center" />
								<ZirconIcon Icon="Funnel" />
							</frame>
							<frame
								BackgroundColor3={theme.SecondaryBackgroundColor3}
								BorderColor3={theme.SecondaryBackgroundColor3}
								Size={new UDim2(0, 400, 0, 30)}
							>
								<Padding Padding={{ Horizontal: 5, Vertical: 5 }} />
								<textbox
									Size={new UDim2(1, 0, 1, 0)}
									BackgroundTransparency={1}
									TextColor3={theme.PrimaryTextColor3}
									TextSize={18}
									PlaceholderText="Find"
									PlaceholderColor3={theme.SecondaryTextColor3}
									Text={this.state.Value ?? ""}
									TextXAlignment="Left"
									Change={{
										Text: ({ Text }) => {
											this.setState({ Value: Text });
											this.props.TextChanged?.(Text);
										},
									}}
									Font={theme.ConsoleFont}
								/>
							</frame>
						</frame>
					);
				}}
			/>
		);
	}
}
