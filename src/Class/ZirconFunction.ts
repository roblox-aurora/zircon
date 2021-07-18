import { LogLevel } from "@rbxts/log";
import { RunService } from "@rbxts/services";
import ZrContext from "@rbxts/zirconium/out/Data/Context";
import { ZrValue } from "@rbxts/zirconium/out/Data/Locals";
import ZrLuauFunction, { ZrLuauArgument } from "@rbxts/zirconium/out/Data/LuauFunction";
import ZrPlayerScriptContext from "@rbxts/zirconium/out/Runtime/PlayerScriptContext";
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

export class ZirconFunction<
	V extends readonly ZirconValidator<unknown, unknown>[],
	R extends ZrValue | void
> extends ZrLuauFunction {
	public constructor(
		private name: string,
		private argumentValidators: V,
		private zirconCallback: (context: ZirconContext, ...args: InferArguments<V>) => R,
	) {
		super((context, ...args) => {
			// We'll need to type check all the arguments to ensure they're valid
			// and transform as appropriate for the user side

			let transformedArguments = new Array<defined>();
			if (this.argumentValidators.size() > 0) {
				for (let i = 0; i < this.argumentValidators.size(); i++) {
					const validator = this.argumentValidators[i];
					const argument = args[i];
					if (validator && validator.Validate(argument)) {
						if (validator.Transform !== undefined) {
							transformedArguments[i] = validator.Transform(argument) as defined;
						} else {
							transformedArguments[i] = argument;
						}
					} else {
						if (RunService.IsServer()) {
							Server.Log.WriteStructured({
								Level: LogLevel.Error,
								Template: `Call to {FunctionName} failed - Argument#{ArgIndex} expected {ArgType}`,
								Timestamp: DateTime.now().ToIsoDate(),
								FunctionName: this.name,
								CallingPlayer: context.getExecutor()!,
								ArgIndex: i + 1,
								ArgType: validator.Type,
							});
						}
						return;
					}
				}
			} else {
				transformedArguments = args as Array<ZrLuauArgument>;
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

	private GetArgumentTypes() {
		return this.argumentValidators.map((v) => v.Type);
	}

	/** @internal */
	public RegisterToContext(context: ZrPlayerScriptContext) {
		context.registerGlobal(this.name, this);
	}

	public toString() {
		return (
			`function ${this.name}(` +
			this.GetArgumentTypes()
				.map((typeName, argIndex) => `a${argIndex}: ${typeName}`)
				.join(", ") +
			") { [ZirconFunction] }"
		);
	}

	public static args<V extends readonly Validator[]>(...value: V) {
		return value;
	}
}
