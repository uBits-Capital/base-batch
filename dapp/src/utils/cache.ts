export class CacheInstance<T> {
  private lastSet: number = 0;
  private data: Record<any, T> = {};

  constructor(private duration: number) {}

  get(...keys: string[]) {
    return this.data[keys.join(":")];
  }
  set(data: T, ...keys: string[]) {
    this.data[keys.join(":")] = data;
    this.lastSet = Date.now();
    return data;
  }
  valid(...keys: string[]) {
    return (
      this.lastSet &&
      this.lastSet + this.duration > Date.now() &&
      keys.join(":") in this.data
    );
  }
}

export function cache<T>(duration: number) {
  return new CacheInstance<T>(duration);
}
