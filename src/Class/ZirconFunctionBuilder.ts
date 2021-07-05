import {
	BuiltInValidators,
	InferArguments,
	InferValidator,
	InferValidators,
	Validator,
	ZirconArgument,
	ZirconValidator,
} from "./ZirconTypeValidator";
import { ZirconContext, ZirconFunction } from "./ZirconFunction";

export class ZirconFunctionBuilder<V extends ZirconValidator<any, any>[] = []> {
	private validators = new Array<ZirconValidator<any, any>>();
	private hasVaradic = false;
	public constructor(private name: string) {}

	/**
	 * Adds these arguments to this function
	 * @param args The arguments
	 * @returns
	 */
	public AddArguments<TValidation extends Validator[]>(...args: TValidation) {
		if (this.hasVaradic) {
			throw `Cannot add argument past varadic argument`;
		}

		for (const argValidator of args) {
			if (typeIs(argValidator, "string")) {
				this.validators.push(BuiltInValidators[argValidator]);
			} else {
				this.validators.push(argValidator);
			}
		}
		return (this as unknown) as ZirconFunctionBuilder<[...V, ...InferValidators<TValidation>]>;
	}

	/** @internal */
	public AddVaradicArgument<TValidation extends Validator>(arg: TValidation) {
		this.hasVaradic = true;

		return (this as unknown) as Omit<
			ZirconFunctionBuilder<[...V, ...InferValidator<TValidation>[]]>,
			"AddArguments" | "AddVaradicArgument"
		>;
	}

	public Bind(fn: (context: ZirconContext, ...args: InferArguments<V>) => void) {
		return new ZirconFunction(this.name, this.validators as V, fn);
	}
}
