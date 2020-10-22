import Rodux, { Action, createReducer } from "@rbxts/rodux";

export const enum ConsoleActionName {
	SetConsoleVisible = "SetConsoleVisible",
}

export interface ActionSetConsoleVisible extends Action<ConsoleActionName.SetConsoleVisible> {
	visible: boolean;
}
export type ConsoleActions = ActionSetConsoleVisible;

export interface ConsoleReducer {
	visible: boolean;
}

const INITIAL_STATE: ConsoleReducer = {
	visible: false,
};

const actions: Rodux.ActionHandlers<ConsoleReducer, ConsoleActions> = {
	[ConsoleActionName.SetConsoleVisible]: (state, { visible }) => ({ ...state, visible }),
};

const consoleReducer = createReducer(INITIAL_STATE, actions);
export default consoleReducer;
