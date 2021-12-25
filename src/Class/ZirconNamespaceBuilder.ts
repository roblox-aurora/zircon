import { LogLevel } from "@rbxts/log";
import { ZirconFunction } from "./ZirconFunction";
import { ZirconFunctionBuilder } from "./ZirconFunctionBuilder";
import { ZirconNamespace } from "./ZirconNamespace";

type HelpFn = (name: string, argumentTypes: string[], description: string | undefined) => void;
export class ZirconNamespaceBuilder {
	private functions = new Array<ZirconFunction<any, any>>();

	public constructor(private name: string) {}

	public AddFunction(func: ZirconFunction<any, any>) {
		const existingFn = this.functions.find((f) => f.GetName() === func.GetName());
		if (existingFn) {
			warn("Duplicate function: '" + func.GetName() + "' in namespace '" + this.name + "'");
		} else {
			this.functions.push(func);
		}

		return this;
	}

	/** @internal */
	public AddHelpFunction(
		callback: HelpFn = (name, args, desc) => {
			import("Services/LogService").then(({ ZirconLogService }) => {
				ZirconLogService.WriteStructured({
					Template: desc !== undefined ? "function {Name} {Args}: '{Description}'" : "function {Name} {Args}",
					Name: name,
					Args: args,
					Description: desc,
					Timestamp: DateTime.now().ToIsoDate(),
					Level: LogLevel.Information,
					SourceContext: `${this.name}.${functionName}`,
				});
			});
		},
		functionName = "help",
		functionDescription = "Lists all members in this namespace",
	) {
		this.functions.push(
			new ZirconFunctionBuilder(functionName)
				.AddArgument("string?")
				.AddDescription(functionDescription)
				.Bind((_, memberName) => {
					const matchingMember =
						memberName !== undefined
							? this.functions.find(
									(f) => f.GetName().lower().find(memberName.lower(), 1, true)[0] !== undefined,
							  )
							: undefined;
					if (matchingMember) {
						const args = matchingMember.GetArgumentTypes();
						const varType = matchingMember.GetVariadicType();
						if (varType !== undefined) {
							args.push(`...${varType}`);
						}

						callback(matchingMember.GetName(), args, matchingMember.GetDescription());
					} else {
						this.functions
							.map((f) => {
								const args = f.GetArgumentTypes();
								const varType = f.GetVariadicType();
								if (varType !== undefined) {
									args.push(`...${varType}`);
								}

								return [f.GetName(), args, f.GetDescription()] as const;
							})
							.forEach((arg) => callback(...arg));
					}
				}),
		);
		return this;
	}

	public Build() {
		return new ZirconNamespace(this.name, this.functions);
	}
}
