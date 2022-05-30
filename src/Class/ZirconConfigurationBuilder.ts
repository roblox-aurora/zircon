import { LogLevel } from "@rbxts/log";
import { NamespaceBuilder } from "@rbxts/net/out/definitions/NamespaceBuilder";
import { ZrValue } from "@rbxts/zirconium/out/Data/Locals";
import ZirconServer from "Server";
import { ZrTypeCheck } from "Server/Class/ZirconFunction";
import { ZirconPermissions } from "Server/Class/ZirconGroup";
import { ZirconAfterContext, ZirconBeforeContext, ZirconContext } from "./ZirconContext";
import { ZirconEnum } from "./ZirconEnum";
import { ZirconFunction } from "./ZirconFunction";
import { ZirconGroupBuilder, ZirconGroupConfiguration } from "./ZirconGroupBuilder";
import { ZirconNamespace } from "./ZirconNamespace";
import { ZirconNamespaceBuilder } from "./ZirconNamespaceBuilder";
import { ZirconValidator } from "./ZirconTypeValidator";

export type ZirconGlobal = ZirconNamespace | ZirconEnum<any> | ZirconFunction<any, any>;

export type ZirconScopedGlobal = readonly [
	type: ZirconNamespace | ZirconEnum<any> | ZirconFunction<any, any>,
	groups: readonly string[],
];

export enum ExecutionAction {
	Execute,
	Skip,
}

export interface Hooks {
	BeforeExecute: (context: ZirconBeforeContext) => ExecutionAction;
	AfterExecute: (context: ZirconAfterContext) => void;
}

type MappedArray<T> = { [P in keyof T]: ReadonlyArray<T[P]> };

export interface ZirconConfiguration {
	readonly Groups: readonly ZirconGroupConfiguration[];
	/** @deprecated */
	readonly Registry: ZirconScopedGlobal[];
	readonly GroupGlobalsMap: ReadonlyMap<string, ZirconGlobal>;
	readonly Hooks: MappedArray<Hooks>;
}

export const enum ZirconDefaultGroup {
	Admin = "admin",
	User = "user",
	Creator = "creator",
}

export interface DefaultAdminGroupOptions {
	readonly GroupRank: number;
	readonly GroupId?: number;
}

export interface DefaultUserGroupOptions {
	readonly CanAccessConsole: boolean;
}

export class ZirconConfigurationBuilder {
	public configuration: Writable<ZirconConfiguration> = {
		Groups: [],
		Registry: [],
		GroupGlobalsMap: new Map(),
		Hooks: {
			BeforeExecute: [],
			AfterExecute: [],
		},
	};

	public constructor() {}

	/**
	 * Creates a group, given the specified configuration
	 * @param rank The rank. This is used for group priority
	 * @param id The id of the group to create
	 * @param configurator The configuration
	 */
	public CreateGroup(rank: number, id: string, configurator: (group: ZirconGroupBuilder) => ZirconGroupBuilder) {
		const group = new ZirconGroupBuilder(this, rank, id);
		configurator(group).Add();
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
				CanViewLogMetadata: true,
			})
			.Add();
	}

	/**
	 * Creates a default `admin` group.
	 *
	 * If this place is a group-owned place, and no arguments are provided anyone in the group
	 * with a rank equal or higher to `254` is considered an administrator.
	 *
	 * If this isn't a group game, or you want a custom rule for `admin` you need to provide a configuration callback
	 * @returns
	 */
	public CreateDefaultAdminGroup(): ZirconConfigurationBuilder;
	public CreateDefaultAdminGroup(
		builder: (group: ZirconGroupBuilder) => ZirconGroupBuilder,
	): ZirconConfigurationBuilder;
	public CreateDefaultAdminGroup(options: DefaultAdminGroupOptions): ZirconConfigurationBuilder;
	public CreateDefaultAdminGroup(
		builderOrOptions?: ((group: ZirconGroupBuilder) => ZirconGroupBuilder) | DefaultAdminGroupOptions,
	) {
		const group = new ZirconGroupBuilder(this, 254, ZirconDefaultGroup.Admin).SetPermissions({
			CanAccessFullZirconEditor: true,
			CanExecuteZirconiumScripts: true,
			CanRecieveServerLogMessages: true,
			CanViewLogMetadata: true,
		});
		if (typeIs(builderOrOptions, "function")) {
			builderOrOptions(group);
		} else {
			const { GroupRank = 254, GroupId = game.CreatorId } = builderOrOptions ?? {};

			if (game.CreatorType === Enum.CreatorType.Group || GroupId !== game.CreatorId) {
				group.BindToGroupRank(GroupId, GroupRank);
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
	public CreateDefaultUserGroup(options?: DefaultUserGroupOptions) {
		return new ZirconGroupBuilder(this, 1, ZirconDefaultGroup.User)
			.SetPermissions({
				CanAccessConsole: options?.CanAccessConsole ?? false,
			})
			.BindToEveryone()
			.Add();
	}

	/**
	 * Adds the specified namespace to Zircon
	 * @param namespace The namespace
	 * @param groups The groups this namespace is available to
	 */
	public AddNamespace(namespace: ZirconNamespace, groups: readonly string[]) {
		this.configuration.Registry = [...this.configuration.Registry, [namespace, groups]];
		return this;
	}

	/**
	 * Adds the specified enum to Zircon
	 * @param enumType The enum
	 * @param groups The groups this enum is available to
	 */
	public AddEnum<K extends string>(enumType: ZirconEnum<K>, groups: readonly string[]) {
		this.configuration.Registry = [...this.configuration.Registry, [enumType, groups]];
		return this;
	}

	/**
	 * Adds the specified function to Zircon
	 * @param functionType The function
	 * @param groups The groups this function is available to
	 */
	public AddFunction<A extends readonly ZirconValidator<any, any>[], R extends ZrValue | void = void>(
		functionType: ZirconFunction<A, R>,
		groups: readonly string[],
	) {
		this.configuration.Registry = [...this.configuration.Registry, [functionType, groups]];
		return this;
	}

	/**
	 * Adds the specified function to Zircon
	 * @param functionType The function
	 * @param groupIds The groups this function is available to
	 * @deprecated
	 */
	public AddFunctionsToGroups(functions: readonly ZirconFunction<any, any>[], groupIds: readonly string[]) {
		const registry = [...this.configuration.Registry];
		for (const func of functions) {
			registry.push([func, groupIds]);
		}

		this.configuration.Registry = registry;
		return this;
	}

	/** @internal */
	public AddHook<K extends keyof Hooks>(hookName: K, hookCallback: Hooks[K]) {
		const hooks = [...this.configuration.Hooks[hookName], hookCallback];
		this.configuration.Hooks[hookName] = hooks as MappedArray<Hooks>[K];
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

	public Build(): ZirconConfiguration {
		return this.configuration;
	}
}
