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
		CanAccessFullZirconEditor: false,
		CanExecuteZirconiumScripts: false,
		CanRecieveServerLogMessages: false,
	};

	public groupLink = new Array<ZirconGroupLink>();
	public userIds = new Array<number>();
	public bindType: ZirconBindingType = 0;

	public constructor(private parent: ZirconConfigurationBuilder, private rank: number, private id: string) {}

	public SetPermission<K extends keyof ZirconPermissions>(key: K, value: ZirconPermissions[K]) {
		this.permissions[key] = value;
		return this;
	}

	public SetPermissions(permissions: Partial<ZirconPermissions>) {
		this.permissions = { ...this.permissions, ...permissions };
		return this;
	}

	public BindToGroupRole(groupId: number, groupRole: string) {
		this.groupLink.push({
			GroupId: groupId,
			GroupRoleOrRank: groupRole,
		});
		return this;
	}

	public BindToUserIds(userIds: readonly number[]) {
		this.bindType |= ZirconBindingType.UserIds;
		for (const userId of userIds) {
			this.userIds.push(userId);
		}
		return this;
	}

	public BindToEveryone() {
		this.bindType |= ZirconBindingType.Everyone;
		return this;
	}

	public BindToCreator() {
		this.bindType |= ZirconBindingType.Creator;
		return this;
	}

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
