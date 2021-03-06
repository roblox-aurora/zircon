import { ZrValue } from "@rbxts/zirconium/out/Data/Locals";
import ZrObject from "@rbxts/zirconium/out/Data/Object";
import ZrUndefined from "@rbxts/zirconium/out/Data/Undefined";
import { ZrInstanceUserdata } from "@rbxts/zirconium/out/Data/Userdata";
import { OptionalZirconFuzzyPlayer, ZirconFuzzyPlayer, ZirconFuzzyPlayerValidator } from "./ZirconFuzzyPlayerValidator";

type PickFrom<T, U> = U extends never ? T : U;
export interface ZirconValidator<T, U = never> {
	/**
	 * The type label
	 */
	readonly Type: string;
	/**
	 * The validator
	 */
	Validate(value: unknown): value is T;
	Transform?(value: T): U;
}

export interface ZirconArgument<T extends Validator> {
	Type: T;
	Label?: string;
	Optional?: boolean;
}

export type InferValidatorFromArgument<T extends ZirconArgument<any>> = T["Type"] extends Validator
	? InferValidator<T["Type"]>
	: never;

type test = InferValidatorFromArgument<{ Type: typeof ZirconFuzzyPlayer }>;

export const ZirconString: ZirconValidator<string> = {
	Type: "string",
	Validate(value): value is string {
		return typeIs(value, "string");
	},
};

export const ZirconNumber: ZirconValidator<number> = {
	Type: "number",
	Validate(value): value is number {
		return typeIs(value, "number");
	},
};

export const ZirconBoolean: ZirconValidator<boolean> = {
	Type: "boolean",
	Validate(value): value is boolean {
		return typeIs(value, "number");
	},
};

export const ZirconObject: ZirconValidator<ZrObject> = {
	Type: "object",
	Validate(value): value is ZrObject {
		return value instanceof ZrObject;
	},
};

export function ZirconOptional<K extends ZirconValidator<unknown, unknown>>(validator: K) {
	return {
		Type: validator.Type + "?",
		Validate(value: unknown): value is InferTypeFromValidator2<K> | undefined {
			return validator.Validate(value) || value === undefined;
		},
		Transform(value: unknown) {
			if (validator.Validate(value)) {
				if (validator.Transform !== undefined) {
					return (validator.Transform(value) ?? undefined) as InferTypeFromValidator2<K> | undefined;
				} else {
					return value as InferTypeFromValidator2<K> | undefined;
				}
			} else {
				return undefined;
			}
		},
	};
}

export const ZirconUnknown: ZirconValidator<ZrValue> = {
	Type: "unknown",
	Validate(value: unknown): value is ZrValue {
		return true;
	},
};

export function ZirconInstanceIsA<K extends keyof Instances>(typeName: K) {
	return identity<ZirconValidator<ZrInstanceUserdata, Instances[K]>>({
		Type: `RBX${typeName}`,
		Validate(value: unknown): value is ZrInstanceUserdata<Instances[K]> {
			return value instanceof ZrInstanceUserdata && value.isA(typeName);
		},
		Transform(value) {
			return value.value() as Instances[K];
		},
	});
}

export const ZirconPlayer = ZirconInstanceIsA("Player");

export const BuiltInValidators = {
	string: ZirconString,
	number: ZirconNumber,
	boolean: ZirconBoolean,
	object: ZirconObject,
	["object?"]: ZirconOptional(ZirconObject),
	player: ZirconFuzzyPlayer,
	["player?"]: ZirconOptional(ZirconFuzzyPlayer),
	["string?"]: ZirconOptional(ZirconString),
	["number?"]: ZirconOptional(ZirconNumber),
	["boolean?"]: ZirconOptional(ZirconBoolean),
	["unknown"]: ZirconUnknown,
};
export type BuiltInValidators = typeof BuiltInValidators;

export type Validator = keyof typeof BuiltInValidators | ZirconValidator<any, any>;

export type InferValidators<T extends ReadonlyArray<Validator>> = {
	readonly // eslint-disable-next-line @typescript-eslint/ban-ts-comment
	/** @ts-ignore Because otherwise we can't get this working. */
	[P in keyof T]: InferValidator<T[P]>;
};

// export type InferArguments<T extends ReadonlyArray<Validator>> = {
// 	readonly [P in keyof T]: InferTypeFromValidator<T[P]>;
// } & { length: T["length"] };

export type ExtractValidators<T extends readonly Validator[]> = {
	[P in keyof T]: T[P] extends keyof BuiltInValidators ? BuiltInValidators[T[P] & string] : T[P];
};

export type IWantToStabMyselfWithAFuckingFork<T> = T extends keyof BuiltInValidators ? BuiltInValidators[T] : T;

export type InferArguments<T extends readonly ZirconValidator<any, any>[]> = T extends []
	? [...(readonly (ZrValue | ZrUndefined)[])]
	: {
			readonly // eslint-disable-next-line @typescript-eslint/ban-ts-comment
			/** @ts-ignore */
			[P in keyof T]: InferTypeFromValidator2<T[P]>;
	  };

export type InferValidator<T extends Validator> = T extends keyof BuiltInValidators ? BuiltInValidators[T] : T;
export type InferTypeFromValidator<T extends Validator> = T extends keyof BuiltInValidators
	? InferTypeFromValidator<BuiltInValidators[T] & Validator>
	: T extends ZirconValidator<infer A, never>
	? A
	: T extends ZirconValidator<infer _, infer U>
	? U
	: never;

export type InferTypeFromValidator2<T extends ZirconValidator<any, any>> = T extends ZirconValidator<infer A, never>
	? A
	: T extends ZirconValidator<infer _, infer U>
	? U
	: never;

export type ValidatorArgument = { type: Validator };
