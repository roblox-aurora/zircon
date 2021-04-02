import t from "@rbxts/t";

interface ValidationSuccessResult {
	success: true;
}
interface ValidationFailResult {
	success: false;
	reason: string;
}

export type ValidationResult = ValidationSuccessResult | ValidationFailResult;

export interface CustomCommandType<T = string, R = T> {
	displayName?: string;

	/**
	 *
	 * @param value The string representation
	 * @returns The transformed representation
	 */
	transform?(value: string, executor: Player): T;

	validate?(value: T, executor: Player): ValidationResult;

	parse(value: T): R;
}

export const enum CommandType {
	String = "string",
	Number = "number",
	Boolean = "boolean",
	Switch = "switch",
}

interface CommandArgumentType<T> {
	type: T;
	alias?: string[];
}

interface StringCommandArgument extends CommandArgumentType<"string"> {
	default?: string;
}

interface NumberCommandArgument extends CommandArgumentType<"number"> {
	default?: number;
}

interface BooleanCommandArgument extends CommandArgumentType<"boolean"> {
	default?: boolean;
}

interface SwitchCommandArgument extends CommandArgumentType<"switch"> {
	default?: never;
}

export interface CustomTypeArgument<T, U> extends CommandArgumentType<CustomCommandType<T, U>> {
	required?: boolean;
	default?: defined;
}

interface UnionType<T extends readonly CommandArgumentTypeId[]> {
	type: T;
	default?: InferTypeWithUnion<T>;
	alias?: string[];
}

type _CommandArgument =
	| StringCommandArgument
	| BooleanCommandArgument
	| NumberCommandArgument
	| (CommandArgumentType<"player"> & { default?: Player })
	| CustomTypeArgument<defined, defined>;

export type CommandArgument = (_CommandArgument | UnionType<readonly CommandArgumentTypeId[]>) & {
	variadic?: true;
};

export type CommandArgumentTypeId = _CommandArgument["type"];

export type CommandOptionArgument = CommandArgument | SwitchCommandArgument;

export type CommandOptions = Record<string, CommandOptionArgument>;

// const _isCmdTypeDefinition = t.interface({
// 	parse: t.callback,
// 	transform: t.optional(t.callback),
// 	validate: t.optional(t.callback),
// 	displayName: t.optional(t.string),
// });

// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// export function isCmdTypeDefinition(value: unknown): value is CustomCommandType<any, any> {
// 	return _isCmdTypeDefinition(value);
// }

type InferTypeName<T> = T extends "string"
	? string
	: T extends "number"
	? number
	: T extends "boolean"
	? boolean
	: T extends "player"
	? Player
	: T extends CustomCommandType<infer _, infer R>
	? R
	: never;

type GetResultingType<T, U> = U extends { default: T } ? T : U extends { required: true } ? T : T | undefined;
type InferType<T> = T extends { type: CommandType.String | "string" }
	? GetResultingType<string, T>
	: T extends { type: CommandType.Number | "number" }
	? GetResultingType<number, T>
	: T extends { type: CommandType.Switch | "switch" }
	? boolean
	: T extends { type: CommandType.Boolean | "boolean" }
	? GetResultingType<boolean, T>
	: T extends { type: "player" }
	? GetResultingType<Player, T>
	: T extends { type: "players" }
	? GetResultingType<Player[], T>
	: T extends { type: CustomCommandType<infer _, infer A> }
	? GetResultingType<A, T>
	: unknown;

type InferTypeWithUnion<T> = T extends { type: readonly CommandArgumentTypeId[] }
	? InferTypeName<T["type"][number]> | undefined
	: InferType<T>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DropFirstInTuple<T extends readonly defined[]> = ((...args: T) => any) extends (
	arg: any,
	...rest: infer U
) => any
	? U
	: T;
export type LastInTuple<T extends readonly defined[]> = T[LengthOfTuple<DropFirstInTuple<T>>];
type LengthOfTuple<T extends readonly defined[]> = T extends { length: infer L } ? L : -1;

type ArgTypes<T> = { readonly [P in keyof T]: InferTypeWithUnion<T[P]> };

// once 4.0 is out.
// type WithVariadic<T extends Array<unknown> = Array<unknown>> = [
// 	...ArgTypes<T>,
// 	...InferTypeWithUnion<LastInTuple<T>>[]
// ];
type WithVariadic<T extends ReadonlyArray<defined>> = ArgTypes<T> & [...InferTypeWithUnion<LastInTuple<T>>[]];
type HasVariadic<T extends readonly defined[]> = LastInTuple<T> extends { variadic: true } ? true : false;

export type MappedOptionsReadonly<T extends ReadonlyArray<defined>> = T extends never[]
	? unknown[]
	: HasVariadic<T> extends true
	? WithVariadic<T>
	: ArgTypes<T>;

export type MappedOptions<T> = { [P in keyof T]: InferTypeWithUnion<T[P]> };
export type MappedArgs<T> = T extends [infer A]
	? [InferType<A>]
	: T extends [infer A, infer B]
	? [InferType<A>, InferType<B>]
	: unknown;

export type ExecutionOptions = {
	variables: Record<string, defined>;
	mappedOptions: Map<string, defined>;
	args: Array<defined>;
	executor: Player;
	stdin: string[];
	stdout: string[];
	piped: boolean;
};

export interface ExecuteBinaryExpressionResult {
	result: defined;
	stdout: string[];
}
