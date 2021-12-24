import { NamespaceBuilder } from "@rbxts/net/out/definitions/NamespaceBuilder";
import ZirconFunction, { ZrTypeCheck } from "Server/Class/ZirconFunction";
import { ZirconPermissions } from "Server/Class/ZirconGroup";
import { ZirconEnum } from "./ZirconEnum";
import { ZirconGroupBuilder, ZirconGroupConfiguration } from "./ZirconGroupBuilder";
import { ZirconNamespace } from "./ZirconNamespace";
import { ZirconNamespaceBuilder } from "./ZirconNamespaceBuilder";

export interface ZirconConfiguration {
	readonly Groups: readonly ZirconGroupConfiguration[];
	readonly Registry: readonly [
		type: ZirconNamespace | ZirconEnum<any> | ZirconFunction<any>,
		groups: readonly string[],
	][];
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
		return new ZirconGroupBuilder(this, 255, "creator")
			.BindToCreator()
			.SetPermissions({
				CanAccessFullZirconEditor: true,
				CanExecuteZirconiumScripts: true,
				CanRecieveServerLogMessages: true,
			})
			.Add();
	}

	/**
	 * Creates a default `user` group, this refers to _anyone_ and shouldn't be used for more sensitive things.
	 * @returns
	 */
	public CreateDefaultUserGroup() {
		return new ZirconGroupBuilder(this, 1, "user").BindToEveryone().Add();
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

	/** @internal */
	public Build(): ZirconConfiguration {
		return this.configuration;
	}
}
