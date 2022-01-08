import { Node } from "@rbxts/zirconium/out/Ast/Nodes/NodeTypes";
import { ZrParserError } from "@rbxts/zirconium/out/Ast/Parser";
import { Token } from "@rbxts/zirconium/out/Ast/Tokens/Tokens";
import { ZrRuntimeError } from "@rbxts/zirconium/out/Runtime/Runtime";
import { $dbg } from "rbxts-transform-debug";
import {
	ZirconDebugInformation,
	ZirconErrorOutput,
	ZirconiumParserErrorMessage,
	ZirconiumRuntimeErrorMessage,
	ZirconNetworkMessageType,
} from "./Remotes";

/** @internal */
export namespace ZirconDebug {
	/** @internal */
	export function IsParserError(err: ZrRuntimeError | ZrParserError): err is ZrParserError {
		return err.code >= 1000;
	}

	/** @internal */
	export function GetDebugInformationForNode(source: string, node: Node) {
		const startPos = node.startPos ?? 0;
		const endPos = node.endPos ?? startPos;

		let col = 0;
		let row = 1;
		let lineStart = 0;
		let lineEnd = source.size();
		let reachedToken = false;
		let reachedEndToken = false;
		for (let i = 0; i < source.size(); i++) {
			const char = source.sub(i + 1, i + 1);

			if (i === startPos) {
				reachedToken = true;
			}

			if (i === endPos) {
				reachedEndToken = true;
			}

			if (char === "\n") {
				lineEnd = i;
				if (!reachedToken) {
					lineStart = i + 1;
				} else if (reachedEndToken) {
					break;
				}

				row += 1;
				col = 1;
			} else {
				col += 1;
			}
		}
		if (reachedToken) {
			return $dbg(
				identity<ZirconDebugInformation>({
					LineAndColumn: [row, col],
					CodeLine: [lineStart, lineEnd],
					TokenPosition: [startPos, endPos],
					TokenLinePosition: [startPos - lineStart, endPos - lineStart],
					Line: source.sub(lineStart + 1, lineEnd + 1),
				}),
			);
		}
	}

	/** @internal */
	export function GetDebugInformationForToken(source: string, token: Token) {
		let col = 0;
		let row = 1;
		let lineStart = 0;
		let lineEnd = source.size();
		let reachedToken = false;
		for (let i = 0; i < source.size(); i++) {
			const char = source.sub(i + 1, i + 1);

			if (i === token.startPos) {
				reachedToken = true;
			}

			if (char === "\n") {
				lineEnd = i;
				if (reachedToken) {
					break;
				}
				lineStart = i + 1;
				row += 1;
				col = 1;
			} else {
				col += 1;
			}
		}

		if (reachedToken) {
			return $dbg(
				identity<ZirconDebugInformation>({
					LineAndColumn: [row, col],
					CodeLine: [lineStart, lineEnd],
					TokenPosition: [token.startPos, token.endPos],
					TokenLinePosition: [token.startPos - lineStart, token.endPos - lineStart],
					Line: source.sub(lineStart + 1, lineEnd + 1),
				}),
			);
		}
	}

	/** @internal */
	export function GetMessageForError(
		source: string,
		zrError: ZrRuntimeError | ZrParserError,
	): ZirconiumRuntimeErrorMessage | ZirconiumParserErrorMessage {
		if (ZirconDebug.IsParserError(zrError)) {
			const debug = zrError.token ? ZirconDebug.GetDebugInformationForToken(source, zrError.token) : undefined;

			return {
				type: ZirconNetworkMessageType.ZirconiumParserError,
				script: "zr",
				time: DateTime.now().UnixTimestamp,
				source: debug ? debug.LineAndColumn : undefined,
				debug,
				message: zrError.message,
				code: zrError.code,
			};
		} else {
			const debug = zrError.node ? ZirconDebug.GetDebugInformationForNode(source, zrError.node) : undefined;

			return {
				type: ZirconNetworkMessageType.ZirconiumRuntimeError,
				time: DateTime.now().UnixTimestamp,
				debug,
				script: "zr",
				message: zrError.message,
				code: zrError.code,
			};
		}
	}
}
