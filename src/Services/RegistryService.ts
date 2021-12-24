import { Players, RunService } from "@rbxts/services";
import ZrScriptContext from "@rbxts/zirconium/out/Runtime/ScriptContext";
import { toArray } from "../Shared/Collections";
import ZirconUserGroup, { ZirconPermissions } from "../Server/Class/ZirconGroup";
import { $ifEnv } from "rbxts-transform-env";
import ZrPlayerScriptContext from "@rbxts/zirconium/out/Runtime/PlayerScriptContext";
import { ZirconFunction } from "Class/ZirconFunction";
import { ZirconNamespace } from "Class/ZirconNamespace";
import { ZirconEnum } from "Class/ZirconEnum";
import { ZirconConfiguration } from "Class/ZirconConfigurationBuilder";
import { ZirconBindingType } from "Class/ZirconGroupBuilder";

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

	export function GetGroups(...groupIds: string[]) {
		return groupIds.mapFiltered((groupId) => groups.get(groupId.lower()));
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
	function AddPlayerToGroups(player: Player, targetGroups: Array<string | ZirconUserGroup>) {
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
	 * Initializes Zircon on the server with the given configuration
	 *
	 * This needs to be done for Zircon to run.
	 * @param configuration
	 */
	export function Init(configuration: ZirconConfiguration) {
		const configurationGroups = configuration.Groups;
		for (const group of configurationGroups) {
			const userGroup = new ZirconUserGroup(group.Rank, group.Id, group);
			groups.set(group.Id.lower(), userGroup);
		}

		for (const [typeId, typeGroups] of configuration.Registry) {
			if (typeId instanceof ZirconFunction) {
				RegisterFunction(typeId, GetGroups(...typeGroups));
			} else if (typeId instanceof ZirconEnum) {
				RegisterEnum(typeId, GetGroups(...typeGroups));
			} else if (typeId instanceof ZirconNamespace) {
				RegisterNamespace(typeId, GetGroups(...typeGroups));
			}
		}

		Players.PlayerAdded.Connect((player) => {
			permissionGroupCache.clear();

			const groupsToJoin = new Array<ZirconUserGroup>();
			for (const [, group] of groups) {
				if (group.CanJoinGroup(player)) {
					groupsToJoin.push(group);
				}
			}

			AddPlayerToGroups(player, groupsToJoin);
		});

		Players.PlayerRemoving.Connect((player) => {
			permissionGroupCache.clear();
			contexts.delete(player);
			playerGroupMap.delete(player);
		});

		for (const player of Players.GetPlayers()) {
			const groupsToJoin = new Array<ZirconUserGroup>();
			for (const [, group] of groups) {
				if (group.CanJoinGroup(player)) {
					groupsToJoin.push(group);
				}
			}

			AddPlayerToGroups(player, groupsToJoin);
		}
	}
}

export type ZirconRegistryService = typeof ZirconRegistryService;
