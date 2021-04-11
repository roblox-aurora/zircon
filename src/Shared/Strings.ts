export function padEnd(str: string, maxLength: number, fillWith: string) {
	if (str.size() > maxLength) {
		return str.sub(1, maxLength);
	} else {
		const offset = maxLength - str.size();
		return str + fillWith.rep(offset);
	}
}
