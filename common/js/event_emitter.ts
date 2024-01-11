import { EventMap, EventRegistry } from "./event_registry";

export interface EventEmitterBase<T extends EventMap> {
  emit<K extends keyof T>(
    key: K,
    ...args: Parameters<T[K]>
  ): ReturnType<T[K]>[];
  emitAsync<K extends keyof T>(
    key: K,
    ...args: Parameters<T[K]>
  ): Promise<Awaited<ReturnType<T[K]>>[]>;
}

export class EventEmitter<T extends EventMap> implements EventEmitterBase<T> {
  constructor(protected readonly eventRegistry: EventRegistry<T>) {}

  public emit<K extends keyof T>(
    key: K,
    ...args: Parameters<T[K]>
  ): ReturnType<T[K]>[] {
    return this.eventRegistry
      .getListeners(key)
      .map((listener) => listener(...args));
  }

  public emitAsync<K extends keyof T>(
    key: K,
    ...args: Parameters<T[K]>
  ): Promise<Awaited<ReturnType<T[K]>>[]> {
    return Promise.all(
      this.eventRegistry.getListeners(key).map((listener) => listener(...args)),
    );
  }
}
