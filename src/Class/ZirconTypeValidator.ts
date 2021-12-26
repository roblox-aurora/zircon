import { ZrEnum } from "@rbxts/zirconium/out/Data/Enum";
import { ZrEnumItem } from "@rbxts/zirconium/out/Data/EnumItem";
import { ZrValue } from "@rbxts/zirconium/out/Data/Locals";
import ZrObject from "@rbxts/zirconium/out/Data/Object";
import ZrUndefined from "@rbxts/zirconium/out/Data/Undefined";
import { ZrInstanceUserdata } from "@rbxts/zirconium/out/Data/Userdata";
import { ZirconEnum, ZirconEnumValidator } from "./ZirconEnum";
import { ZirconEnumItem } from "./ZirconEnumItem";
import {
	OptionalZirconFuzzyPlayer,
	ZirconFuzzyPlayer,
	ZirconFuzzyPlayerValidator,
} from "./Validators/ZirconFuzzyPlayerValidator";
import { ZirconFuzzyPlayers } from "./Validators/ZirconFuzzyPlayersValidator";
import ZrRange from "@rbxts/zirconium/out/Data/Range";
import { ZirconFunction } from "./ZirconFunction";

type PickFrom<T, U> = U extends never ? T : U;
export interface ZirconValidator<T, U = never> {
	/**
	 * The type label
	 */
	readonly Type: string;
	/**
	 * The validator
	 */
	Validate(value: unknown, player?: Player): value is T;
	Transform?(value: T, player?: Player): U;
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

export const NativeEnum: ZirconValidator<ZrEnum> = {
	Type: "ZrEnum",
	Validate(value: unknown): value is ZrEnum {
		return value instanceof ZrEnum;
	},
};

export const NativeEnumItem: ZirconValidator<ZrEnumItem> = {
	Type: "ZrEnumItem",
	Validate(value: unknown): value is ZrEnumItem {
		return value instanceof ZrEnumItem;
	},
};

export function ZirconOptional<K extends ZirconValidator<ZrValue, unknown>>(validator: K) {
	return {
		Type: validator.Type + "?",
		Validate(value: unknown, player?: Player): value is InferTypeFromValidator2<K> | undefined {
			return validator.Validate(value, player) || value === undefined;
		},
		Transform(value: unknown, player?: Player) {
			if (validator.Validate(value, player)) {
				if (validator.Transform !== undefined) {
					return (validator.Transform(value, player) ?? undefined) as InferTypeFromValidator2<K> | undefined;
				} else {
					return value as InferTypeFromValidator2<K> | undefined;
				}
			} else {
				return undefined;
			}
		},
	};
}

export const ZirconUnknown: ZirconValidator<ZrValue | ZrUndefined> = {
	Type: "unknown",
	Validate(value: unknown): value is ZrValue | ZrUndefined {
		return true;
	},
};

export const ZirconDefined: ZirconValidator<ZrValue> = {
	Type: "defined",
	Validate(value: unknown): value is ZrValue {
		return value !== ZrUndefined && value !== undefined;
	},
};

export const ZirconRange: ZirconValidator<ZrRange | number, ZrRange> = {
	Type: "ZrRange | number",
	Validate(value: unknown): value is ZrRange | number {
		return (typeIs(value, "number") && value % 1 === 0) || value instanceof ZrRange;
	},
	Transform(value: ZrRange | number) {
		if (typeIs(value, "number")) {
			return new ZrRange(new NumberRange(value));
		} else {
			return value;
		}
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
	defined: ZirconDefined,
	["object?"]: ZirconOptional(ZirconObject),
	player: ZirconFuzzyPlayer,
	players: ZirconFuzzyPlayers,
	["player?"]: ZirconOptional(ZirconFuzzyPlayer),
	["players?"]: ZirconOptional(ZirconFuzzyPlayers),
	["string?"]: ZirconOptional(ZirconString),
	["number?"]: ZirconOptional(ZirconNumber),
	["boolean?"]: ZirconOptional(ZirconBoolean),
	["unknown"]: ZirconUnknown,
	/** @internal */
	["ZrEnum"]: NativeEnum,
	/** @internal */
	["ZrEnumItem"]: NativeEnumItem,
	["range"]: ZirconRange,
	["range?"]: ZirconOptional(ZirconRange),
};
export type BuiltInValidators = typeof BuiltInValidators;

export type Validator = keyof typeof BuiltInValidators | ZirconValidator<any, any> | ZirconEnum<any>;

export type InferValidators<T extends ReadonlyArray<Validator>> = {
	readonly [P in keyof T]: T[P] extends Validator ? InferValidator<T[P]> : never;
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
			readonly [P in keyof T]: T[P] extends ZirconValidator<any, any> ? InferTypeFromValidator2<T[P]> : never;
	  };

export type InferValidator<T extends Validator> = T extends keyof BuiltInValidators
	? BuiltInValidators[T]
	: T extends ZirconEnum<infer K>
	? ZirconEnumValidator<K>
	: T;
export type InferTypeFromValidator<T extends Validator> = T extends keyof BuiltInValidators
	? InferTypeFromValidator<BuiltInValidators[T] & Validator>
	: T extends ZirconValidator<infer A, never>
	? A
	: T extends ZirconValidator<infer _, infer U>
	? U
	: T extends ZirconEnum<infer K>
	? ZirconEnumValidator<K>
	: never;

export type InferTypeFromValidator2<T extends ZirconValidator<any, any>> = T extends ZirconValidator<infer A, never>
	? A
	: T extends ZirconValidator<infer _, infer U>
	? U
	: never;

export type ValidatorArgument = { type: Validator };
