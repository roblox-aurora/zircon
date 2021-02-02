import Rodux, { Action, createReducer } from "@rbxts/rodux";
import { $dbg } from "rbxts-transform-debug";
import { ConsoleMessage } from "../../../../Client/Types";

export const enum ConsoleActionName {
	SetConsoleVisible = "SetConsoleVisible",
	SetConfiguration = "SetConsoleConfiguration",
	AddOutput = "AddOutput",
}

export interface ActionSetConsoleVisible extends Action<ConsoleActionName.SetConsoleVisible> {
	visible: boolean;
}
export interface ActionSetConsoleConfiguration extends Action<ConsoleActionName.SetConfiguration> {
	executionEnabled: boolean;
	hotkeyEnabled: boolean;
}

export interface ActionAddOutput extends Action<ConsoleActionName.AddOutput> {
	message: ConsoleMessage;
}

export type ConsoleActions = ActionSetConsoleVisible | ActionSetConsoleConfiguration | ActionAddOutput;

export interface ConsoleReducer {
	visible: boolean;
	executionEnabled: boolean;
	hotkeyEnabled: boolean;
	output: ConsoleMessage[];
}

const INITIAL_STATE: ConsoleReducer = {
	visible: false,
	executionEnabled: false,
	hotkeyEnabled: false,
	output: [],
};

const actions: Rodux.ActionHandlers<ConsoleReducer, ConsoleActions> = {
	[ConsoleActionName.SetConsoleVisible]: (state, { visible }) => ({ ...state, visible }),
	[ConsoleActionName.SetConfiguration]: (state, { executionEnabled, hotkeyEnabled }) => ({
		...state,
		executionEnabled,
		hotkeyEnabled,
	}),
	[ConsoleActionName.AddOutput]: (state, { message }) => {
		$dbg(message);
		return $dbg({
			...state,
			output: [...state.output, message],
		});
	},
};

const consoleReducer = createReducer(INITIAL_STATE, actions);
export default consoleReducer;
