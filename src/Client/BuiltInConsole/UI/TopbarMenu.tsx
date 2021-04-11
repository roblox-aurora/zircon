import Roact from "@rbxts/roact";
import { connect } from "@rbxts/roact-rodux";
import { DispatchParam } from "@rbxts/rodux";
import Dropdown from "Client/Components/Dropdown";
import ZirconIcon from "Client/Components/Icon";
import MultiSelectDropdown from "Client/Components/MultiSelectDropdown";
import Padding from "Client/Components/Padding";
import SearchTextBox from "Client/Components/SearchTextBox";
import { ZirconContext, ZirconLogLevel } from "Client/Types";
import ThemeContext from "Client/UIKit/ThemeContext";
import ZirconClientStore from "../Store";
import { ConsoleActionName, ConsoleReducer, DEFAULT_FILTER } from "../Store/_reducers/ConsoleReducer";

export interface TopbarProps extends MappedProps, MappedDispatch {}
interface TopbarState {
	isVisible: boolean;
	levelFilter: Set<ZirconLogLevel>;
}

class ZirconTopbarMenuComponent extends Roact.Component<TopbarProps, TopbarState> {
	public constructor(props: TopbarProps) {
		super(props);
		this.state = {
			isVisible: props.isVisible,
			levelFilter: props.levelFilter,
		};
	}
	public didUpdate(prevProps: TopbarProps) {
		if (prevProps.isVisible !== this.props.isVisible) {
			this.setState({ isVisible: this.props.isVisible });
		} else if (prevProps.levelFilter !== this.props.levelFilter) {
			this.setState({ levelFilter: this.props.levelFilter });
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
						</frame>
					</screengui>
				)}
			/>
		);
	}
}

interface MappedDispatch {
	updateContextFilter: (context: ZirconContext | undefined) => void;
	updateLevelFilter: (levels: Set<ZirconLogLevel>) => void;
}
interface MappedProps {
	isVisible: boolean;
	levelFilter: Set<ZirconLogLevel>;
}
const mapStateToProps = (state: ConsoleReducer): MappedProps => {
	return {
		isVisible: state.visible,
		levelFilter: state.filter.Levels ?? DEFAULT_FILTER,
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
		updateLevelFilter: (Levels) => {
			if (Levels !== undefined) {
				dispatch({ type: ConsoleActionName.UpdateFilter, Levels });
			} else {
				dispatch({ type: ConsoleActionName.RemoveFilter, filter: "Levels" });
			}
		},
	};
};

/**
 * A docked console
 */
const ZirconTopBar = connect(mapStateToProps, mapPropsToDispatch)(ZirconTopbarMenuComponent);
export default ZirconTopBar;
