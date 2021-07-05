import { StatefulZirconValidator } from "./StatefulZirconValidator";
import { InferTypeFromValidator2, ZirconValidator } from "./ZirconTypeValidator";

export class OptionalValidator<T, U = T> extends StatefulZirconValidator<T | undefined, U | undefined> {
	public constructor(private innerValidator: ZirconValidator<T, U>) {
		super(innerValidator.Type + "?");
	}

	public Validate(value: unknown): value is T | undefined {
		return this.innerValidator.Validate(value) || value === undefined;
	}

	public Transform(value: T): U | undefined {
		return this.innerValidator.Transform?.(value);
	}
}
