declare interface GettableCores {
	TopbarEnabled: boolean;
}

type ARGLETTER = 's' | 'l' | 'n' | 'f'
type DebugInfoString = `${ARGLETTER}` | `${ARGLETTER}${ARGLETTER}` | `${ARGLETTER}${ARGLETTER}${ARGLETTER}` | `${ARGLETTER}${ARGLETTER}${ARGLETTER}${ARGLETTER}`;
type Split<S extends string, D extends string> =
    string extends S ? string[] :
        S extends '' ? [] :
            S extends `${infer T}${D}${infer U}` ?  [T, ...Split<U, D>] :  [S];
type Values<T extends string[]> = {[P in keyof T]: 
    T[P] extends "s" ? string
    : T[P] extends "l" ? number
    : T[P] extends "n" ? string
    // : T[P] extends "a" ? [number, boolean]
    : T[P] extends "f" ? () => void
    : []
} & defined[];
/**
 * This is annoyingly hacky. Doesn't work with 'a' (Argument arity) unfortunately.
 */
type DebugInfoResult<T extends DebugInfoString> = Values<Split<T, "">>;


// eslint-disable-next-line roblox-ts/no-namespace-merging
declare namespace debug {
	function info<A extends DebugInfoString>(funLevel: number | (() => void), value: A): LuaTuple<DebugInfoResult<A>>;
}

declare interface ReadonlyArray<T> extends ArrayLike<T>, Iterable<T> {
    /**
     * @hidden
     * @deprecated This is required by Zircon to be able to infer arguments correctly. It should not otherwise be used.
     */
    readonly length: number;
}