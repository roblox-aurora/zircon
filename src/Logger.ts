import { RunService } from "@rbxts/services";

namespace ZirconLog {
	export type Tag = string | Instance | { ToString(): string };

	export function debug(tag: Tag, message: string) {
		if (RunService.IsStudio()) {
		}
	}
	export function info(tag: Tag, message: string) {
		if (RunService.IsServer()) {
			// handle differently
		} else {
		}
	}
	export function warn(tag: Tag, message: string) {}
	export function error(tag: Tag, message: string) {}
}
export default ZirconLog;
