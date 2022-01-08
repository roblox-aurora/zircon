declare interface GettableCores {
	TopbarEnabled: boolean;
}

declare interface ReadonlyArray<T> extends ArrayLike<T>, Iterable<T> {
	/**
	 * @hidden
	 * @deprecated This is required by Zircon to be able to infer arguments correctly. It should not otherwise be used.
	 */
	readonly length: number;
}
