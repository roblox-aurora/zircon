import { RunService } from "@rbxts/services";
import ZrContext from "@rbxts/zirconium/out/Data/Context";
import { ZrEnum } from "@rbxts/zirconium/out/Data/Enum";
import { ZrValue } from "@rbxts/zirconium/out/Data/Locals";
import ZrLuauFunction from "@rbxts/zirconium/out/Data/LuauFunction";
import ZrUndefined from "@rbxts/zirconium/out/Data/Undefined";
import { ZrObjectUserdata } from "@rbxts/zirconium/out/Data/Userdata";
import { ZirconEnum } from "Class/ZirconEnum";
import { ZirconFunction } from "Class/ZirconFunction";
import { ZirconBindingType, ZirconGroupConfiguration } from "Class/ZirconGroupBuilder";
import { ZirconNamespace } from "Class/ZirconNamespace";

export interface ZirconRobloxGroupBinding {
	GroupId: number;
	GroupRank: number;
}

export type ZirconPermissionSet = Set<keyof ZirconPermissions>;
export type ReadonlyZirconPermissionSet = ReadonlySet<keyof ZirconPermissions>;

export interface ZirconPermissions {
	/**
	 * Whether or not this group can access the console using the shortcut key
	 */
	readonly CanAccessConsole: boolean;

	/**
	 * Whether or not this group can recieve `Zircon.Log*` messages from the server
	 */
	readonly CanRecieveServerLogMessages: boolean;
	/**
	 * Whether or not this group is allowed to execute Zirconium scripts
	 */
	readonly CanExecuteZirconiumScripts: boolean;

	/**
	 * Whether or not this group has full access to the Zircon Editor for Zirconium
	 * @deprecated @hidden
	 */
	readonly CanAccessFullZirconEditor: boolean;

	/**
	 * Whether or not this user can view more information about a log message by clicking on it
	 */
	readonly CanViewLogMetadata: boolean;
}

export enum ZirconGroupType {
	User,
	Moderator,
	Administrator,
}

export default class ZirconUserGroup {
	private functions = new Map<string, ZrLuauFunction>();
	private namespaces = new Map<string, ZrObjectUserdata<defined>>();
	private enums = new Map<string, ZrEnum>();

	private permissions: ZirconPermissionSet;
	private members = new WeakSet<Player>();

	public constructor(private id: number, private name: string, private configuration: ZirconGroupConfiguration) {
		const permissionSet = new Set<keyof ZirconPermissions>();
		for (const [name, enabled] of pairs(configuration.Permissions)) {
			if (typeIs(enabled, "boolean") && enabled) {
				permissionSet.add(name);
			}
		}
		this.permissions = permissionSet;
	}

	public AddMember(player: Player) {
		this.members.add(player);
	}

	public GetMembers(): ReadonlySet<Player> {
		return this.members;
	}

	public HasMember(player: Player) {
		return this.members.has(player);
	}

	public GetConfiguration(): ZirconGroupConfiguration {
		return this.configuration;
	}

	public CanJoinGroup(player: Player) {
		const group = this.configuration;
		let canJoinGroup = false;

		if ((group.BindType & ZirconBindingType.Group) !== 0) {
			const matchesGroup = group.Groups;
			for (const group of matchesGroup) {
				if (typeIs(group.GroupRoleOrRank, "string")) {
					canJoinGroup ||= player.GetRoleInGroup(group.GroupId) === group.GroupRoleOrRank;
				} else {
					canJoinGroup ||= player.GetRankInGroup(group.GroupId) >= group.GroupRoleOrRank;
				}
			}
		}

		if ((group.BindType & ZirconBindingType.UserIds) !== 0) {
			canJoinGroup ||= group.UserIds.includes(player.UserId);
		}

		if ((group.BindType & ZirconBindingType.Everyone) !== 0) {
			canJoinGroup = true;
		}

		if ((group.BindType & ZirconBindingType.Creator) !== 0) {
			if (RunService.IsStudio()) {
				canJoinGroup = true;
			}

			if (game.CreatorType === Enum.CreatorType.Group) {
				canJoinGroup ||= player.GetRankInGroup(game.CreatorId) >= 255;
			} else {
				canJoinGroup ||= game.CreatorId === player.UserId;
			}
		}

		return canJoinGroup;
	}

	public GetName() {
		return this.name;
	}

	public GetRank() {
		return this.id;
	}

	public GetPermissions(): ReadonlyZirconPermissionSet {
		return this.permissions;
	}

	public GetPermission<K extends keyof ZirconPermissions>(name: K): ZirconPermissions[K] {
		return this.configuration.Permissions[name];
	}

	/** @internal */
	public RegisterFunction(func: ZirconFunction<any, any>) {
		this.functions.set(func.GetName(), func);
	}

	/** @internal */
	public RegisterEnum(enumerable: ZirconEnum<any>) {
		this.enums.set(enumerable.getEnumName(), enumerable);
	}

	/** @internal */
	public RegisterNamespace(namespace: ZirconNamespace) {
		this.namespaces.set(namespace.GetName(), namespace.ToUserdata());
	}

	/** @internal */
	public _getFunctions(): ReadonlyMap<string, ZrLuauFunction> {
		return this.functions;
	}

	/** @internal */
	public _getNamespaces(): ReadonlyMap<string, ZrValue> {
		return this.namespaces;
	}

	/** @internal */
	public _getEnums(): ReadonlyMap<string, ZrValue> {
		return this.enums;
	}
}
