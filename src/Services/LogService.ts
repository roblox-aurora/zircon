import { GetCommandService } from "../Services";
import Lazy from "../Shared/Lazy";
import { ZirconLogData, ZirconLogLevel } from "../Client/Types";
import { RemoteId } from "../RemoteId";
import Remotes, {
	ZirconStandardOutput,
	ZirconErrorOutput,
	ZirconNetworkMessageType,
	ZirconStructuredLogOutput,
} from "../Shared/Remotes";
import { StructuredMessage } from "@rbxts/log";

const StandardOutput = Remotes.Server.Create(RemoteId.StandardOutput);
const StandardError = Remotes.Server.Create(RemoteId.StandardError);
export namespace ZirconLogService {
	const outputMessages = new Array<ZirconStandardOutput | ZirconErrorOutput>();
	const Registry = Lazy(() => GetCommandService("RegistryService"));

	/**
	 * @internal
	 */
	function writeServerLogMessage(
		level: ZirconLogLevel.Debug | ZirconLogLevel.Info | ZirconLogLevel.Warning,
		tag: string,
		message: string,
		data: ZirconLogData,
	) {
		const outputMessage = identity<ZirconStandardOutput>({
			type: ZirconNetworkMessageType.ZirconStandardOutputMessage,
			tag,
			message,
			data,
			level,
			time: DateTime.now().UnixTimestamp,
		});
		outputMessages.push(outputMessage);
		const loggablePlayers = Registry.InternalGetPlayersWithPermission("CanRecieveServerLogMessages");
		StandardOutput.SendToPlayers(loggablePlayers, outputMessage);
	}

	/**
	 * @internal
	 */
	function writeServerErrorMessage(
		level: ZirconLogLevel.Error | ZirconLogLevel.Wtf,
		tag: string,
		message: string,
		data: ZirconLogData,
	) {
		const outputError = identity<ZirconErrorOutput>({
			type: ZirconNetworkMessageType.ZirconStandardErrorMessage,
			tag,
			message,
			data,
			level,
			time: DateTime.now().UnixTimestamp,
		});
		outputMessages.push(outputError);
		const loggablePlayers = Registry.InternalGetPlayersWithPermission("CanRecieveServerLogMessages");
		StandardError.SendToPlayers(loggablePlayers, outputError);
	}

	/**
	 * @internal
	 */
	export function GetCurrentOutput() {
		return outputMessages;
	}

	export function WriteStructured(data: StructuredMessage) {
		const outputError = identity<ZirconStructuredLogOutput>({
			type: ZirconNetworkMessageType.ZirconSerilogMessage,
			data,
			message: "",
			time: 0,
		});
		outputMessages.push(outputError);
		const loggablePlayers = Registry.InternalGetPlayersWithPermission("CanRecieveServerLogMessages");
		StandardOutput.SendToPlayers(loggablePlayers, outputError);
	}

	/**
	 * Writes a message to either the output stream or input stream of Zircon
	 */
	export function Write(level: ZirconLogLevel, tag: string, message: string, data: ZirconLogData) {
		switch (level) {
			case ZirconLogLevel.Debug:
			case ZirconLogLevel.Info:
			case ZirconLogLevel.Warning:
				writeServerLogMessage(level, tag, message, data);
				break;
			case ZirconLogLevel.Error:
			case ZirconLogLevel.Wtf:
				writeServerErrorMessage(level, tag, message, data);
				break;
		}
	}
}
export type ZirconLogService = typeof ZirconLogService;
