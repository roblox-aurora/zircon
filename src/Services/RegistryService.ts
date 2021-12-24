import { Players } from "@rbxts/services";
import ZrScriptContext from "@rbxts/zirconium/out/Runtime/ScriptContext";
import { toArray } from "../Shared/Collections";
import ZirconUserGroup, { ZirconPermissions } from "../Server/Class/ZirconGroup";
import { $ifEnv } from "rbxts-transform-env";
import ZrPlayerScriptContext from "@rbxts/zirconium/out/Runtime/PlayerScriptContext";
import { ZirconFunction } from "Class/ZirconFunction";
import { ZirconNamespace } from "Class/ZirconNamespace";
import { ZirconEnum } from "Class/ZirconEnum";
import { ZirconConfiguration, ZirconConfigurationBuilder, ZirconScopedGlobal } from "Class/ZirconConfigurationBuilder";
import Remotes, { RemoteId } from "Shared/Remotes";
import { $print } from "rbxts-transform-debug";

export namespace ZirconRegistryService {
	const contexts = new Map<Player, Array<ZrScriptContext>>();
	const groups = new Map<string, ZirconUserGroup>();
	const playerGroupMap = new Map<Player, Array<ZirconUserGroup>>();
	const unregisteredTypes = new Array<ZirconScopedGlobal>();
	let initalized = false;

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
	 * @deprecated Use `ZirconFunctionBuilder` + the ZirconConfigurationBuilder API
	 */
	export function RegisterFunction(func: ZirconFunction<any, any>, groupIds: readonly string[]) {
		if (!initalized) {
			unregisteredTypes.push([func, groupIds]);
		} else {
			$print("registered", func, "after init");
			for (const group of GetGroups(groupIds)) {
				group.RegisterFunction(func);
			}
		}
	}

	/**
	 * Registers a namespace to the specified group(s)
	 * @param namespace The namespace
	 * @param groups The groups to register it to
	 * @deprecated Use `ZirconNamespaceBuilder` + the ZirconConfigurationBuilder API
	 */
	export function RegisterNamespace(namespace: ZirconNamespace, groupIds: readonly string[]) {
		if (!initalized) {
			unregisteredTypes.push([namespace, groupIds]);
		} else {
			$print("registered", namespace, "after init");
			for (const group of GetGroups(groupIds)) {
				group.RegisterNamespace(namespace);
			}
		}
	}

	export function GetGroups(groupIds: readonly string[]) {
		return groupIds.mapFiltered((groupId) => groups.get(groupId.lower()));
	}

	/**
	 * Registers an enumerable type to the specified group(s)
	 * @param enumType The enumerable type
	 * @param groups The groups to register the enum to
	 * @returns The enum
	 * @deprecated Use `ZirconEnumBuilder` + the ZirconConfigurationBuilder API
	 */
	export function RegisterEnum<K extends string>(enumType: ZirconEnum<K>, groupIds: readonly string[]) {
		if (!initalized) {
			unregisteredTypes.push([enumType, groupIds]);
		} else {
			$print("registered", enumType, "after init");
			for (const group of GetGroups(groupIds)) {
				group.RegisterEnum(enumType);
			}
		}
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

	function RegisterZirconGlobal([typeId, typeGroups]: ZirconScopedGlobal) {
		if (typeId instanceof ZirconFunction) {
			for (const group of GetGroups(typeGroups)) {
				group.RegisterFunction(typeId);
			}
		} else if (typeId instanceof ZirconEnum) {
			for (const group of GetGroups(typeGroups)) {
				group.RegisterEnum(typeId);
			}
		} else if (typeId instanceof ZirconNamespace) {
			for (const group of GetGroups(typeGroups)) {
				group.RegisterNamespace(typeId);
			}
		}
	}

	/**
	 * Initializes Zircon as a logging console *only*.
	 *
	 * This is equivalent to
	 * ```ts
	 * ZirconServer.Registry.Init(ZirconConfigurationBuilder.logging())
	 * ```
	 */
	export function InitLogging() {
		return Init(ZirconConfigurationBuilder.logging());
	}

	/**
	 * Initializes Zircon on the server with a given configuration if specified.
	 *
	 * If no configuration is passed, it will behave as a logging console _only_.
	 * @param configuration The configuration
	 */
	export function Init(configuration: ZirconConfiguration) {
		if (initalized) {
			return;
		}

		const configurationGroups = configuration.Groups;
		for (const group of configurationGroups) {
			$print("register zircon group", group.Id);
			const userGroup = new ZirconUserGroup(group.Rank, group.Id, group);
			groups.set(group.Id.lower(), userGroup);
		}

		// Handle builder API types
		for (const typeId of configuration.Registry) {
			$print("register zircon global (thru new api)", typeId[0]);
			RegisterZirconGlobal(typeId);
		}

		// Handle any types registered with the deprecated api
		for (const typeId of unregisteredTypes) {
			$print("register zircon global (thru deprecated api)", typeId[0]);
			RegisterZirconGlobal(typeId);
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
			Remotes.Server.Get(RemoteId.ZirconInitialized).SendToPlayer(player);
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

		initalized = true;
		Remotes.Server.Get(RemoteId.ZirconInitialized).SendToAllPlayers();
	}

	Remotes.Server.OnFunction(RemoteId.GetZirconInitialized, () => initalized);
}

export type ZirconRegistryService = typeof ZirconRegistryService;
