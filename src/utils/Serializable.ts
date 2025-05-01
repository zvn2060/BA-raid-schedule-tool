type FieldKey<T> = { [K in keyof T]: T[K] extends Function ? never : K; }[keyof T];
type Nullable<T> = { [P in keyof T]?: T[P] | null; };

declare global {
  export type PartialField<T> = Partial<Nullable<Pick<T, FieldKey<T>>>>;
  export interface Serializable<T> {
    toObject(): T;
  }
  export type Public<T> = {
    [P in keyof T]: Public<T[P]>;
  };
}
