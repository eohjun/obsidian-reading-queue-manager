/**
 * EventEmitter Service
 * Pub/Sub pattern for loose coupling between components
 */

export type EventCallback<T = unknown> = (data: T) => void;

export interface PluginEvents {
  'analysis:started': { itemId: string };
  'analysis:completed': { itemId: string; summary: string };
  'analysis:failed': { itemId: string; error: string };
  'cost:updated': { totalSpend: number; budgetLimit?: number };
  'settings:changed': { key: string; value: unknown };
}

export class EventEmitter {
  private listeners: Map<string, Set<EventCallback>> = new Map();

  /**
   * Subscribe to an event
   * @returns Unsubscribe function
   */
  on<K extends keyof PluginEvents>(
    event: K,
    callback: EventCallback<PluginEvents[K]>
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback as EventCallback);

    // Return unsubscribe function
    return () => this.off(event, callback);
  }

  /**
   * Unsubscribe from an event
   */
  off<K extends keyof PluginEvents>(
    event: K,
    callback: EventCallback<PluginEvents[K]>
  ): void {
    this.listeners.get(event)?.delete(callback as EventCallback);
  }

  /**
   * Emit an event to all listeners
   */
  emit<K extends keyof PluginEvents>(event: K, data: PluginEvents[K]): void {
    this.listeners.get(event)?.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Event handler error for ${event}:`, error);
      }
    });
  }

  /**
   * Subscribe to an event once (auto-unsubscribe after first call)
   */
  once<K extends keyof PluginEvents>(
    event: K,
    callback: EventCallback<PluginEvents[K]>
  ): void {
    const unsubscribe = this.on(event, (data) => {
      unsubscribe();
      callback(data);
    });
  }

  /**
   * Remove all listeners for an event (or all events)
   */
  removeAllListeners(event?: keyof PluginEvents): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  /**
   * Get listener count for an event
   */
  listenerCount(event: keyof PluginEvents): number {
    return this.listeners.get(event)?.size ?? 0;
  }
}

// Singleton instance
let emitterInstance: EventEmitter | null = null;

export function getEventEmitter(): EventEmitter {
  if (!emitterInstance) {
    emitterInstance = new EventEmitter();
  }
  return emitterInstance;
}

export function resetEventEmitter(): void {
  if (emitterInstance) {
    emitterInstance.removeAllListeners();
  }
  emitterInstance = null;
}
