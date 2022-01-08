import { LogEvent, LogLevel } from "@rbxts/log";
import { ZrParserError, ZrScriptMode, ZrScriptVersion } from "@rbxts/zirconium/out/Ast/Parser";
import { ZrRuntimeError } from "@rbxts/zirconium/out/Runtime/Runtime";
import ZrScript from "@rbxts/zirconium/out/Runtime/Script";
import ZirconClientStore from "Client/BuiltInConsole/Store";
import { ConsoleActionName } from "Client/BuiltInConsole/Store/_reducers/ConsoleReducer";
import { ZirconContext, ZirconMessageType, ZrErrorMessage } from "Client/Types";
import { GetCommandService } from "Services";
import Remotes, { RemoteId, ZirconNetworkMessageType } from "../Shared/Remotes";
import { ZirconClientRegistryService } from "./ClientRegistryService";

export enum DispatchContext {
	Server,

	/** @internal */
	Client,
}

export namespace ZirconClientDispatchService {
	let Registry!: ZirconClientRegistryService;

	/** @internal */
	export const dependencies = ["ClientRegistryService"];

	const DispatchToServer = Remotes.Client.WaitFor(RemoteId.DispatchToServer).expect();
	export function Dispatch(input: string) {
		DispatchToServer.SendToServer(input);
	}

	function Log(data: LogEvent) {
		ZirconClientStore.dispatch({
			type: ConsoleActionName.AddOutput,
			message: {
				type: ZirconMessageType.StructuredLog,
				data,
				context: ZirconContext.Client,
			},
		});
	}

	/** @internal */
	export async function ExecuteScript(text: string) {
		const Registry = GetCommandService("ClientRegistryService");
		return Promise.defer<ZrScript>((resolve, reject) => {
			const mainScript = Registry.GetScriptContextsForLocalPlayer();
			const source = mainScript.parseSource(text, ZrScriptVersion.Zr2022, ZrScriptMode.CommandLike);
			if (source.isOk()) {
				resolve(mainScript.createScript(source.okValue));
			} else {
				reject(source.unwrapErr().errors);
			}
		})
			.then((scr) => {
				return scr.execute();
			})
			.then((output) => {
				output.forEach((message) => {
					Log({
						Template: message.gsub("{(.-)}", "{{%1}}")[0],
						Timestamp: DateTime.now().ToIsoDate(),
						Level: LogLevel.Information,
						SourceContext: "Client Script",
					});
				});
			})
			.catch((err: unknown) => {
				if (typeIs(err, "table")) {
					const messages = err as Array<ZrParserError | ZrRuntimeError>;
					for (const message of messages) {
						Log({
							Template: `error {ErrCode}: ${message.message}`,
							Timestamp: DateTime.now().ToIsoDate(),
							Level: LogLevel.Error,
							SourceContext: "Client Script",
							ErrCode: message.code,
						});
					}
				}
			});
	}
}
export type ZirconClientDispatchService = typeof ZirconClientDispatchService;
