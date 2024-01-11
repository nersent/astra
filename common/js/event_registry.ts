export interface EventRegistryBase<T extends EventMap> {
  addListener<K extends keyof T, L extends T[K]>(key: K, listener: L): void;
  removeListener<K extends keyof T, L extends T[K]>(key: K, listener: L): void;
  getListeners<K extends keyof T>(key: K): T[keyof T][];
  on<K extends keyof T, L extends T[K]>(event: K, listener: L): void;
  once<K extends keyof T, L extends T[K]>(event: K, listener: L): void;
  off<K extends keyof T, L extends T[K]>(event: K, listener: L): void;
}

export type EventMap = Record<string | symbol, (...args: any[]) => any>;

export class EventRegistry<T extends EventMap> implements EventRegistryBase<T> {
  protected readonly listeners = new Map<keyof T, Set<T[keyof T]>>();

  public addListener<K extends keyof T, L extends T[K]>(
    key: K,
    listener: L,
  ): void {
    const set = this.listeners.get(key) ?? new Set();
    this.listeners.set(key, set.add(listener));
  }

  public removeListener<K extends keyof T, L extends T[K]>(
    key: K,
    listener: L,
  ): void {
    const set = this.listeners.get(key);
    if (set != null) {
      set.delete(listener);
    }
  }

  public getListeners<K extends keyof T>(key: K): T[keyof T][] {
    return [...(this.listeners.get(key)?.entries() ?? [])].map(
      ([listener]) => listener,
    );
  }

  public on<K extends keyof T, L extends T[K]>(event: K, listener: L): void {
    this.addListener(event, listener);
  }

  public once<K extends keyof T, L extends T[K]>(event: K, listener: L): void {
    const onceListener = (...args: any[]): void => {
      this.removeListener(event, onceListener as any);
      listener(...args);
    };

    this.addListener(event, onceListener as any);
  }

  public off<K extends keyof T, L extends T[K]>(event: K, listener: L): void {
    this.removeListener(event, listener);
  }
}
