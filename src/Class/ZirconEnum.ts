import { ZrObjectUserdata } from "@rbxts/zirconium/out/Data/Userdata";
import { Validator, ZirconValidator } from "./ZirconTypeValidator";

export class ZirconEnumItem<
	TParent extends ZirconEnum<string> = ZirconEnum<string>,
	K extends string = string
> extends ZrObjectUserdata<K> {
	public constructor(private enumParent: TParent, private id: number, private name: K) {
		super(name);
	}

	public GetId() {
		return this.id;
	}

	public GetName() {
		return this.name;
	}

	public GetEnum() {
		return this.enumParent as TParent;
	}

	public Match<R>(tree: EnumMatchTree<TParent, K, R>) {
		return tree[this.GetName()](this);
	}

	public toString() {
		return tostring(this.enumParent) + "::[EnumItem '" + this.name + "']";
	}
}

type EnumMatchTree<TEnum extends ZirconEnum<any>, K extends string, R> = {
	[P in K]: (value: ZirconEnumItem<TEnum, P>) => R;
};

export class ZirconEnum<K extends string> extends ZrObjectUserdata<readonly ZirconEnumItem[]> {
	private name: string;
	public constructor(name: string, private members: K[]) {
		super(members.map((member, i) => new ZirconEnumItem(this, i, member)));
		this.name = name;
	}

	public GetName() {
		return this.name;
	}

	public Is(value: ZirconEnumItem<any>): value is ZirconEnumItem<ZirconEnum<K>, K> {
		return this.value().includes(value);
	}

	public GetItem<TKey extends K>(key: TKey) {
		return this.value().find((k) => k.GetName() === key)! as ZirconEnumItem<ZirconEnum<K>, TKey>;
	}

	public Match<R>(value: ZirconEnumItem, branches: EnumMatchTree<ZirconEnum<K>, K, R> & { _?: () => R }): R {
		for (const member of this.value()) {
			if (member === value) {
				return branches[member.GetName() as K](value as ZirconEnumItem<ZirconEnum<K>, K>);
			}
		}

		if (branches._ !== undefined) {
			return branches._();
		}
		throw `Invalid match`;
	}

	public GetMemberType(): ZirconValidator<string | number | ZirconEnumItem, ZirconEnumItem<ZirconEnum<K>, K>> {
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const thisRef = this;
		return {
			Validate(value): value is ZirconEnumItem<ZirconEnum<K>, K> | string {
				print("validate", value, thisRef.value());
				return (
					(typeIs(value, "string") &&
						thisRef.value().find((f) => f.GetName().lower() === value.lower()) !== undefined) ||
					(typeIs(value, "number") && thisRef.value().find((f) => f.GetId() === value) !== undefined) ||
					(value instanceof ZirconEnumItem && (value.GetEnum() as ZirconEnum<any>) === thisRef)
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
