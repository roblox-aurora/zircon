import { ZirconFunction } from "./ZirconFunction";
import { ZirconNamespace } from "./ZirconNamespace";

export class ZirconNamespaceBuilder {
	private functions = new Array<ZirconFunction<any, any>>();

	public constructor(private name: string) {}

	public AddFunction(func: ZirconFunction<any, any>) {
		this.functions.push(func);
		return this;
	}

	public Build() {
		return new ZirconNamespace(this.name, this.functions);
	}
}
