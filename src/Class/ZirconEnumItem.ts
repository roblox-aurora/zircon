import { ZrEnumItem } from "@rbxts/zirconium/out/Data/EnumItem";
import { ZrObjectUserdata } from "@rbxts/zirconium/out/Data/Userdata";
import { ZirconEnum, EnumMatchTree } from "./ZirconEnum";

/**
 * An extension of the `ZrEnumItem` class for Zircon.
 */
export class ZirconEnumItem<
	TParent extends ZirconEnum<string> = ZirconEnum<string>,
	K extends string = string
> extends ZrEnumItem {
	public constructor(enumParent: TParent, id: number, name: K) {
		super(enumParent, id, name);
	}

	/**
	 * Performs a match against this enum value - similar to `match` in Rust.
	 * @param matches The matches to check against
	 */
	public match<R>(matches: EnumMatchTree<TParent, K, R>) {
		return matches[this.getName() as K](this);
	}

	public getName(): K {
		return super.getName() as K;
	}

	public getEnum(): TParent {
		return super.getEnum() as TParent;
	}

	public toString() {
		return `${this.getEnum().getEnumName()}.${this.getName()}`;
	}
}
