import ZrContext from "@rbxts/zirconium/out/Data/Context";
import { ZrValue } from "@rbxts/zirconium/out/Data/Locals";

// export interface CommandDeclaration<O extends CommandOptions, A extends ReadonlyArray<CommandArgument>, R> {
// 	command: string;
// 	options: O;
// 	groups: GroupType[];
// 	args: A;
// 	execute?: (this: void, context: CommandContext<O>, args: ExecutionArgs<O, A>) => R;
// 	children?: readonly Command<any, any, any>[];
// }

// export interface ExecutionArgs<K extends CommandOptions, A extends readonly CommandArgument[]> {
// 	Options: MappedOptions<K> & { stdin?: defined };
// 	Arguments: MappedOptionsReadonly<A>;
// }

// interface CommandArgumentType<T> {
// 	type: T;
// 	alias?: string[];
// }

// type ZrTypeCheck<T extends ZrValue = ZrValue> = (value: ZrValue) => value is T;
// type InferZrArgs<T> = { [P in keyof T]: InferZrTypes<T[P]> };
// type InferZrTypes<T> = T extends ZrTypeCheck<infer R> ? R : never;
// type CommandArgument = CommandArgumentType<"string">;

// interface FunctionDeclaration<A extends readonly CommandArgument[]> {
// 	Groups: string[];
// 	Arguments: A;
// 	Execute: (ctx: ZrContext, ...args: InferZrArgs<A>) => void;
// }

// type DeclarationLike = FunctionDeclaration<any>;
// type RemoteDeclarations = Record<string, DeclarationLike>;

// type test = InferZrArgs<[ZrTypeCheck<string>]>;

namespace ZrSO4Definitions {
	const dud = 1;
	// export function Create<T extends RemoteDeclarations>(definitions: T) {}
	// export function Function<T extends FunctionDeclaration<A>, A extends readonly ZrTypeCheck[]>(definition: T) {}
}
export = ZrSO4Definitions;
