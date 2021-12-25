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
import { ZrValue } from "@rbxts/zirconium/out/Data/Locals";
import { ZirconEnum } from "./ZirconEnum";

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
			validator = argValidator.GetMemberType();
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
	public AddArgument<TValidation extends Validator>(argValidator: TValidation, description?: string) {
		const validator = this.GetValidator(argValidator);
		this.validators.push(validator);
		return (this as unknown) as ZirconFunctionBuilder<[...V, InferValidator<TValidation>]>;
	}

	public AddVariadicArgument<TValidation extends Validator>(arg: TValidation) {
		this.hasVaradic = true;
		this.varadicValidator = this.GetValidator(arg);

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
