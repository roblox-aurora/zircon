import { ZrObjectUserdata } from "@rbxts/zirconium/out/Data/Userdata";
import { ZirconEnum, EnumMatchTree } from "./ZirconEnum";

/**
 * High level enum item wrapper for Zircon
 */

export class ZirconEnumItem<
	TParent extends ZirconEnum<string> = ZirconEnum<string>,
	K extends string = string
> extends ZrObjectUserdata<K> {
	public constructor(private enumParent: TParent, private id: number, private name: K) {
		super(name);
	}

	/**
	 * Gets the numeric value of this enum
	 * @returns The numeric value
	 */
	public GetId() {
		return this.id;
	}

	/**
	 * Gets the string literal value of this enum
	 * @returns The value
	 */
	public GetName() {
		return this.name;
	}

	/**
	 * Gets the Enum of this EnumItem
	 * @returns The Enum
	 */
	public GetEnumType() {
		return this.enumParent as TParent;
	}

	/**
	 * Performs a match against this enum value - similar to `match` in Rust.
	 * @param matches The matches to check against
	 */
	public Match<R>(matches: EnumMatchTree<TParent, K, R>) {
		return matches[this.GetName()](this);
	}

	public toString() {
		return tostring(this.enumParent) + "::[EnumItem '" + this.name + "']";
	}
}
