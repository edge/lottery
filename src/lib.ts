/**
 * Deep partial utility type recursively renders all of a complex object's properties optional.
 *
 * Via https://stackoverflow.com/a/61132308/1717753
 */
export type DeepPartial<T> = T extends object ? { [P in keyof T]?: DeepPartial<T[P]> } : T
