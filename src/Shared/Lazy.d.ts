type Literal = string | number | boolean | undefined | undefined | void | defined;

type Lazy<T> = T & { readonly __nominal_Lazy: unique symbol };

declare function Lazy<T, A extends Array<Literal>>(fn: (...args: A) => T, ...args: A): Lazy<T>;

export = Lazy;
