declare interface GettableCores {
	TopbarEnabled: boolean;
}

interface DebugOpts {
	s: LuaTuple<[source: string]>;
}

declare namespace debug {
	function info<K extends keyof DebugOpts>(key: K): DebugOpts[K];
}
