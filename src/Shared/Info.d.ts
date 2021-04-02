type Declarations = "source" | "lineNumber" | "arguments" | "name";

type MapTo<V extends readonly Declarations[]> = {
	[P in keyof V]: V[P] extends "source"
		? string
		: V[P] extends "lineNumber"
		? number
		: V[P] extends "arguments"
		? number
		: V[P] extends "name"
		? string
		: never;
};

declare function info<V extends readonly Declarations[]>(level: number, ...args: V): MapTo<V>;
export = info;
