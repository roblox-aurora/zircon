import { ZrObjectUserdata } from "@rbxts/zirconium/out/Data/Userdata";
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
 * High level Enum wrapper for Zircon
 */
export class ZirconEnum<K extends string> extends ZrObjectUserdata<readonly ZirconEnumItem[]> {
	private name: string;
	public constructor(name: string, private members: K[]) {
		super(members.map((member, i) => new ZirconEnumItem(this, i, member)));
		this.name = name;
	}

	/**
	 * Gets the values of this EnumType
	 * @returns The enum value
	 */
	public GetEnumItems() {
		return this.value();
	}

	/**
	 * Gets the name of this EnumType
	 * @returns
	 */
	public GetName() {
		return this.name;
	}

	/**
	 * Returns whether or not the specified value is an ZirconEnumItem of this type
	 * @returns
	 */
	public Is(value: ZirconEnumItem<any>): value is ZirconEnumItem<ZirconEnum<K>, K> {
		return this.value().includes(value);
	}

	/**
	 * Gets an enum item value by key
	 * @param key The key
	 */
	public GetItem<TKey extends K>(key: TKey) {
		return this.value().find((k) => k.GetName() === key)! as ZirconEnumItem<ZirconEnum<K>, TKey>;
	}

	/**
	 * Performs a match against the enum item given, similar to `match` in Rust.
	 *
	 * This also provides `_` for handling values that _don't_ match.
	 * @param value The enum item
	 * @param matches The matches
	 */
	public Match<R>(value: ZirconEnumItem, matches: EnumMatchTree<ZirconEnum<K>, K, R> & { _?: () => R }): R {
		for (const member of this.value()) {
			if (member === value) {
				return matches[member.GetName() as K](value as ZirconEnumItem<ZirconEnum<K>, K>);
			}
		}

		if (matches._ !== undefined) {
			return matches._();
		}
		throw `Invalid match`;
	}

	public GetMemberType(): ZirconEnumValidator<K> {
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const thisRef = this;
		return {
			Validate(value): value is ZirconEnumItem<ZirconEnum<K>, K> | string {
				print("validate", value, thisRef.value());
				return (
					(typeIs(value, "string") &&
						thisRef.value().find((f) => f.GetName().lower() === value.lower()) !== undefined) ||
					(typeIs(value, "number") && thisRef.value().find((f) => f.GetId() === value) !== undefined) ||
					(value instanceof ZirconEnumItem && (value.GetEnumType() as ZirconEnum<any>) === thisRef)
				);
			},
			Transform(value) {
				if (typeIs(value, "string")) {
					return thisRef.value().find((v) => v.GetName().lower() === value.lower())! as ZirconEnumItem<
						ZirconEnum<K>,
						K
					>;
				} else if (typeIs(value, "number")) {
					return thisRef.value().find((v) => v.GetId() === value)! as ZirconEnumItem<ZirconEnum<K>, K>;
				} else {
					return value as ZirconEnumItem<ZirconEnum<K>, K>;
				}
			},
			Type: "ZirconEnum[" + this.members.join(" | ") + "]",
		};
	}

	public toString() {
		return `[Enum '` + this.name + "']";
	}
}
