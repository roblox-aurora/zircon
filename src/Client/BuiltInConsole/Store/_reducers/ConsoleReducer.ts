import Rodux, { Action, createReducer } from "@rbxts/rodux";

export const enum ConsoleActionName {
	SetConsoleVisible = "SetConsoleVisible",
	SetConfiguration = "SetConsoleConfiguration",
}

export interface ActionSetConsoleVisible extends Action<ConsoleActionName.SetConsoleVisible> {
	visible: boolean;
}
export interface ActionSetConsoleConfiguration extends Action<ConsoleActionName.SetConfiguration> {
	executionEnabled: boolean;
	hotkeyEnabled: boolean;
}
export type ConsoleActions = ActionSetConsoleVisible | ActionSetConsoleConfiguration;

export interface ConsoleReducer {
	visible: boolean;
	executionEnabled: boolean;
	hotkeyEnabled: boolean;
}

const INITIAL_STATE: ConsoleReducer = {
	visible: false,
	executionEnabled: false,
	hotkeyEnabled: false,
};

const actions: Rodux.ActionHandlers<ConsoleReducer, ConsoleActions> = {
	[ConsoleActionName.SetConsoleVisible]: (state, { visible }) => ({ ...state, visible }),
	[ConsoleActionName.SetConfiguration]: (state, { executionEnabled, hotkeyEnabled }) => ({
		...state,
		executionEnabled,
		hotkeyEnabled,
	}),
};

const consoleReducer = createReducer(INITIAL_STATE, actions);
export default consoleReducer;
