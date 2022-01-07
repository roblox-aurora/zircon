import { ZirconPermissions } from "Server/Class/ZirconGroup";
import { ZirconConfigurationBuilder } from "./ZirconConfigurationBuilder";

export interface ZirconGroupLink {
	readonly GroupId: number;
	readonly GroupRoleOrRank: string | number;
}

export enum ZirconBindingType {
	Creator = 1 << 0,
	Group = 1 << 1,
	UserIds = 1 << 2,
	Everyone = 1 << 30,
}

export interface ZirconGroupConfiguration {
	readonly Id: string;
	readonly Rank: number;
	readonly Permissions: ZirconPermissions;
	readonly BindType: ZirconBindingType;
	readonly Groups: readonly ZirconGroupLink[];
	readonly UserIds: number[];
}

export class ZirconGroupBuilder {
	public permissions: ZirconPermissions = {
		CanAccessConsole: true,
		CanAccessFullZirconEditor: false,
		CanExecuteZirconiumScripts: false,
		CanViewLogMetadata: false,
		CanRecieveServerLogMessages: false,
	};

	public groupLink = new Array<ZirconGroupLink>();
	public userIds = new Array<number>();
	public bindType: ZirconBindingType = 0;

	public constructor(private parent: ZirconConfigurationBuilder, private rank: number, private id: string) {}

	/** @deprecated @hidden */
	public SetPermission<K extends keyof ZirconPermissions>(key: K, value: ZirconPermissions[K]) {
		this.permissions[key] = value;
		return this;
	}

	/**
	 * Sets the permissions applicable to this group
	 * @param permissions The permissions to override
	 */
	public SetPermissions(permissions: Partial<ZirconPermissions>) {
		this.permissions = {
			CanAccessConsole: permissions.CanAccessConsole ?? this.permissions.CanAccessConsole,
			CanRecieveServerLogMessages:
				permissions.CanRecieveServerLogMessages ?? this.permissions.CanRecieveServerLogMessages,
			CanAccessFullZirconEditor:
				permissions.CanAccessFullZirconEditor ?? this.permissions.CanAccessFullZirconEditor,
			CanExecuteZirconiumScripts:
				permissions.CanExecuteZirconiumScripts ?? this.permissions.CanExecuteZirconiumScripts,
			CanViewLogMetadata:
				permissions.CanViewLogMetadata ??
				permissions.CanRecieveServerLogMessages ??
				this.permissions.CanViewLogMetadata,
		};
		return this;
	}

	/**
	 * Binds this group to the specified group, and the role
	 * @param groupId The group id
	 * @param groupRole The role (string)
	 */
	public BindToGroupRole(groupId: number, groupRole: string) {
		this.groupLink.push({
			GroupId: groupId,
			GroupRoleOrRank: groupRole,
		});
		return this;
	}

	/**
	 * Binds this group to the specified user ids
	 * @param userIds The user ids
	 */
	public BindToUserIds(userIds: readonly number[]) {
		this.bindType |= ZirconBindingType.UserIds;
		for (const userId of userIds) {
			this.userIds.push(userId);
		}
		return this;
	}

	/**
	 * Binds this group to _all players_.
	 */
	public BindToEveryone() {
		this.bindType |= ZirconBindingType.Everyone;
		return this;
	}

	/**
	 * Binds the group to the creator of this game - either the group owner (if a group game) or the place owner.
	 */
	public BindToCreator() {
		this.bindType |= ZirconBindingType.Creator;
		return this;
	}

	/**
	 * Binds this group to the specified group role and rank
	 * @param groupId The group id
	 * @param groupRank The group rank (number)
	 */
	public BindToGroupRank(groupId: number, groupRank: number) {
		this.bindType |= ZirconBindingType.Group;
		this.groupLink.push({
			GroupId: groupId,
			GroupRoleOrRank: groupRank,
		});
		return this;
	}

	/** @internal */
	public Add() {
		const { configuration } = this.parent;
		configuration.Groups = [
			...configuration.Groups,
			{
				Id: this.id,
				Rank: this.rank,
				UserIds: this.userIds,
				BindType: this.bindType,
				Permissions: this.permissions,
				Groups: this.groupLink,
			},
		];

		return this.parent;
	}
}
