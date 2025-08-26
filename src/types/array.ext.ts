if (!Array.prototype.sum) {
  Array.prototype.sum = function <T>(this: T[], selector?: (item: T) => number): number {
    if (this.length === 0) return 0;

    if (selector) {
      return this.reduce((acc, val) => acc + selector(val), 0);
    }

    // se l'array è di numeri puri
    return (this as unknown as number[]).reduce((acc, val) => acc + val, 0);
  };
}

if (!Array.prototype.avg) {
  Array.prototype.avg = function <T>(this: T[], selector?: (item: T) => number): number {
    if (this.length === 0) return 0;
    if (selector) {
      return this.sum(selector) / this.length;
    }
    return (this as unknown as number[]).sum() / this.length;
  };
}
