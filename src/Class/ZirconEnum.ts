import { ZrEnum } from "@rbxts/zirconium/out/Data/Enum";
import { ZirconEnumItem } from "./ZirconEnumItem";
import { ZirconValidator } from "./ZirconTypeValidator";

export type EnumMatchTree<TEnum extends ZirconEnum<any>, K extends string, R> = {
	[P in K]: (value: ZirconEnumItem<TEnum, P>) => R;
};

export type ZirconEnumValidator<K extends string> = ZirconValidator<
	string | number | ZirconEnumItem,
	ZirconEnumItem<ZirconEnum<K>, K>
>;

/**
 * An extension of the `ZrEnum` class for Zircon
 */
export class ZirconEnum<K extends string> extends ZrEnum {
	public constructor(name: string, members: K[]) {
		super(members, name);
	}

	/**
	 * Returns whether or not the specified value is an ZirconEnumItem of this type
	 * @returns
	 */
	public is(value: ZirconEnumItem<any>): value is ZirconEnumItem<ZirconEnum<K>, K> {
		return this.getItems().includes(value);
	}

	/**
	 * Gets an enum item value by key
	 * @param key The key
	 */
	public getItem<TKey extends K>(key: TKey) {
		return this.getItems().find((k) => k.getName() === key)! as ZirconEnumItem<ZirconEnum<K>, TKey>;
	}

	/**
	 * Performs a match against the enum item given, similar to `match` in Rust.
	 *
	 * This also provides `_` for handling values that _don't_ match.
	 * @param value The enum item
	 * @param matches The matches
	 */
	public match<R>(value: ZirconEnumItem, matches: EnumMatchTree<ZirconEnum<K>, K, R> & { _?: () => R }): R {
		for (const member of this.getItems()) {
			if (member === value) {
				return matches[member.getName() as K](value as ZirconEnumItem<ZirconEnum<K>, K>);
			}
		}

		if (matches._ !== undefined) {
			return matches._();
		}
		throw `Invalid match`;
	}

	public getMemberType(): ZirconEnumValidator<K> {
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const thisRef = this;
		return {
			Validate(value): value is ZirconEnumItem<ZirconEnum<K>, K> | string {
				print("validate", value, thisRef.getItems());
				return (
					(typeIs(value, "string") &&
						thisRef.getItems().find((f) => f.getName().lower() === value.lower()) !== undefined) ||
					(typeIs(value, "number") && thisRef.getItems().find((f) => f.getValue() === value) !== undefined) ||
					(value instanceof ZirconEnumItem && (value.getEnum() as ZirconEnum<any>) === thisRef)
				);
			},
			Transform(value) {
				if (typeIs(value, "string")) {
					return thisRef.getItems().find((v) => v.getName().lower() === value.lower())! as ZirconEnumItem<
						ZirconEnum<K>,
						K
					>;
				} else if (typeIs(value, "number")) {
					return thisRef.getItems().find((v) => v.getValue() === value)! as ZirconEnumItem<ZirconEnum<K>, K>;
				} else {
					return value as ZirconEnumItem<ZirconEnum<K>, K>;
				}
			},
			Type: this.getEnumName(),
		};
	}
}
