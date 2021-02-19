import Roact from "@rbxts/roact";
import { ComponentInstanceHandle } from "@rbxts/roact";
import RoactRodux from "@rbxts/roact-rodux";
import { ContextActionService, GuiService, LogService, Players, RunService, StarterGui } from "@rbxts/services";
import ZirconClientStore from "./BuiltInConsole/Store";
import { ConsoleActionName } from "./BuiltInConsole/Store/_reducers/ConsoleReducer";
import ZirconDockedConsole, { DockedConsoleProps } from "./BuiltInConsole/UI/DockedConsole";
import { $ifEnv } from "rbxts-transform-env";
import { $dbg } from "rbxts-transform-debug";
import Lazy from "../Shared/Lazy";
import { GetCommandService } from "../Services";
import Remotes, { ZirconNetworkMessageType } from "../Shared/Remotes";
import { RemoteId } from "../RemoteId";
import { ZirconContext, ZirconLogData, ZirconLogLevel, ZirconMessageType } from "./Types";
import ZirconTopBar from "./BuiltInConsole/UI/TopbarMenu";

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

	export function Log(level: ZirconLogLevel, tag: string, message: string, data?: ZirconLogData) {
		if (level === ZirconLogLevel.Error || level === ZirconLogLevel.Wtf) {
			ZirconClientStore.dispatch({
				type: ConsoleActionName.AddOutput,
				message: {
					type: ZirconMessageType.ZirconLogErrorMessage,
					error: {
						data: data ?? {},
						type: ZirconNetworkMessageType.ZirconStandardErrorMessage,
						time: DateTime.now().UnixTimestamp,
						message,
						level,
						tag,
					},
					context: ZirconContext.Client,
				},
			});
		} else {
			ZirconClientStore.dispatch({
				type: ConsoleActionName.AddOutput,
				message: {
					type: ZirconMessageType.ZirconLogOutputMesage,
					message: {
						data: data ?? {},
						type: ZirconNetworkMessageType.ZirconStandardOutputMessage,
						time: DateTime.now().UnixTimestamp,
						message,
						level,
						tag,
					},
					context: ZirconContext.Client,
				},
			});
		}
	}

	let topbarEnabledState = false;

	function activateBuiltInConsole(actionName: string, state: Enum.UserInputState) {
		const isTopbarEnabled = StarterGui.GetCore("TopbarEnabled");

		const { hotkeyEnabled } = ZirconClientStore.getState();
		if (state === Enum.UserInputState.End && $dbg(hotkeyEnabled)) {
			isVisible = !isVisible;

			if (isVisible) {
				if (isTopbarEnabled) {
					topbarEnabledState = true;
					StarterGui.SetCore("TopbarEnabled", false);
				}
			} else {
				if (topbarEnabledState) {
					StarterGui.SetCore("TopbarEnabled", true);
				}
			}

			ZirconClientStore.dispatch({ type: ConsoleActionName.SetConsoleVisible, visible: $dbg(isVisible) });
		}
		return Enum.ContextActionResult.Sink;
	}

	interface ConsoleOptions {
		Keys?: Array<Enum.KeyCode>;
		ConsoleComponent?: typeof Roact.Component | ((props: defined) => Roact.Element);
	}

	let consoleBound = false;

	/**
	 * Binds the built-in Zircon console
	 * Default Keybind: F10
	 *
	 * @param options The console options
	 *
	 * *This is not required, you can use your own console solution!*
	 */
	export function BindConsole(options: ConsoleOptions = {}) {
		if (consoleBound) return;
		consoleBound = true;

		const { Keys = [Enum.KeyCode.F10], ConsoleComponent = ZirconDockedConsole } = options;

		$ifEnv("NODE_ENV", "development", () => {
			print("[zircon-debug] bindConsole called with", ...Keys);
		});
		BindActivationKeys(Keys);
		handle = Roact.mount(
			<RoactRodux.StoreProvider store={ZirconClientStore}>
				<Roact.Fragment>
					<ZirconTopBar />
					<ConsoleComponent />
				</Roact.Fragment>
			</RoactRodux.StoreProvider>,
			Players.LocalPlayer.FindFirstChildOfClass("PlayerGui"),
		);

		const GetPlayerOptions = Remotes.Client.Get(RemoteId.GetPlayerPermissions);
		GetPlayerOptions.CallServerAsync().then((permissions) => {
			ZirconClientStore.dispatch({
				type: ConsoleActionName.SetConfiguration,
				hotkeyEnabled: true,
				executionEnabled: permissions.has("CanExecuteZirconiumScripts"),
			});
		});
	}

	export function BindActivationKeys(keys: Enum.KeyCode[]) {
		ContextActionService.UnbindAction(Const.ActionId);
		ContextActionService.BindAction(Const.ActionId, activateBuiltInConsole, false, ...keys);
	}

	let outputConnection: RBXScriptConnection | undefined;
	/** @internal */
	export function EXPERIMENTAL_EnableRobloxOutput() {
		if (outputConnection) return;
		outputConnection = LogService.MessageOut.Connect((message, messageType) => {
			if (messageType === Enum.MessageType.MessageOutput) {
				Log(ZirconLogLevel.Info, "roblox", message);
			} else if (messageType === Enum.MessageType.MessageWarning) {
				Log(ZirconLogLevel.Warning, "roblox", message);
			} else if (messageType === Enum.MessageType.MessageError) {
				Log(ZirconLogLevel.Error, "roblox", message);
			}
		});
	}

	if (IsClient) {
		const StandardOutput = Remotes.Client.Get(RemoteId.StandardOutput);
		const StandardError = Remotes.Client.Get(RemoteId.StandardError);

		StandardOutput.Connect((message) => {
			switch (message.type) {
				case ZirconNetworkMessageType.ZirconiumOutput: {
					ZirconClientStore.dispatch({
						type: ConsoleActionName.AddOutput,
						message: { type: ZirconMessageType.ZirconiumOutput, context: ZirconContext.Server, message },
					});
					break;
				}
				case ZirconNetworkMessageType.ZirconStandardOutputMessage: {
					ZirconClientStore.dispatch({
						type: ConsoleActionName.AddOutput,
						message: {
							type: ZirconMessageType.ZirconLogOutputMesage,
							context: ZirconContext.Server,
							message,
						},
					});
					break;
				}
			}
		});

		StandardError.Connect((err) => {
			switch (err.type) {
				case ZirconNetworkMessageType.ZirconiumParserError:
				case ZirconNetworkMessageType.ZirconiumRuntimeError: {
					ZirconClientStore.dispatch({
						type: ConsoleActionName.AddOutput,
						message: {
							type: ZirconMessageType.ZirconiumError,
							context: ZirconContext.Server,
							error: err,
						},
					});
					break;
				}
				case ZirconNetworkMessageType.ZirconStandardErrorMessage: {
					ZirconClientStore.dispatch({
						type: ConsoleActionName.AddOutput,
						message: {
							type: ZirconMessageType.ZirconLogErrorMessage,
							context: ZirconContext.Server,
							error: err,
						},
					});
					break;
				}
			}
		});
	}
}
export default ZirconClient;
