import Rodux, { Action, createReducer } from "@rbxts/rodux";
import { $dbg } from "rbxts-transform-debug";
import { ConsoleMessage, ZirconContext, ZirconLogLevel } from "../../../Types";
import KeyCode = Enum.KeyCode;

export const enum ConsoleActionName {
	SetConsoleVisible = "SetConsoleVisible",
	SetConfiguration = "SetConsoleConfiguration",
	AddOutput = "AddOutput",
	AddHistory = "AddHistory",
	SetFilter = "SetFilter",
	UpdateFilter = "UpdateFilter",
	RemoveFilter = "RemoveFilter",
	SetClientExecutionEnabled = "SetClientExecutionEnabled",
}

export interface ActionSetConsoleVisible extends Action<ConsoleActionName.SetConsoleVisible> {
	visible: boolean;
}
export interface ActionSetConsoleConfiguration extends Action<ConsoleActionName.SetConfiguration> {
	executionEnabled: boolean;
	hotkeyEnabled: boolean;
	autoFocusTextBox: boolean;
	showTagsInOutput: boolean;
	logDetailsPaneEnabled: boolean;
	bindKeys: KeyCode[];
}

export interface ActionAddOutput extends Action<ConsoleActionName.AddOutput> {
	message: ConsoleMessage;
}

export interface ActionSetClientExecutionEnabled extends Action<ConsoleActionName.SetClientExecutionEnabled> {
	enabled: boolean;
}

export interface ActionAddHistory extends Action<ConsoleActionName.AddHistory> {
	message: string;
}

export interface ActionSetFilter extends Action<ConsoleActionName.SetFilter> {
	filter: ConsoleFilter;
}

export interface ActionRemoveFilter extends Action<ConsoleActionName.RemoveFilter> {
	filter: keyof ConsoleFilter;
}

export interface ActionUpdateFilter extends Action<ConsoleActionName.UpdateFilter>, Partial<ConsoleFilter> {}

export type ConsoleActions =
	| ActionSetConsoleVisible
	| ActionSetConsoleConfiguration
	| ActionAddOutput
	| ActionAddHistory
	| ActionSetFilter
	| ActionUpdateFilter
	| ActionRemoveFilter
	| ActionSetClientExecutionEnabled;

export interface ConsoleFilter {
	Context?: ZirconContext;
	Level?: ZirconLogLevel;
	Levels: Set<ZirconLogLevel>;
	SearchQuery?: string;
	Tail?: boolean;
}

export interface ConsoleReducer {
	visible: boolean;
	executionEnabled: boolean;
	hotkeyEnabled: boolean;
	autoFocusTextBox: boolean;
	logDetailsPaneEnabled: boolean;
	showTagsInOutput: boolean;
	output: ConsoleMessage[];
	history: string[];
	filter: ConsoleFilter;
	canExecuteLocalScripts: boolean;
	bindingKeys: KeyCode[];
}

export const DEFAULT_FILTER = new Set([
	ZirconLogLevel.Info,
	ZirconLogLevel.Warning,
	ZirconLogLevel.Error,
	ZirconLogLevel.Wtf,
]);

const INITIAL_STATE: ConsoleReducer = {
	visible: false,
	autoFocusTextBox: true,
	executionEnabled: false,
	hotkeyEnabled: false,
	canExecuteLocalScripts: false,
	logDetailsPaneEnabled: false,
	showTagsInOutput: true,
	output: [],
	history: [],
	bindingKeys: [],
	filter: {
		Levels: new Set([ZirconLogLevel.Info, ZirconLogLevel.Warning, ZirconLogLevel.Error, ZirconLogLevel.Wtf]),
	},
};

const actions: Rodux.ActionHandlers<ConsoleReducer, ConsoleActions> = {
	[ConsoleActionName.SetConsoleVisible]: (state, { visible }) => ({ ...state, visible }),
	[ConsoleActionName.SetConfiguration]: (
		state,
		{ executionEnabled, hotkeyEnabled, showTagsInOutput, logDetailsPaneEnabled, autoFocusTextBox, bindKeys },
	) => ({
		...state,
		executionEnabled,
		hotkeyEnabled,
		showTagsInOutput,
		logDetailsPaneEnabled,
		autoFocusTextBox,
		bindingKeys: bindKeys,
	}),
	[ConsoleActionName.SetClientExecutionEnabled]: (state, { enabled }) => {
		return { ...state, canExecuteLocalScripts: enabled };
	},
	[ConsoleActionName.AddOutput]: (state, { message }) => {
		return $dbg({
			...state,
			output: [...state.output, message],
		});
	},
	[ConsoleActionName.AddHistory]: (state, { message }) => ({
		...state,
		history: [...state.history, message],
	}),
	[ConsoleActionName.SetFilter]: (state, { filter }) => ({
		...state,
		filter,
	}),
	[ConsoleActionName.UpdateFilter]: (state, options) => ({
		...state,
		filter: { ...state.filter, ...options },
	}),
	[ConsoleActionName.RemoveFilter]: (state, { filter }) => ({
		...state,
		filter: { ...state.filter, [filter]: undefined },
	}),
};

const consoleReducer = createReducer(INITIAL_STATE, actions);
export default consoleReducer;
