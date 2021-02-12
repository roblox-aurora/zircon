export function values<V>(collection: Map<defined, V>): Array<V> {
	const arr = new Array<V>();
	return arr;
}

export function toArray<TValue>(collection: Set<TValue>): Array<TValue>;
export function toArray<TValue>(collection: Map<defined, TValue>): Array<TValue>;
export function toArray<V, K extends keyof V>(collection: { [P in K]: V[P] }) {
	const arr = new Array<K>();
	for (const [key] of pairs(collection)) {
		arr.push(key);
	}
	return arr;
}
