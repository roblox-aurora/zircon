import Rodux, { Action, createReducer } from "@rbxts/rodux";
import { ConsoleMessage } from "../../../../Client/Types";

export const enum ConsoleActionName {
	SetConsoleVisible = "SetConsoleVisible",
	SetConfiguration = "SetConsoleConfiguration",
	AddOutput = "AddOutput",
	AddHistory = "AddHistory",
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

export interface ActionAddHistory extends Action<ConsoleActionName.AddHistory> {
	message: string;
}

export type ConsoleActions =
	| ActionSetConsoleVisible
	| ActionSetConsoleConfiguration
	| ActionAddOutput
	| ActionAddHistory;

export interface ConsoleReducer {
	visible: boolean;
	executionEnabled: boolean;
	hotkeyEnabled: boolean;
	output: ConsoleMessage[];
	history: string[];
}

const INITIAL_STATE: ConsoleReducer = {
	visible: false,
	executionEnabled: false,
	hotkeyEnabled: false,
	output: [],
	history: [],
};

const actions: Rodux.ActionHandlers<ConsoleReducer, ConsoleActions> = {
	[ConsoleActionName.SetConsoleVisible]: (state, { visible }) => ({ ...state, visible }),
	[ConsoleActionName.SetConfiguration]: (state, { executionEnabled, hotkeyEnabled }) => ({
		...state,
		executionEnabled,
		hotkeyEnabled,
	}),
	[ConsoleActionName.AddOutput]: (state, { message }) => {
		return {
			...state,
			output: [...state.output, message],
		};
	},
	[ConsoleActionName.AddHistory]: (state, { message }) => ({
		...state,
		history: [...state.history, message],
	}),
};

const consoleReducer = createReducer(INITIAL_STATE, actions);
export default consoleReducer;
