import Roact from "@rbxts/roact";
import { ComponentInstanceHandle } from "@rbxts/roact";
import RoactRodux from "@rbxts/roact-rodux";
import { ContextActionService, Players } from "@rbxts/services";
import ZirconClientStore from "./BuiltInConsole/Store";
import { ConsoleActionName } from "./BuiltInConsole/Store/_reducers/ConsoleReducer";
import ZirconConsole from "./BuiltInConsole/UI/Console";
import ZirconWindow from "./Components/Window";
import UIKTheme, { BaseTheme, ZirconTheme } from "./UIKit/ThemeContext";

const enum Const {
	ActionId = "ZirconConsoleActivate",
}
namespace ZirconClient {
	let handle: ComponentInstanceHandle | undefined;
	let isVisible = false;
	function activateBuiltInConsole(actionName: string, state: Enum.UserInputState, io: InputObject) {
		if (state === Enum.UserInputState.End) {
			isVisible = !isVisible;
			ZirconClientStore.dispatch({ type: ConsoleActionName.SetConsoleVisible, visible: isVisible });
		}
		return Enum.ContextActionResult.Sink;
	}

	/**
	 * Binds the built-in Zircon console
	 * Default Keybind: F10
	 *
	 * @param keys The keys to bind to the console (default F10)
	 *
	 * *This is not required, you can use your own console solution!*
	 */
	export function bindConsole(keys: Array<Enum.KeyCode> = [Enum.KeyCode.F10, Enum.KeyCode.Slash]) {
		bindActivationKeys(keys);
		handle = Roact.mount(
			<RoactRodux.StoreProvider store={ZirconClientStore as Rodux.Store<unknown>}>
				<Roact.Fragment>
					<ZirconConsole />
					<UIKTheme.Provider value={ZirconTheme}>
						<ZirconWindow
							IsDraggable
							TitlebarEnabled
							TitleText="Collections"
							Size={new UDim2(0, 600, 0, 500)}
							TitlebarCloseAction={() => {}}
						/>
					</UIKTheme.Provider>
				</Roact.Fragment>
			</RoactRodux.StoreProvider>,
			Players.LocalPlayer.FindFirstChildOfClass("PlayerGui"),
		);
	}
	export function bindActivationKeys(keys: Enum.KeyCode[]) {
		ContextActionService.UnbindAction(Const.ActionId);
		ContextActionService.BindAction(Const.ActionId, activateBuiltInConsole, false, ...keys);
	}
}
export = ZirconClient;
