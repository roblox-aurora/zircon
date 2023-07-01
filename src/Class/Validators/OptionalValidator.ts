import ZrUndefined from "@rbxts/zirconium/out/Data/Undefined";
import { StatefulZirconValidator } from "../StatefulZirconValidator";
import { InferTypeFromValidator2, ZirconValidator } from "../ZirconTypeValidator";

export class OptionalValidator<T, U = T> extends StatefulZirconValidator<T | ZrUndefined, U | undefined> {
	public constructor(private innerValidator: ZirconValidator<T, U>) {
		super(innerValidator.Type + "?");
	}

	public Validate(value: unknown): value is T | ZrUndefined {
		return this.innerValidator.Validate(value) || value === ZrUndefined;
	}

	public Transform(value: T): U | undefined {
		return value !== ZrUndefined ? this.innerValidator.Transform?.(value) : undefined;
	}
}
