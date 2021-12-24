import { LogLevel } from "@rbxts/log";
import { NamespaceBuilder } from "@rbxts/net/out/definitions/NamespaceBuilder";
import ZirconServer from "Server";
import ZirconFunction, { ZrTypeCheck } from "Server/Class/ZirconFunction";
import { ZirconPermissions } from "Server/Class/ZirconGroup";
import { ZirconEnum } from "./ZirconEnum";
import { ZirconGroupBuilder, ZirconGroupConfiguration } from "./ZirconGroupBuilder";
import { ZirconNamespace } from "./ZirconNamespace";
import { ZirconNamespaceBuilder } from "./ZirconNamespaceBuilder";

export type ZirconScopedGlobal = readonly [
	type: ZirconNamespace | ZirconEnum<any> | ZirconFunction<any>,
	groups: readonly string[],
];

export interface ZirconConfiguration {
	readonly Groups: readonly ZirconGroupConfiguration[];
	readonly Registry: ZirconScopedGlobal[];
}

export const enum ZirconDefaultGroup {
	Admin = "admin",
	User = "user",
	Creator = "creator",
}

export class ZirconConfigurationBuilder {
	public configuration: Writable<ZirconConfiguration> = {
		Groups: [],
		Registry: [],
	};

	public constructor() {}

	/**
	 * Creates a group, given the specified configuration
	 * @param rank The rank. This is used for group priority
	 * @param id The id of the group to create
	 * @param cb The configuration
	 */
	public CreateGroup(rank: number, id: string, cb: (group: ZirconGroupBuilder) => ZirconGroupBuilder) {
		const group = new ZirconGroupBuilder(this, rank, id);
		cb(group).Add();
		return this;
	}

	/**
	 * Creates a default `creator` group. This will refer to either the game creator, or group creator.
	 * @returns
	 */
	public CreateDefaultCreatorGroup() {
		return new ZirconGroupBuilder(this, 255, ZirconDefaultGroup.Creator)
			.BindToCreator()
			.SetPermissions({
				CanAccessFullZirconEditor: true,
				CanExecuteZirconiumScripts: true,
				CanRecieveServerLogMessages: true,
			})
			.Add();
	}

	/**
	 * Creates a default `admin` group.
	 *
	 * If this place is a group-owned place, and no arguments are provided anyone in the group
	 * with a rank equal or higher to `250` is considered an administrator.
	 *
	 * If this isn't a group game, or you want a custom rule for `admin` you need to provide a configuration callback
	 * @returns
	 */
	public CreateDefaultAdminGroup(c?: (group: ZirconGroupBuilder) => ZirconGroupBuilder) {
		const group = new ZirconGroupBuilder(this, 250, ZirconDefaultGroup.Admin).SetPermissions({
			CanAccessFullZirconEditor: true,
			CanExecuteZirconiumScripts: true,
			CanRecieveServerLogMessages: true,
		});
		if (c !== undefined) {
			c(group);
		} else {
			if (game.CreatorType === Enum.CreatorType.Group) {
				group.BindToGroupRank(game.CreatorId, 250);
			} else {
				ZirconServer.Log.WriteStructured({
					Level: LogLevel.Warning,
					Template:
						"Implicit administrator groups only work in group places, try explicitly setting the admin group config",
					Timestamp: DateTime.now().ToIsoDate(),
					SourceContext: "CreateDefaultAdminGroup",
				});
			}
		}

		return group.Add();
	}

	/**
	 * Creates a default `user` group, this refers to _anyone_ and shouldn't be used for more sensitive things.
	 * @returns
	 */
	public CreateDefaultUserGroup() {
		return new ZirconGroupBuilder(this, 1, ZirconDefaultGroup.User).BindToEveryone().Add();
	}

	public CreateNamespace(name: string, cb: (namespace: ZirconNamespaceBuilder) => ZirconNamespaceBuilder) {
		return this;
	}

	public AddNamespace(namespace: ZirconNamespace, groups: readonly string[]) {
		this.configuration.Registry = [...this.configuration.Registry, [namespace, groups]];
		return this;
	}

	public AddEnum<K extends string>(enumType: ZirconEnum<K>, groups: readonly string[]) {
		this.configuration.Registry = [...this.configuration.Registry, [enumType, groups]];
		return this;
	}

	public AddFunction<A extends readonly ZrTypeCheck[], R = unknown>(
		functionType: ZirconFunction<A, R>,
		groups: readonly string[],
	) {
		this.configuration.Registry = [...this.configuration.Registry, [functionType, groups]];
		return this;
	}

	/**
	 * Returns a logging configuration, which creates a `creator` group with the permission to read server output, and a `user` group.
	 * @returns
	 */
	public static logging() {
		return new ZirconConfigurationBuilder()
			.CreateGroup(255, ZirconDefaultGroup.Creator, (group) =>
				group.BindToCreator().SetPermissions({
					CanAccessFullZirconEditor: false,
					CanExecuteZirconiumScripts: false,
					CanRecieveServerLogMessages: true,
				}),
			)
			.CreateDefaultUserGroup()
			.Build();
	}

	/**
	 * Returns a default configuration, which includes the `creator`, `admin`, and `user` groups.
	 */
	public static default() {
		if (game.CreatorType === Enum.CreatorType.Group) {
			return new ZirconConfigurationBuilder()
				.CreateDefaultCreatorGroup()
				.CreateDefaultAdminGroup()
				.CreateDefaultUserGroup();
		} else {
			return new ZirconConfigurationBuilder().CreateDefaultCreatorGroup().CreateDefaultUserGroup();
		}
	}

	/** @internal */
	public Build(): ZirconConfiguration {
		return this.configuration;
	}
}
