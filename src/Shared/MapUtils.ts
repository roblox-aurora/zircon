/**
 * Utilites relating to Map objects
 */
export namespace MapUtils {
	/**
	 * Creates a shallow copy of a map
	 * @param map The map to copy
	 * @returns A shallow copy of the map
	 */
	export function Copy<K, V>(map: ReadonlyMap<K, V>) {
		const mapCopy = new Map<K, V>();
		for (const [k, v] of map) {
			mapCopy.set(k, v);
		}
		return mapCopy;
	}

	/**
	 * Gets the value of this map, or creates the key with the default value if it doesn't exist.
	 * @param map The map
	 * @param key The key to get the value or "place" a default value in
	 * @param defaultValue The default value if the key doesn't exist (to set)
	 * @returns The value
	 */
	export function GetOrCreateKey<K, V>(map: Map<K, V>, key: K, defaultValue: V) {
		const value = map.get(key);
		if (value !== undefined) {
			return value;
		} else {
			map.set(key, defaultValue);
			return defaultValue;
		}
	}
}
