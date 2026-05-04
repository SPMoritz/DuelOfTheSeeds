/**
 * Mulberry32 seeded PRNG — deterministic random from a numeric seed.
 */
export class SeededRandom {
  constructor(seed) {
    this.state = seed | 0;
    if (this.state === 0) this.state = 1;
  }

  /** Returns float in [0, 1) */
  next() {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** Returns integer in [min, max] inclusive */
  int(min, max) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /** Returns float in [min, max) */
  float(min, max) {
    return this.next() * (max - min) + min;
  }

  /** Returns true with given probability [0..1] */
  chance(p) {
    return this.next() < p;
  }

  /** Pick random element from array */
  pick(arr) {
    return arr[this.int(0, arr.length - 1)];
  }

  /** Shuffle array in place */
  shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = this.int(0, i);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}
