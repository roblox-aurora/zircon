import { t } from "@rbxts/t";
import { ZirconEnum } from "./ZirconEnum";
import {
	BuiltInValidators,
	InferTypeFromValidator2,
	InferValidator,
	InferValidators,
	Validator,
	ZirconValidator,
} from "./ZirconTypeValidator";
const isArray = t.array(t.any);
type ArrayType<T> = T extends ReadonlyArray<infer U> ? U : never;

export function ZirconGetValidatorType<V extends Validator>(validatorLike: V) {
	let validator: ZirconValidator<unknown, unknown>;
	if (typeIs(validatorLike, "string")) {
		validator = BuiltInValidators[validatorLike as keyof BuiltInValidators];
	} else if (validatorLike instanceof ZirconEnum) {
		validator = validatorLike.getValidator();
	} else {
		validator = validatorLike;
	}
	return validator;
}

export function ZirconTypeUnion<V extends ReadonlyArray<Validator>>(...validators: V) {
	const result = (validators.map(ZirconGetValidatorType) as unknown) as InferValidators<V>;
	return ZirconUnionValidator(result);
}

export function ZirconArrayType<T extends Validator>(validator: T) {
	const arrayType = ZirconGetValidatorType(validator);
	return identity<ZirconValidator<InferTypeFromValidator2<InferValidator<T>>[]>>({
		Type: arrayType.Type + "[]",
		Validate(value, player): value is InferTypeFromValidator2<InferValidator<T>>[] {
			return isArray(value) && value.every((value) => arrayType.Validate(value, player));
		},
	});
}

export interface ZirconUnionValidator<T extends ReadonlyArray<unknown>, U extends ReadonlyArray<unknown>>
	extends ZirconValidator<T[number], U[number]> {}
export function ZirconUnionValidator<T extends ReadonlyArray<ZirconValidator<any, any>>>(validators: T) {
	return {
		Type: validators.map((v) => v.Type).join(" | "),
		Validate(value: unknown, player?: Player): value is ArrayType<T> {
			return validators.some((v) => v.Validate(value, player));
		},
		Transform(value: unknown, player?: Player): ArrayType<T> {
			for (const validator of validators) {
				if (validator.Validate(value)) {
					if (validator.Transform !== undefined) {
						return validator.Transform(value, player);
					} else {
						return value;
					}
				}
			}

			return undefined!;
		},
	} as ZirconValidator<InferTypeFromValidator2<ArrayType<T>>>;
}
