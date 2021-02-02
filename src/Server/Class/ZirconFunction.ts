import ZrContext from "@rbxts/zirconium/out/Data/Context";
import { ZrValue } from "@rbxts/zirconium/out/Data/Locals";
import ZrLuauFunction from "@rbxts/zirconium/out/Data/LuauFunction";
import ZrObject from "@rbxts/zirconium/out/Data/Object";
import { CommandArgument, MappedOptionsReadonly } from "../../Types";

// export interface ExecutionArgs<K extends CommandOptions, A extends readonly CommandArgument[]> {
// 	Options: MappedOptions<K> & { stdin?: defined };
// 	Arguments: MappedOptionsReadonly<A>;
// }

type ZrTypeCheck = (value: ZrValue) => value is ZrValue;
type ZrInferValue<T> = T extends (value: unknown) => value is infer A ? A : never;
type InferArguments<T> = { readonly [P in keyof T]: ZrInferValue<T[P]> };

export interface CommandDeclaration<A extends ReadonlyArray<ZrTypeCheck>, R> {
	Groups: string[];
	Arguments: A;
	Execute: (this: void, context: ZrContext, ...args: InferArguments<A>) => R;
}

export default class ZirconFunction<A extends readonly ZrTypeCheck[], R = unknown> extends ZrLuauFunction {
	private constructor(declaration: CommandDeclaration<A, R>) {
		super((ctx, ...args) => {
			for (let i = 0; i < args.size(); i++) {
				const argCheck = declaration.Arguments[i];
				if (!argCheck(args[i])) {
					return false;
				}
			}
			declaration.Execute(ctx, ...(args as InferArguments<A>));
		});
	}

	public static create<A extends ReadonlyArray<ZrTypeCheck>, R>(declaration: CommandDeclaration<A, R>) {
		return new ZirconFunction<A, R>(declaration);
	}

	public static readonly string = (value: unknown): value is string => {
		return typeIs(value, "string");
	};

	public static readonly number = (value: unknown): value is number => {
		return typeIs(value, "number");
	};

	public static readonly boolean = (value: unknown): value is boolean => {
		return typeIs(value, "number");
	};

	public static readonly array = (value: unknown): value is ZrValue[] => {
		return typeIs(value, "table");
	};

	public static readonly object = (value: unknown): value is ZrObject => {
		return value instanceof ZrObject;
	};
}

ZirconFunction.create({
	Groups: [],
	Arguments: [ZirconFunction.string, ZirconFunction.number] as const,
	Execute(ctx, arg0) {},
});
