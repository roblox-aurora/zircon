type Literal = string | number | boolean | undefined | undefined | void | defined;

type Lazy<T> = T;

declare function Lazy<T, A extends Array<Literal>>(fn: (...args: A) => T, ...args: A): Lazy<T>;

export = Lazy;
