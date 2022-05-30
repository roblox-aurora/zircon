import { LogLevel } from "@rbxts/log";
import { NamespaceBuilder } from "@rbxts/net/out/definitions/NamespaceBuilder";
import { ZrValue } from "@rbxts/zirconium/out/Data/Locals";
import ZirconServer from "Server";
import { ZrTypeCheck } from "Server/Class/ZirconFunction";
import { ZirconPermissions } from "Server/Class/ZirconGroup";
import { ZirconEnum } from "./ZirconEnum";
import { ZirconFunction } from "./ZirconFunction";
import { ZirconGroupBuilder, ZirconGroupConfiguration } from "./ZirconGroupBuilder";
import { ZirconNamespace } from "./ZirconNamespace";
import { ZirconNamespaceBuilder } from "./ZirconNamespaceBuilder";
import { ZirconValidator } from "./ZirconTypeValidator";

export type ZirconClientScopedGlobal = ZirconNamespace | ZirconEnum<any> | ZirconFunction<any, any>;

export interface ZirconClientConfiguration {
	readonly Groups: readonly ZirconGroupConfiguration[];
	readonly Registry: ZirconClientScopedGlobal[];
}

export interface DefaultAdminGroupOptions {
	readonly GroupRank: number;
	readonly GroupId?: number;
}

export interface DefaultUserGroupOptions {
	readonly CanAccessConsole: boolean;
}

export class ZirconClientConfigurationBuilder {
	public configuration: Writable<ZirconClientConfiguration> = {
		Groups: [],
		Registry: [],
	};

	public constructor() {}

	/**
	 * Adds the specified function to Zircon
	 *
	 * Note: This function is available to all users who can access this console, therefore is considered insecure.
	 *
	 * Do not use it for anything important. Important stuff should be a server function
	 * @param functionType The function
	 */
	public AddFunction<A extends readonly ZirconValidator<unknown, unknown>[], R extends void | ZrValue>(
		functionType: ZirconFunction<A, R>,
	) {
		this.configuration.Registry = [...this.configuration.Registry, functionType];
		return this;
	}

	public Build(): ZirconClientConfiguration {
		return this.configuration;
	}
}
