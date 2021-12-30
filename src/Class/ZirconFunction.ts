import { LogLevel } from "@rbxts/log";
import { RunService } from "@rbxts/services";
import ZrContext from "@rbxts/zirconium/out/Data/Context";
import { ZrValue } from "@rbxts/zirconium/out/Data/Locals";
import ZrLuauFunction, { ZrLuauArgument } from "@rbxts/zirconium/out/Data/LuauFunction";
import ZrPlayerScriptContext from "@rbxts/zirconium/out/Runtime/PlayerScriptContext";
import { $env } from "rbxts-transform-env";
import Server from "../Server";
import { InferArguments, ZirconValidator } from "./ZirconTypeValidator";
import { ZirconContext } from "./ZirconContext";
import ZrUndefined from "@rbxts/zirconium/out/Data/Undefined";
import { $print } from "rbxts-transform-debug";

let zirconTypeOf: typeof import("Shared/typeId")["zirconTypeOf"] | undefined;

export function emitArgumentError(
	func: ZirconFunction<any, any>,
	context: ZrContext,
	arg: ZrValue | ZrUndefined,
	index: number,
	validator: ZirconValidator<unknown, unknown>,
) {
	const err = typeIs(validator.ErrorMessage, "function")
		? validator.ErrorMessage(arg, index, func)
		: validator.ErrorMessage;

	// Have to dynamically import
	if (zirconTypeOf === undefined) {
		zirconTypeOf = import("Shared/typeId").expect().zirconTypeOf;
	}

	Server.Log.WriteStructured({
		SourceContext: `(function '${func.GetName()}')`,
		Level: LogLevel.Error,
		Template: `Argument #{ArgIndex} to '{FunctionName}': ${err ?? "Expected {ValidatorType}, got {ArgType}"}`,
		Timestamp: DateTime.now().ToIsoDate(),
		FunctionName: func.GetName(),
		FunctionArgs: func.GetArgumentTypes(),
		FunctionVariadicArg: func.GetVariadicType(),
		LogToPlayer: context.getExecutor(),
		ArgIndex: index + 1,
		ValidatorType: validator.Type,
		ArgType: zirconTypeOf(arg),
	});
}

export interface ZirconFunctionMetadata {
	readonly Description?: string;
	readonly ArgumentValidators: ZirconValidator<unknown, unknown>[];
	readonly VariadicValidator?: ZirconValidator<unknown, unknown>;
	readonly HasVaradic: boolean;
}
export class ZirconFunction<
	V extends readonly ZirconValidator<unknown, unknown>[],
	R extends ZrValue | void
> extends ZrLuauFunction {
	public constructor(
		private name: string,
		private zirconCallback: (context: ZirconContext, ...args: InferArguments<V>) => R,
		private metadata: ZirconFunctionMetadata,
	) {
		const { VariadicValidator, ArgumentValidators } = metadata;
		super((context, ...args) => {
			// We'll need to type check all the arguments to ensure they're valid
			// and transform as appropriate for the user side

			const executor = context.getExecutor();

			let transformedArguments = new Array<defined>();
			if (ArgumentValidators.size() > 0) {
				for (let i = 0; i < ArgumentValidators.size(); i++) {
					const validator = ArgumentValidators[i];
					const argument = args[i];
					if (validator && validator.Validate(argument, executor)) {
						if (validator.Transform !== undefined) {
							transformedArguments[i] = validator.Transform(argument, executor) as defined;
						} else {
							transformedArguments[i] = argument;
						}
					} else {
						if (RunService.IsServer()) {
							emitArgumentError(this, context, argument, i, validator);
							$print("Got", argument);
						}
						return;
					}
				}
			} else if (!VariadicValidator) {
				transformedArguments = args as Array<ZrLuauArgument>;
			}

			if (args.size() > ArgumentValidators.size() && VariadicValidator) {
				for (let i = ArgumentValidators.size(); i < args.size(); i++) {
					const argument = args[i];
					if (VariadicValidator.Validate(argument, executor)) {
						if (VariadicValidator.Transform !== undefined) {
							transformedArguments[i] = VariadicValidator.Transform(argument, executor) as defined;
						} else {
							transformedArguments[i] = argument;
						}
					} else {
						if (RunService.IsServer()) {
							emitArgumentError(this, context, argument, i, VariadicValidator);
							$print("Got", argument);
						}
						return;
					}
				}
			}

			/// This is not pretty, I know.
			return this.zirconCallback(
				new ZirconContext(context, this),
				...((transformedArguments as unknown) as InferArguments<V>),
			);
		});
	}

	public GetName() {
		return this.name;
	}

	public GetArgumentTypes() {
		const { ArgumentValidators } = this.metadata;
		const args = ArgumentValidators.map((v) => v.Type);
		return args;
	}

	public GetVariadicType() {
		const { VariadicValidator } = this.metadata;
		return VariadicValidator?.Type;
	}

	/** @internal */
	public RegisterToContext(context: ZrPlayerScriptContext) {
		context.registerGlobal(this.name, this);
	}

	public GetDescription() {
		return this.metadata.Description;
	}

	public toString() {
		const argTypes = this.GetArgumentTypes().map((typeName, argIndex) => `${typeName}`);
		const varadicType = this.GetVariadicType();
		if (varadicType !== undefined) {
			argTypes.push("..." + varadicType);
		}

		return (
			`${this.metadata.Description !== undefined ? `/* ${this.metadata.Description} */` : ""} function ${
				this.name
			}(` +
			argTypes.join(", ") +
			") { [ZirconFunction] }"
		);
	}
}
