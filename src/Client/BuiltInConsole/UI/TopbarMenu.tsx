import Roact from "@rbxts/roact";
import { connect } from "@rbxts/roact-rodux";
import { DispatchParam } from "@rbxts/rodux";
import Dropdown from "Client/Components/Dropdown";
import ZirconIcon from "Client/Components/Icon";
import { ZirconContext, ZirconLogLevel } from "Client/Types";
import ThemeContext from "Client/UIKit/ThemeContext";
import ZirconClientStore from "../Store";
import { ConsoleActionName, ConsoleReducer } from "../Store/_reducers/ConsoleReducer";

export interface TopbarProps extends MappedProps, MappedDispatch {}
interface TopbarState {
	isVisible: boolean;
	// isFullView: boolean;
	// sizeY: number;
	// source: string;
	// historyIndex: number;
}

class ZirconTopbarMenuComponent extends Roact.Component<TopbarProps, TopbarState> {
	public constructor(props: TopbarProps) {
		super(props);
		this.state = {
			isVisible: props.isVisible,
		};
	}
	public didUpdate(prevProps: TopbarProps) {
		if (prevProps.isVisible !== this.props.isVisible) {
			// this.sizeYMotor.setGoal(new Spring(this.props.isVisible ? this.state.sizeY : 0));
			this.setState({ isVisible: this.props.isVisible });
		}
	}

	public render() {
		return (
			<ThemeContext.Consumer
				render={(theme) => (
					<screengui DisplayOrder={10001} IgnoreGuiInset>
						<frame
							Visible={this.state.isVisible}
							Size={new UDim2(1, 0, 0, 40)}
							BackgroundColor3={theme.PrimaryBackgroundColor3}
							BorderSizePixel={0}
							Position={this.state.isVisible ? new UDim2(0, 0, 0, 0) : new UDim2(0, 0, 0, -40)}
						>
							<uipadding PaddingLeft={new UDim(0, 60)} />
							<uilistlayout
								VerticalAlignment="Center"
								FillDirection="Horizontal"
								Padding={new UDim(0, 10)}
							/>
							<frame Size={new UDim2(0, 32, 0, 32)} BackgroundTransparency={1}>
								<uilistlayout VerticalAlignment="Center" HorizontalAlignment="Center" />
								<ZirconIcon Icon="Zirconium" />
							</frame>
							<Dropdown<ZirconContext | undefined>
								Items={[
									{
										SelectedText: "(Context)",
										Text: "All Contexts",
										Id: undefined,
										TextColor3: Color3.fromRGB(150, 150, 150),
									},
									{
										Text: "Server",
										Id: ZirconContext.Server,
										Icon: "ContextServer",
									},
									{
										Text: "Client",
										Icon: "ContextClient",
										Id: ZirconContext.Client,
									},
								]}
								SelectedItemId={undefined}
								ItemSelected={(item) => {
									this.props.updateContextFilter(item.Id);
								}}
							/>
							<Dropdown<ZirconLogLevel | undefined>
								Items={[
									{
										SelectedText: "(Level)",
										Text: "All Levels",
										Id: undefined,
										TextColor3: Color3.fromRGB(150, 150, 150),
									},
									{
										Text: ">= Debug",
										Id: ZirconLogLevel.Debug,
									},
									{
										Text: ">= Info",
										Id: ZirconLogLevel.Info,
									},
									{
										Text: ">= Warning",
										Id: ZirconLogLevel.Warning,
									},
									{
										Text: ">= Error",
										Id: ZirconLogLevel.Error,
									},
								]}
								SelectedItemId={undefined}
								ItemSelected={(item) => {
									this.props.updateLogLevel(item.Id);
								}}
							/>
						</frame>
					</screengui>
				)}
			/>
		);
	}
}

interface MappedDispatch {
	updateContextFilter: (context: ZirconContext | undefined) => void;
	updateLogLevel: (level: ZirconLogLevel | undefined) => void;
}
interface MappedProps {
	isVisible: boolean;
}
const mapStateToProps = (state: ConsoleReducer): MappedProps => {
	return {
		isVisible: state.visible,
	};
};
const mapPropsToDispatch = (dispatch: DispatchParam<ZirconClientStore>): MappedDispatch => {
	return {
		updateContextFilter: (Context) => {
			if (Context !== undefined) {
				dispatch({ type: ConsoleActionName.UpdateFilter, Context });
			} else {
				dispatch({ type: ConsoleActionName.RemoveFilter, filter: "Context" });
			}
		},
		updateLogLevel: (Level) => {
			if (Level !== undefined) {
				dispatch({ type: ConsoleActionName.UpdateFilter, Level });
			} else {
				dispatch({ type: ConsoleActionName.RemoveFilter, filter: "Level" });
			}
		},
	};
};

/**
 * A docked console
 */
const ZirconTopBar = connect(mapStateToProps, mapPropsToDispatch)(ZirconTopbarMenuComponent);
export default ZirconTopBar;
