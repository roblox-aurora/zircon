import { ZirconEnum } from "./ZirconEnum";
import {
	BuiltInValidators,
	InferTypeFromValidator2,
	InferValidators,
	Validator,
	ZirconValidator,
} from "./ZirconTypeValidator";

type ArrayType<T> = T extends ReadonlyArray<infer U> ? U : never;

export function ZirconTypeUnion<V extends ReadonlyArray<Validator>>(...validators: V) {
	const result = (validators.map((v) => {
		let validator: ZirconValidator<unknown, unknown>;
		if (typeIs(v, "string")) {
			validator = BuiltInValidators[v as keyof BuiltInValidators];
		} else if (v instanceof ZirconEnum) {
			validator = v.getMemberType();
		} else {
			validator = v;
		}
		return validator;
	}) as unknown) as InferValidators<V>;
	return ZirconUnionValidator(result);
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
