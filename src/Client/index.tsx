import Roact from "@rbxts/roact";
import { ComponentInstanceHandle } from "@rbxts/roact";
import RoactRodux from "@rbxts/roact-rodux";
import { ContextActionService, Players, RunService } from "@rbxts/services";
import ZirconClientStore from "./BuiltInConsole/Store";
import { ConsoleActionName } from "./BuiltInConsole/Store/_reducers/ConsoleReducer";
import ZirconDockedConsole, { DockedConsoleProps } from "./BuiltInConsole/UI/DockedConsole";
import { $ifEnv } from "rbxts-transform-env";
import { $dbg } from "rbxts-transform-debug";
import Lazy from "../Shared/Lazy";
import { GetCommandService } from "../Services";
import Remotes from "../Shared/Remotes";
import { RemoteId } from "../RemoteId";
import { ExecutionContext } from "./Types";

const IsClient = RunService.IsClient();

const enum Const {
	ActionId = "ZirconConsoleActivate",
}

export enum ConsoleType {
	DockedConsole,
}

interface ConsoleOptions {
	[ConsoleType.DockedConsole]: DockedConsoleProps;
}

namespace ZirconClient {
	let handle: ComponentInstanceHandle | undefined;
	let isVisible = false;

	export const Registry = Lazy(() => {
		assert(IsClient, "Zircon Service only accessible on client");
		return GetCommandService("ClientRegistryService");
	});

	export const Dispatch = Lazy(() => {
		assert(IsClient, "Zircon Service only accessible on client");
		return GetCommandService("ClientDispatchService");
	});

	function activateBuiltInConsole(actionName: string, state: Enum.UserInputState) {
		const { hotkeyEnabled } = ZirconClientStore.getState();
		if (state === Enum.UserInputState.End && $dbg(hotkeyEnabled)) {
			isVisible = !isVisible;
			ZirconClientStore.dispatch({ type: ConsoleActionName.SetConsoleVisible, visible: $dbg(isVisible) });
		}
		return Enum.ContextActionResult.Sink;
	}

	interface ConsoleOptions {
		Keys?: Array<Enum.KeyCode>;
		ConsoleComponent?: typeof Roact.Component;
	}

	/**
	 * Binds the built-in Zircon console
	 * Default Keybind: F10
	 *
	 * @param options The console options
	 *
	 * *This is not required, you can use your own console solution!*
	 */
	export function bindConsole(options: ConsoleOptions = {}) {
		const { Keys = [Enum.KeyCode.F10], ConsoleComponent = ZirconDockedConsole } = options;

		$ifEnv("NODE_ENV", "development", () => {
			print("[zircon-debug] bindConsole called with", ...Keys);
		});
		bindActivationKeys(Keys);
		handle = Roact.mount(
			<RoactRodux.StoreProvider store={ZirconClientStore}>
				<ConsoleComponent />
			</RoactRodux.StoreProvider>,
			Players.LocalPlayer.FindFirstChildOfClass("PlayerGui"),
		);
	}

	export function bindActivationKeys(keys: Enum.KeyCode[]) {
		ContextActionService.UnbindAction(Const.ActionId);
		ContextActionService.BindAction(Const.ActionId, activateBuiltInConsole, false, ...keys);
	}

	if (IsClient) {
		const StandardOutput = Remotes.Client.Get(RemoteId.StandardOutput);
		const StandardError = Remotes.Client.Get(RemoteId.StandardError);

		StandardOutput.Connect((message) =>
			ZirconClientStore.dispatch({
				type: ConsoleActionName.AddOutput,
				message: { type: "zr:output", context: ExecutionContext.Server, message },
			}),
		);

		StandardError.Connect((err) =>
			ZirconClientStore.dispatch({
				type: ConsoleActionName.AddOutput,
				message: {
					type: "zr:error",
					context: ExecutionContext.Server,
					error: err,
				},
			}),
		);
	}
}
export default ZirconClient;
