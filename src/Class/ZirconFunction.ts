import { LogLevel } from "@rbxts/log";
import { RunService } from "@rbxts/services";
import ZrContext from "@rbxts/zirconium/out/Data/Context";
import { ZrValue } from "@rbxts/zirconium/out/Data/Locals";
import ZrLuauFunction, { ZrLuauArgument } from "@rbxts/zirconium/out/Data/LuauFunction";
import ZrPlayerScriptContext from "@rbxts/zirconium/out/Runtime/PlayerScriptContext";
import { $env } from "rbxts-transform-env";
import Server from "../Server";
import { ZirconFunctionBuilder } from "./ZirconFunctionBuilder";
import { InferArguments, Validator, ZirconValidator } from "./ZirconTypeValidator";

export class ZirconContext {
	constructor(private innerContext: ZrContext) {}
	public GetExecutor() {
		const executor = this.innerContext.getExecutor();
		assert(executor);
		return executor;
	}

	public GetOutput() {
		return this.innerContext.getOutput();
	}

	public GetInput() {
		return this.innerContext.getInput();
	}
}

export function emitArgumentError(
	func: ZirconFunction<any, any>,
	context: ZrContext,
	arg: number,
	validator: ZirconValidator<unknown, unknown>,
) {
	Server.Log.WriteStructured({
		SourceContext: tostring(func),
		Level: LogLevel.Error,
		Template: `Call to {FunctionName} failed - Argument#{ArgIndex} expected {ArgType}`,
		Timestamp: DateTime.now().ToIsoDate(),
		FunctionName: func.GetName(),
		CallingPlayer: context.getExecutor()!,
		ArgIndex: arg + 1,
		ArgType: validator.Type,
	});
}

export interface ZirconFunctionMetadata<V extends readonly ZirconValidator<unknown, unknown>[]> {
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
		private metadata: ZirconFunctionMetadata<V>,
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
							emitArgumentError(this, context, i, validator);

							if ($env("NODE_ENV") === "development") {
								print("Got", argument);
							}
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
							emitArgumentError(this, context, i, VariadicValidator);
							if ($env("NODE_ENV") === "development") {
								print("Got", argument);
							}
						}
						return;
					}
				}
			}

			/// This is not pretty, I know.
			return this.zirconCallback(
				new ZirconContext(context),
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

	public static args<V extends readonly Validator[]>(...value: V) {
		return value;
	}
}
