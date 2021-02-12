import { Players } from "@rbxts/services";
import ZrContext from "@rbxts/zirconium/out/Data/Context";
import { ZrValue } from "@rbxts/zirconium/out/Data/Locals";
import ZrLuauFunction from "@rbxts/zirconium/out/Data/LuauFunction";
import ZrScriptContext from "@rbxts/zirconium/out/Runtime/ScriptContext";
import { toArray } from "../Shared/Collections";
import ZirconUserGroup, { ZirconPermissions } from "../Server/Class/ZirconGroup";
import { $ifEnv } from "rbxts-transform-env";
import { $dbg } from "rbxts-transform-debug";

export namespace ZirconRegistryService {
	const contexts = new Map<Player, Array<ZrScriptContext>>();
	const groups = new Map<string, ZirconUserGroup>();
	const playerGroupMap = new Map<Player, Array<ZirconUserGroup>>();

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
			contextArray = [];
			const context = new ZrScriptContext();
			for (const [name, fun] of playerFunctionIterator(player)) {
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
		groups: ZirconUserGroup[],
	) {
		const funct = new ZrLuauFunction(fn);
		for (const group of groups) {
			$ifEnv("NODE_ENV", "development", () => print(`Add global '${name}' to group ${group.GetName()}`));
			group._registerFunction(name, fn);
		}
		return funct;
	}

	/**
	 * Registers a group to Zircon, which is used for the permissions of Zircon command execution as well as different zircon tools
	 * @param rankInt The rank integer - a number between 0 and 255. Higher number is a higher priority group.
	 * @param name The name of the group. Case insensitive.
	 * @param permissions The zircon permissions of this group
	 */
	export function RegisterGroup(rankInt: number, name: string, permissions: Partial<ZirconPermissions>) {
		assert(rankInt >= 0 && rankInt <= 255, "rankInt should be between 0 - 255");
		const group = new ZirconUserGroup(rankInt, name, {
			Permissions: {
				CanRecieveServerLogMessages: false,
				CanExecuteZirconiumScripts: false,
				CanAccessFullZirconEditor: false,
				...permissions,
			},
		});
		groups.set(name.lower(), group);
		return group;
	}

	/**
	 * Registers a group to Zircon, which is used for the permissions of Zircon command execution as well as different zircon tools.
	 * This function automatically binds this group to a roblox group rank
	 * @param groupId The group's id
	 * @param rankInt The rank integer - a number between 0 and 255. Higher number is a higher priority group. This should be the same as the roblox group rank.
	 * @param name The name of the group. Case insensitive.
	 * @param permissions The zircon permissions of this group
	 */
	export function RegisterGroupToRobloxGroup(
		groupId: number,
		rankInt: number,
		name: string,
		permissions: Partial<ZirconPermissions>,
	) {
		assert(rankInt >= 0 && rankInt <= 255, "rankInt should be between 0 - 255");
		const group = new ZirconUserGroup(rankInt, name, {
			BoundToGroup: {
				GroupId: groupId,
				GroupRank: rankInt,
			},
			Permissions: {
				CanRecieveServerLogMessages: false,
				CanExecuteZirconiumScripts: false,
				CanAccessFullZirconEditor: false,
				...permissions,
			},
		});
		groups.set(name.lower(), group);
		return group;
	}

	/**
	 * Adds the specified player to the targeted groups.
	 *
	 * All players are added to `user`, and group owners/game owners are added to `creator` by default.
	 * @param player The player to add to the groups
	 * @param targetGroups The groups to add the player to
	 */
	export function AddPlayerToGroups(player: Player, targetGroups: Array<string | ZirconUserGroup>) {
		const playerGroups = playerGroupMap.get(player) ?? [];
		for (const groupOrId of targetGroups) {
			const group = typeIs(groupOrId, "string") ? groups.get(groupOrId) : groupOrId;
			if (group) {
				$ifEnv("NODE_ENV", "development", () =>
					print(
						`Add player '${player}' to groups [ ${targetGroups
							.map((s) => (typeIs(s, "string") ? s : s.GetName()))
							.join(", ")} ]`,
					),
				);

				group.AddMember(player);
				playerGroups.push(group);
			} else {
				warn(`[Zircon] Failed to add player '${player}' to group '${tostring(groupOrId)}'`);
			}
		}
		playerGroupMap.set(player, playerGroups);
	}

	/** @internal */
	export function GetGroupsWithPermission<K extends keyof ZirconPermissions>(permission: K) {
		const matching = new Array<ZirconUserGroup>();
		for (const [, group] of groups) {
			if (group.GetPermission(permission)) {
				matching.push(group);
			}
		}
		return matching;
	}

	/**
	 * The cache of players that are allowed this permission
	 */
	const permissionGroupCache = new Map<keyof ZirconPermissions, Player[]>();
	/**
	 * Gets the players with the specified permission
	 * @internal
	 */
	export function InternalGetPlayersWithPermission<K extends keyof ZirconPermissions>(permission: K) {
		$ifEnv("NODE_ENV", "development", () => {
			print("GetPlayersWithPermission", permission);
		});
		if (permissionGroupCache.has(permission)) {
			return permissionGroupCache.get(permission)!;
		}

		const groups = GetGroupsWithPermission(permission);
		const playerSet = new Set<Player>();
		for (const group of groups) {
			for (const member of group.GetMembers()) {
				playerSet.add(member);
			}
		}

		const arr = toArray(playerSet);
		permissionGroupCache.set(permission, arr);
		return $dbg(arr);
	}

	/** @internal */
	export function InternalGetPlayerHasPermission<K extends keyof ZirconPermissions>(player: Player, permission: K) {
		const players = InternalGetPlayersWithPermission(permission);
		return players.find((p) => p === player) !== undefined;
	}

	export function GetGroupOrThrow(name: string) {
		const group = groups.get(name.lower());
		assert(group, "Group '" + name + "' does not exist!");
		return group;
	}

	/**
	 * The default `user` group. All players are a member of this group by default.
	 */
	export const User = RegisterGroup(1, "user", {});

	/**
	 * The default `creator` group. The group or place owner is added to this group by default.
	 *
	 * This group has _all_ permissions, you should use `administrator` if you want to add other people with high permissions.
	 */
	export const Creator = RegisterGroup(255, "creator", {
		CanRecieveServerLogMessages: true,
		CanExecuteZirconiumScripts: true,
		CanAccessFullZirconEditor: true,
	});

	/**
	 * The default `administrator` group. If this is a group place,
	 * it will add anyone with a rank higher than 250 to this group.
	 *
	 * This group has high permissions, so be careful about adding anyone else to it unless you explicitly trust them.
	 */
	export const Administrator = RegisterGroup(250, "administrator", {
		CanRecieveServerLogMessages: true,
		CanExecuteZirconiumScripts: true,
		CanAccessFullZirconEditor: true,
	});

	function getPlayerDefaultGroups(player: Player) {
		const groups = [User];
		if (game.CreatorType === Enum.CreatorType.Group) {
			if (player.GetRankInGroup(game.CreatorId) >= 255) {
				groups.push(Creator);
			}
		} else if (game.CreatorType === Enum.CreatorType.User && game.CreatorId === player.UserId) {
			groups.push(Creator);
		}
		return groups;
	}

	Players.PlayerAdded.Connect((player) => {
		permissionGroupCache.clear();
		AddPlayerToGroups(player, getPlayerDefaultGroups(player));
	});

	Players.PlayerRemoving.Connect((player) => {
		permissionGroupCache.clear();
		contexts.delete(player);
		playerGroupMap.delete(player);
	});

	for (const player of Players.GetPlayers()) {
		AddPlayerToGroups(player, getPlayerDefaultGroups(player));
	}
}

export type ZirconRegistryService = typeof ZirconRegistryService;
