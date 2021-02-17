import Rodux from "@rbxts/rodux";
import consoleReducer, { ConsoleActions, ConsoleReducer } from "./_reducers/ConsoleReducer";

/**
 * The Rodux client store for Zircon
 * @internal
 */
const ZirconClientStore = new Rodux.Store<ConsoleReducer, ConsoleActions>(consoleReducer);
type ZirconClientStore = Rodux.Store<ConsoleReducer, ConsoleActions>;
export default ZirconClientStore;
