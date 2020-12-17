import ZirconClient from "./Client";
import ZirconClientStore from "./Client/BuiltInConsole/Store";
import { ConsoleActionName } from "./Client/BuiltInConsole/Store/_reducers/ConsoleReducer";

ZirconClient.bindConsole();
ZirconClientStore.dispatch({ type: ConsoleActionName.SetConfiguration, hotkeyEnabled: true, executionEnabled: true });
