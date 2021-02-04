import { Players } from "@rbxts/services";
import ZrContext from "@rbxts/zirconium/out/Data/Context";
import { ZrValue } from "@rbxts/zirconium/out/Data/Locals";
import ZrLuauFunction from "@rbxts/zirconium/out/Data/LuauFunction";
import ZrScriptContext from "@rbxts/zirconium/out/Runtime/ScriptContext";
import ZirconGroup from "../Server/Class/ZirconGroup";

export namespace ZirconRegistryService {
	const contexts = new WeakMap<Player, Array<ZrScriptContext>>();
	const groups = new Map<string, ZirconGroup>();
	const playerGroupMap = new WeakMap<Player, Array<ZirconGroup>>();

	function* playerFunctionIterator(player: Player) {
		const groups = playerGroupMap.get(player);
		if (!groups) {
			return false;
		}

		for (const group of groups) {
			for (const value of group._getFunctions()) {
				yield value;
			}
		}

		return true;
	}

	export function GetScriptContextsForPlayer(player: Player) {
		let contextArray: Array<ZrScriptContext>;
		if (!contexts.has(player)) {
			print("createContext", player);
			contextArray = [];
			const context = new ZrScriptContext();
			for (const [name, fun] of playerFunctionIterator(player)) {
				print("registerGlobal", name, fun);
				context.registerGlobal(name, fun);
			}
			contextArray.push(context);
			contexts.set(player, contextArray);
		} else {
			contextArray = contexts.get(player)!;
		}

		return contextArray;
	}

	/**
	 * Register a raw ZrLuauFunction. Use `RegisterFunction` instead for a more secure version.
	 */
	export function RegisterZrLuauFunction(
		name: string,
		fn: (ctx: ZrContext, ...args: readonly ZrValue[]) => ZrValue | undefined | void,
		groups: ZirconGroup[],
	) {
		const funct = new ZrLuauFunction(fn);
		for (const group of groups) {
			group._registerFunction(name, fn);
		}
		return funct;
	}

	// TODO: Add register function
	export function RegisterFunction() {}

	export function RegisterGroup(rankInt: number, name: string) {
		assert(rankInt >= 0 && rankInt <= 255, "rankInt should be between 0 - 255");
		const group = new ZirconGroup(rankInt, name);
		groups.set(name, group);
		return group;
	}

	export function GetGroupOrThrow(name: string) {
		const group = groups.get(name);
		assert(group, "Group " + name + " does not exist!");
		return group;
	}

	export const User = RegisterGroup(1, "User");
	export const Creator = RegisterGroup(255, "Creator");
	export const Administrator = RegisterGroup(250, "Administrator");

	Players.PlayerAdded.Connect((player) => {
		playerGroupMap.set(player, [User]);
	});

	for (const player of Players.GetPlayers()) {
		playerGroupMap.set(player, [User]);
	}
}

export type ZirconRegistryService = typeof ZirconRegistryService;
