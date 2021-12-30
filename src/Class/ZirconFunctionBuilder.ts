import { BuiltInValidators, InferArguments, InferValidator, Validator, ZirconValidator } from "./ZirconTypeValidator";
import { ZirconFunction } from "./ZirconFunction";
import { ZirconContext } from "./ZirconContext";
import { ZrValue } from "@rbxts/zirconium/out/Data/Locals";
import { ZirconEnum } from "./ZirconEnum";
import { ZirconTypeUnion } from "./TypeUtilities";
import t from "@rbxts/t";
const isArray = t.array(t.any);

export class ZirconFunctionBuilder<V extends ZirconValidator<unknown, unknown>[] = []> {
	private validators = new Array<ZirconValidator<unknown, unknown>>();
	private varadicValidator?: ZirconValidator<unknown, unknown>;
	private hasVaradic = false;
	private description?: string;

	public constructor(private name: string) {}

	private GetValidator<TValidation extends Validator>(argValidator: TValidation) {
		let validator: ZirconValidator<unknown, unknown>;
		if (typeIs(argValidator, "string")) {
			validator = BuiltInValidators[argValidator as keyof BuiltInValidators];
		} else if (argValidator instanceof ZirconEnum) {
			validator = argValidator.getMemberType();
		} else {
			validator = argValidator;
		}
		return validator;
	}

	/**
	 * Adds an argnument to this zircon function
	 * @param argValidator The argument type/validator
	 * @param description The description for this argument
	 * @returns The builder
	 */
	public AddArgument<TValidation extends Validator>(argValidator: TValidation | TValidation[], description?: string) {
		let validator: ZirconValidator<any, any>;
		if (isArray(argValidator)) {
			validator = this.GetValidator(ZirconTypeUnion(...argValidator));
		} else {
			validator = this.GetValidator(argValidator);
		}

		this.validators.push(validator);
		return (this as unknown) as ZirconFunctionBuilder<[...V, InferValidator<TValidation>]>;
	}

	/**
	 * Adds a varadic argument to this zircon function
	 * @param arg
	 * @returns
	 */
	public AddVariadicArgument<TValidation extends Validator>(arg: TValidation | TValidation[]) {
		this.hasVaradic = true;

		let validator: ZirconValidator<any, any>;
		if (isArray(arg)) {
			validator = this.GetValidator(ZirconTypeUnion(...arg));
		} else {
			validator = this.GetValidator(arg);
		}
		this.varadicValidator = validator;

		return (this as unknown) as Omit<
			ZirconFunctionBuilder<[...V, ...InferValidator<TValidation>[]]>,
			"AddVariadicArgument" | "AddArgument"
		>;
	}

	/**
	 * Adds a description to the function
	 * @param description The description of this function
	 * @returns
	 */
	public AddDescription(description: string) {
		this.description = description;
		return this as Omit<this, "AddDescription">;
	}

	public Bind<R extends ZrValue | void>(fn: (context: ZirconContext, ...args: InferArguments<V>) => R) {
		return new ZirconFunction(this.name, fn, {
			Description: this.description,
			HasVaradic: this.hasVaradic,
			VariadicValidator: this.varadicValidator,
			ArgumentValidators: this.validators,
		});
	}
}
