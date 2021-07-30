import { ZirconEnum } from "./ZirconEnum";
import { ZirconEnumItem } from "./ZirconEnumItem";

function keysOf<K2 extends string>(value: Record<K2, number>): K2[] {
	const keys = new Array<K2>();
	for (const [key] of pairs(value)) {
		keys.push(key as K2);
	}
	return keys;
}

export class ZirconEnumBuilder<K extends string = never> {
	private members = new Array<K>();

	public constructor(private name: string) {}
	/**
	 * Adds the enum member to Zircon
	 * @param name The name of the enum member
	 * @returns The enum builder
	 */
	public AddEnumMember<TName extends string>(name: TName): ZirconEnumBuilder<K | TName> {
		this.members.push((name as string) as K);
		return this;
	}

	public FromEnum<TEnumKey extends string>(enumerable: Record<TEnumKey, number>) {
		return new ZirconEnum(this.name, keysOf(enumerable));
	}

	/** Builds the enum */
	public Build() {
		return new ZirconEnum<K>(this.name, this.members);
	}
}
