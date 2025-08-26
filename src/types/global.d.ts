export {};

declare global {
  interface Array<T> {
    sum(selector?: (item: T) => number): number;
    avg(selector?: (item: T) => number): number;
  }
}
