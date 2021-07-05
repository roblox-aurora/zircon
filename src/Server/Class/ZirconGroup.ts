import ZrContext from "@rbxts/zirconium/out/Data/Context";
import { ZrValue } from "@rbxts/zirconium/out/Data/Locals";
import ZrLuauFunction from "@rbxts/zirconium/out/Data/LuauFunction";
import ZrUndefined from "@rbxts/zirconium/out/Data/Undefined";
import { ZrObjectUserdata } from "@rbxts/zirconium/out/Data/Userdata";
import { ZirconFunction } from "Class/ZirconFunction";
import { ZirconNamespace } from "Class/ZirconNamespace";

export interface ZirconRobloxGroupBinding {
	GroupId: number;
	GroupRank: number;
}

export interface ZirconGroupConfiguration {
	readonly Permissions: ZirconPermissions;
	readonly BoundToGroup?: ZirconRobloxGroupBinding;
}

export type ZirconPermissionSet = Set<keyof ZirconPermissions>;
export type ReadonlyZirconPermissionSet = ReadonlySet<keyof ZirconPermissions>;

export interface ZirconPermissions {
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
	 */
	readonly CanAccessFullZirconEditor: boolean;
}

export enum ZirconGroupType {
	User,
	Moderator,
	Administrator,
}

export default class ZirconUserGroup {
	private functions = new Map<string, ZrLuauFunction>();
	private namespaces = new Map<string, ZrObjectUserdata<defined>>();
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
}
