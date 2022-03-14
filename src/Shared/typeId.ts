import { t } from "@rbxts/t";
import { ZrEnum } from "@rbxts/zirconium/out/Data/Enum";
import { ZrEnumItem } from "@rbxts/zirconium/out/Data/EnumItem";
import { ZrValue } from "@rbxts/zirconium/out/Data/Locals";
import ZrObject from "@rbxts/zirconium/out/Data/Object";
import ZrRange from "@rbxts/zirconium/out/Data/Range";
import ZrUndefined from "@rbxts/zirconium/out/Data/Undefined";
import { ZrUserdata, ZrInstanceUserdata } from "@rbxts/zirconium/out/Data/Userdata";
import { ZirconFunction } from "Class/ZirconFunction";

const array = t.array(t.any);

interface TypeId {
	undefined: ZrUndefined;
	function: ZirconFunction<any, any>;
	range: ZrRange;
	userdata: ZrUserdata<any>;
	Instance: ZrInstanceUserdata<Instance>;
	object: ZrObject;
	enum: ZrEnum;
	array: ZrValue[];
}

export function zirconTypeIs<K extends keyof TypeId>(value: ZrValue | ZrUndefined, k: K): value is TypeId[K] {
	return zirconTypeOf(value) === k;
}

export function zirconTypeOf(value: ZrValue | ZrUndefined): string {
	if (typeIs(value, "string") || typeIs(value, "number") || typeIs(value, "boolean")) {
		return typeOf(value);
	} else if (value === ZrUndefined) {
		return "undefined";
	} else if (value instanceof ZirconFunction) {
		return "function";
	} else if (value instanceof ZrRange) {
		return "range";
	} else if (value instanceof ZrUserdata) {
		return "userdata";
	} else if (value instanceof ZrInstanceUserdata) {
		return "Instance";
	} else if (value instanceof ZrObject) {
		return "object";
	} else if (value instanceof ZrEnum) {
		return "enum";
	} else if (value instanceof ZrEnumItem) {
		return value.getEnum().getEnumName();
	} else if (array(value)) {
		return "array";
	} else {
		return "invalid";
	}
}
