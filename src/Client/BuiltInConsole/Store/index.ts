import Rodux from "@rbxts/rodux";
import consoleReducer, { ConsoleActions, ConsoleReducer } from "./_reducers/ConsoleReducer";

const ZirconClientStore = new Rodux.Store<ConsoleReducer, ConsoleActions, {}>(consoleReducer, undefined, [
	Rodux.loggerMiddleware,
]);
type ZirconClientStore = typeof ZirconClientStore;
export default ZirconClientStore;
