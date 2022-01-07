import Roact from "@rbxts/roact";
import { ComponentInstanceHandle } from "@rbxts/roact";
import RoactRodux from "@rbxts/roact-rodux";
import { ContextActionService, Players, RunService, StarterGui, UserInputService } from "@rbxts/services";
import ZirconClientStore from "./BuiltInConsole/Store";
import { ConsoleActionName } from "./BuiltInConsole/Store/_reducers/ConsoleReducer";
import ZirconDockedConsole, { DockedConsoleProps } from "./BuiltInConsole/UI/DockedConsole";
import { $ifEnv } from "rbxts-transform-env";
import { $dbg, $print } from "rbxts-transform-debug";
import Lazy from "../Shared/Lazy";
import { GetCommandService } from "../Services";
import Remotes, { RemoteId, ZirconNetworkMessageType } from "../Shared/Remotes";
import { ZirconContext, ZirconLogData, ZirconLogLevel, ZirconMessageType } from "./Types";
import ZirconTopBar from "./BuiltInConsole/UI/TopbarMenu";
import { LogEvent } from "@rbxts/log";
import ThemeContext, { BuiltInThemes } from "./UIKit/ThemeContext";

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

	export function StructuredLog(data: LogEvent) {
		ZirconClientStore.dispatch({
			type: ConsoleActionName.AddOutput,
			message: {
				type: ZirconMessageType.StructuredLog,
				data,
				context: ZirconContext.Client,
			},
		});
	}

	/** @deprecated */
	export function Log(level: ZirconLogLevel, tag: string, message: string, data: ZirconLogData) {
		if (level === ZirconLogLevel.Error || level === ZirconLogLevel.Wtf) {
			ZirconClientStore.dispatch({
				type: ConsoleActionName.AddOutput,
				message: {
					type: ZirconMessageType.ZirconLogErrorMessage,
					error: {
						data: data,
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

	function activateBuiltInConsole(_: string, state: Enum.UserInputState) {
		const { hotkeyEnabled } = ZirconClientStore.getState();

		print("test", state);

		if (state === Enum.UserInputState.End && $dbg(hotkeyEnabled)) {
			SetVisible(!isVisible);
		}
		return Enum.ContextActionResult.Sink;
	}

	export function SetVisible(visible: boolean) {
		const isTopbarEnabled = StarterGui.GetCore("TopbarEnabled");

		if (visible) {
			if (isTopbarEnabled) {
				topbarEnabledState = true;
				StarterGui.SetCore("TopbarEnabled", false);
			}
		} else {
			if (topbarEnabledState) {
				StarterGui.SetCore("TopbarEnabled", true);
			}
		}

		ZirconClientStore.dispatch({ type: ConsoleActionName.SetConsoleVisible, visible });

		isVisible = visible;
	}

	interface ConsoleOptions {
		Keys?: Array<Enum.KeyCode>;
		EnableTags?: boolean;
		AutoFocusTextBox?: boolean;
		ConsoleComponent?: typeof Roact.Component | ((props: defined) => Roact.Element);
		/** @internal */
		Theme?: keyof BuiltInThemes;
	}

	let consoleBound = false;

	function BindConsoleIntl(options: ConsoleOptions) {
		const {
			Keys = [Enum.KeyCode.F10],
			ConsoleComponent = ZirconDockedConsole,
			Theme = "Plastic",
			AutoFocusTextBox = true,
			EnableTags = true,
		} = options;

		const GetPlayerOptions = Remotes.Client.WaitFor(RemoteId.GetPlayerPermissions).expect();
		GetPlayerOptions.CallServerAsync().then((permissions) => {
			if (permissions.has("CanAccessConsole")) {
				BindActivationKeys(Keys);
				handle = Roact.mount(
					<ThemeContext.Provider value={BuiltInThemes[Theme]}>
						<RoactRodux.StoreProvider store={ZirconClientStore}>
							<Roact.Fragment>
								<ZirconTopBar />
								<ConsoleComponent />
							</Roact.Fragment>
						</RoactRodux.StoreProvider>
					</ThemeContext.Provider>,
					Players.LocalPlayer.FindFirstChildOfClass("PlayerGui"),
				);
			}

			ZirconClientStore.dispatch({
				type: ConsoleActionName.SetConfiguration,
				hotkeyEnabled: permissions.has("CanAccessConsole"),
				autoFocusTextBox: AutoFocusTextBox,
				bindKeys: Keys,
				executionEnabled: permissions.has("CanExecuteZirconiumScripts"),
				logDetailsPaneEnabled: permissions.has("CanViewLogMetadata"),
				showTagsInOutput: EnableTags,
			});
		});
	}

	/**
	 * Binds the built-in Zircon console
	 * Default Keybind: F10
	 *
	 * @param options The console options
	 *
	 * *This is not required, you can use your own console solution!*
	 */
	export function Init(options: ConsoleOptions = {}) {
		if (consoleBound) return;
		const initialized = Remotes.Client.Get(RemoteId.GetZirconInitialized).CallServerAsync().expect();

		consoleBound = true;
		if (initialized === false) {
			Remotes.Client.WaitFor(RemoteId.ZirconInitialized).then((remote) => {
				const connection = remote.Connect(() => {
					BindConsoleIntl(options);
					connection.Disconnect();
				});
			});
		} else {
			BindConsoleIntl(options);
		}
	}

	/** @deprecated Use `Init` */
	export function BindConsole(options: ConsoleOptions = {}) {
		return Init(options);
	}

	let bound = false;
	export function BindActivationKeys(keys: Enum.KeyCode[]) {
		// Sink
		ContextActionService.UnbindAction(Const.ActionId);
		ContextActionService.BindActionAtPriority(
			Const.ActionId,
			(_, state, io) => {
				if (state === Enum.UserInputState.End) {
					SetVisible(!isVisible);
				}
				return Enum.ContextActionResult.Sink;
			},
			false,
			Enum.ContextActionPriority.High.Value,
			...keys,
		);

		// if (bound) {
		// 	return;
		// }

		// UserInputService.InputEnded.Connect((io, gpe) => {
		// 	if (
		// 		io.UserInputType === Enum.UserInputType.Keyboard &&
		// 		keys.includes(io.KeyCode) &&
		// 		ZirconClientStore.getState().visible
		// 	) {
		// 		SetVisible(!isVisible);
		// 	}
		// });

		bound = true;
	}

	if (IsClient) {
		Remotes.Client.WaitFor(RemoteId.StandardOutput).then((StandardOutput) => {
			StandardOutput.Connect((message) => {
				switch (message.type) {
					case ZirconNetworkMessageType.ZirconiumOutput: {
						ZirconClientStore.dispatch({
							type: ConsoleActionName.AddOutput,
							message: {
								type: ZirconMessageType.ZirconiumOutput,
								context: ZirconContext.Server,
								message,
							},
						});
						break;
					}
					case ZirconNetworkMessageType.ZirconSerilogMessage: {
						ZirconClientStore.dispatch({
							type: ConsoleActionName.AddOutput,
							message: {
								type: ZirconMessageType.StructuredLog,
								context: ZirconContext.Server,
								data: message.data,
							},
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

			ZirconClientStore.dispatch({
				type: ConsoleActionName.AddOutput,
				message: {
					type: ZirconMessageType.ZirconLogOutputMesage,
					context: ZirconContext.Client,
					message: {
						type: ZirconNetworkMessageType.ZirconStandardOutputMessage,
						message: `Loaded Zircon v${PKG_VERSION}`,
						level: ZirconLogLevel.Debug,
						time: DateTime.now().UnixTimestamp,
						tag: "INIT",
						data: {
							Variables: [],
						},
					},
				},
			});
		});

		Remotes.Client.WaitFor(RemoteId.StandardError).then((StandardError) => {
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
		});
	}
}
export default ZirconClient;
