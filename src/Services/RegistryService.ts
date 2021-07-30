import { Players, RunService } from "@rbxts/services";
import ZrScriptContext from "@rbxts/zirconium/out/Runtime/ScriptContext";
import { toArray } from "../Shared/Collections";
import ZirconUserGroup, { ZirconPermissions } from "../Server/Class/ZirconGroup";
import { $ifEnv } from "rbxts-transform-env";
import ZrPlayerScriptContext from "@rbxts/zirconium/out/Runtime/PlayerScriptContext";
import { ZirconFunction } from "Class/ZirconFunction";
import { ZirconNamespace } from "Class/ZirconNamespace";
import { ZirconEnum } from "Class/ZirconEnum";
import t from "@rbxts/t";

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
			for (const value of group._getNamespaces()) {
				yield value;
			}
		}

		return true;
	}

	/** @internal */
	export function GetScriptContextsForPlayer(player: Player) {
		let contextArray: Array<ZrScriptContext>;
		if (!contexts.has(player)) {
			contextArray = [];
			const context = new ZrPlayerScriptContext(player);
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
	 * Registers a function in the global namespace to the specified group(s)
	 * @param func The function to register
	 * @param groups The groups
	 */
	export function RegisterFunction(func: ZirconFunction<any, any>, groups: ZirconUserGroup[]) {
		for (const group of groups) {
			group.RegisterFunction(func);
		}
	}

	/**
	 * Registers a namespace to the specified group(s)
	 * @param namespace The namespace
	 * @param groups The groups to register it to
	 */
	export function RegisterNamespace(namespace: ZirconNamespace, groups: ZirconUserGroup[]) {
		for (const group of groups) {
			group.RegisterNamespace(namespace);
		}
	}

	/**
	 * Registers an enum from an array of strings
	 * @param name The name of the enum
	 * @param values The values of the enum
	 * @param groups The groups this enum applies to
	 */
	export function RegisterEnumFromArray<K extends string>(name: string, values: K[], groups: ZirconUserGroup[]) {
		return RegisterEnum(new ZirconEnum(name, values), groups);
	}

	/**
	 * Registers an enumerable type to the specified group(s)
	 * @param enumType The enumerable type
	 * @param groups The groups to register the enum to
	 * @returns The enum
	 */
	export function RegisterEnum<K extends string>(enumType: ZirconEnum<K>, groups: ZirconUserGroup[]) {
		for (const group of groups) {
			group.RegisterEnum(enumType);
		}
		return enumType;
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
	 * Gets the highest player group for this player
	 */
	export function GetHighestPlayerGroup(player: Player) {
		return playerGroupMap.get(player)?.reduce((acc, curr) => (curr.GetRank() > acc.GetRank() ? curr : acc));
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
		return arr;
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

		if (RunService.IsStudio()) {
			groups.push(Administrator);
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
