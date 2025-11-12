/**
 * StateManager - Centralized reactive state management system
 * Provides observable state with automatic UI updates, computed properties,
 * persistence, and undo/redo functionality.
 */

import { logger } from '../utils/logger.js';

/**
 * Type for state change observer callbacks
 */
export type StateObserver<T = unknown> = (newValue: T, oldValue: T, path: string) => void;

/**
 * Type for computed property getter functions
 */
export type ComputedGetter<T = unknown> = () => T;

/**
 * Type for state history entries
 */
interface StateHistoryEntry {
  state: Record<string, unknown>;
  timestamp: number;
  action: string;
}

/**
 * Configuration options for StateManager
 */
export interface StateManagerConfig {
  persistenceKey?: string;
  enablePersistence?: boolean;
  enableHistory?: boolean;
  maxHistorySize?: number;
}

/**
 * StateManager - Core reactive state management
 */
export class StateManager {
  private state: Map<string, unknown> = new Map();
  private observers: Map<string, Set<StateObserver>> = new Map();
  private computed: Map<string, { getter: ComputedGetter; dependencies: string[]; cache?: unknown; dirty: boolean }> = new Map();
  private history: StateHistoryEntry[] = [];
  private historyIndex: number = -1;
  private config: Required<StateManagerConfig>;
  private isRestoringHistory: boolean = false;

  constructor(config: StateManagerConfig = {}) {
    this.config = {
      persistenceKey: config.persistenceKey || 'tv-show-guide-state',
      enablePersistence: config.enablePersistence ?? true,
      enableHistory: config.enableHistory ?? true,
      maxHistorySize: config.maxHistorySize ?? 50,
    };

    logger.info('StateManager initialized', this.config);
  }

  /**
   * Set a state value at the given path
   */
  set<T>(path: string, value: T, action: string = 'update'): void {
    const oldValue = this.state.get(path);
    
    // Don't update if value hasn't changed
    if (oldValue === value) {
      return;
    }

    this.state.set(path, value);
    logger.debug(`State updated: ${path}`, { oldValue, newValue: value });

    // Add to history if not restoring
    if (this.config.enableHistory && !this.isRestoringHistory) {
      this.addToHistory(action);
    }

    // Mark dependent computed properties as dirty
    this.invalidateComputedDependencies(path);

    // Notify observers
    this.notifyObservers(path, value, oldValue);

    // Persist state if enabled
    if (this.config.enablePersistence && !this.isRestoringHistory) {
      this.persist();
    }
  }

  /**
   * Get a state value at the given path
   */
  get<T>(path: string): T | undefined {
    // Check if it's a computed property
    const computedProp = this.computed.get(path);
    if (computedProp) {
      return this.getComputed<T>(path);
    }

    return this.state.get(path) as T | undefined;
  }

  /**
   * Check if a state path exists
   */
  has(path: string): boolean {
    return this.state.has(path) || this.computed.has(path);
  }

  /**
   * Delete a state value at the given path
   */
  delete(path: string, action: string = 'delete'): boolean {
    if (!this.state.has(path)) {
      return false;
    }

    const oldValue = this.state.get(path);
    this.state.delete(path);
    logger.debug(`State deleted: ${path}`, { oldValue });

    if (this.config.enableHistory && !this.isRestoringHistory) {
      this.addToHistory(action);
    }

    this.notifyObservers(path, undefined, oldValue);

    if (this.config.enablePersistence && !this.isRestoringHistory) {
      this.persist();
    }

    return true;
  }

  /**
   * Subscribe to state changes at a specific path
   */
  subscribe(path: string, observer: StateObserver): () => void {
    if (!this.observers.has(path)) {
      this.observers.set(path, new Set());
    }

    this.observers.get(path)!.add(observer);
    logger.debug(`Observer subscribed to: ${path}`);

    // Return unsubscribe function
    return () => this.unsubscribe(path, observer);
  }

  /**
   * Unsubscribe from state changes
   */
  unsubscribe(path: string, observer: StateObserver): void {
    const pathObservers = this.observers.get(path);
    if (pathObservers) {
      pathObservers.delete(observer);
      logger.debug(`Observer unsubscribed from: ${path}`);
      
      // Clean up empty observer sets
      if (pathObservers.size === 0) {
        this.observers.delete(path);
      }
    }
  }

  /**
   * Define a computed property
   */
  defineComputed<T>(path: string, getter: ComputedGetter<T>, dependencies: string[] = []): void {
    this.computed.set(path, {
      getter,
      dependencies,
      dirty: true,
    });
    logger.debug(`Computed property defined: ${path}`, { dependencies });
  }

  /**
   * Get a computed property value
   */
  private getComputed<T>(path: string): T | undefined {
    const computedProp = this.computed.get(path);
    if (!computedProp) {
      return undefined;
    }

    // Return cached value if not dirty
    if (!computedProp.dirty && computedProp.cache !== undefined) {
      return computedProp.cache as T;
    }

    // Recompute value
    try {
      const value = computedProp.getter() as T;
      computedProp.cache = value;
      computedProp.dirty = false;
      logger.debug(`Computed property calculated: ${path}`, { value });
      return value;
    } catch (error) {
      logger.error(`Error computing property: ${path}`, error);
      return undefined;
    }
  }

  /**
   * Invalidate computed properties that depend on the changed path
   */
  private invalidateComputedDependencies(changedPath: string): void {
    for (const [computedPath, computedProp] of this.computed.entries()) {
      if (computedProp.dependencies.includes(changedPath)) {
        computedProp.dirty = true;
        logger.debug(`Computed property invalidated: ${computedPath}`);
        
        // Notify observers of computed property change
        const oldValue = computedProp.cache;
        computedProp.cache = undefined;
        this.notifyObservers(computedPath, undefined, oldValue);
      }
    }
  }

  /**
   * Notify all observers of a state change
   */
  private notifyObservers(path: string, newValue: unknown, oldValue: unknown): void {
    const pathObservers = this.observers.get(path);
    if (pathObservers && pathObservers.size > 0) {
      logger.debug(`Notifying ${pathObservers.size} observers for: ${path}`);
      pathObservers.forEach(observer => {
        try {
          observer(newValue, oldValue, path);
        } catch (error) {
          logger.error(`Error in observer for ${path}:`, error);
        }
      });
    }

    // Also notify wildcard observers (e.g., '*' path)
    const wildcardObservers = this.observers.get('*');
    if (wildcardObservers && wildcardObservers.size > 0) {
      wildcardObservers.forEach(observer => {
        try {
          observer(newValue, oldValue, path);
        } catch (error) {
          logger.error(`Error in wildcard observer for ${path}:`, error);
        }
      });
    }
  }

  /**
   * Add current state to history
   */
  private addToHistory(action: string): void {
    // Remove any history entries after current index (for redo after undo)
    if (this.historyIndex < this.history.length - 1) {
      this.history.splice(this.historyIndex + 1);
    }

    // Create snapshot of current state
    const snapshot = this.createSnapshot();
    this.history.push({
      state: snapshot,
      timestamp: Date.now(),
      action,
    });

    // Limit history size
    if (this.history.length > this.config.maxHistorySize) {
      this.history.shift();
    } else {
      this.historyIndex++;
    }

    logger.debug(`History entry added: ${action}`, { index: this.historyIndex, size: this.history.length });
  }

  /**
   * Create a snapshot of current state
   */
  private createSnapshot(): Record<string, unknown> {
    const snapshot: Record<string, unknown> = {};
    for (const [key, value] of this.state.entries()) {
      snapshot[key] = this.deepClone(value);
    }
    return snapshot;
  }

  /**
   * Deep clone a value
   */
  private deepClone(value: unknown): unknown {
    if (value === null || typeof value !== 'object') {
      return value;
    }

    if (value instanceof Date) {
      return new Date(value.getTime());
    }

    if (Array.isArray(value)) {
      return value.map(item => this.deepClone(item));
    }

    const cloned: Record<string, unknown> = {};
    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        cloned[key] = this.deepClone((value as Record<string, unknown>)[key]);
      }
    }
    return cloned;
  }

  /**
   * Restore state from a snapshot
   */
  private restoreSnapshot(snapshot: Record<string, unknown>): void {
    this.isRestoringHistory = true;
    
    // Clear current state
    this.state.clear();

    // Restore snapshot
    for (const key in snapshot) {
      if (Object.prototype.hasOwnProperty.call(snapshot, key)) {
        this.state.set(key, this.deepClone(snapshot[key]));
      }
    }

    // Invalidate all computed properties
    for (const [, computedProp] of this.computed.entries()) {
      computedProp.dirty = true;
      computedProp.cache = undefined;
    }

    // Notify all observers
    for (const [path, value] of this.state.entries()) {
      this.notifyObservers(path, value, undefined);
    }

    this.isRestoringHistory = false;
    logger.info('State restored from snapshot');
  }

  /**
   * Undo the last state change
   */
  undo(): boolean {
    if (!this.canUndo()) {
      logger.warn('Cannot undo: no history available');
      return false;
    }

    this.historyIndex--;
    const entry = this.history[this.historyIndex];
    if (!entry) {
      logger.error('History entry not found for undo');
      return false;
    }
    this.restoreSnapshot(entry.state);
    logger.info(`Undo: ${entry.action}`, { index: this.historyIndex });
    return true;
  }

  /**
   * Redo the last undone state change
   */
  redo(): boolean {
    if (!this.canRedo()) {
      logger.warn('Cannot redo: no future history available');
      return false;
    }

    this.historyIndex++;
    const entry = this.history[this.historyIndex];
    if (!entry) {
      logger.error('History entry not found for redo');
      return false;
    }
    this.restoreSnapshot(entry.state);
    logger.info(`Redo: ${entry.action}`, { index: this.historyIndex });
    return true;
  }

  /**
   * Check if undo is available
   */
  canUndo(): boolean {
    return this.config.enableHistory && this.historyIndex > 0;
  }

  /**
   * Check if redo is available
   */
  canRedo(): boolean {
    return this.config.enableHistory && this.historyIndex < this.history.length - 1;
  }

  /**
   * Get history information
   */
  getHistoryInfo(): { canUndo: boolean; canRedo: boolean; currentIndex: number; size: number } {
    return {
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      currentIndex: this.historyIndex,
      size: this.history.length,
    };
  }

  /**
   * Persist state to localStorage
   */
  private persist(): void {
    try {
      const snapshot = this.createSnapshot();
      localStorage.setItem(this.config.persistenceKey, JSON.stringify(snapshot));
      logger.debug('State persisted to localStorage');
    } catch (error) {
      logger.error('Failed to persist state:', error);
    }
  }

  /**
   * Load state from localStorage
   */
  load(): boolean {
    try {
      const stored = localStorage.getItem(this.config.persistenceKey);
      if (!stored) {
        logger.info('No persisted state found');
        return false;
      }

      const snapshot = JSON.parse(stored);
      this.restoreSnapshot(snapshot);
      logger.info('State loaded from localStorage');
      return true;
    } catch (error) {
      logger.error('Failed to load persisted state:', error);
      return false;
    }
  }

  /**
   * Clear persisted state
   */
  clearPersisted(): void {
    try {
      localStorage.removeItem(this.config.persistenceKey);
      logger.info('Persisted state cleared');
    } catch (error) {
      logger.error('Failed to clear persisted state:', error);
    }
  }

  /**
   * Reset state to initial values
   */
  reset(): void {
    this.state.clear();
    this.history = [];
    this.historyIndex = -1;
    
    // Invalidate all computed properties
    for (const [, computedProp] of this.computed.entries()) {
      computedProp.dirty = true;
      computedProp.cache = undefined;
    }

    logger.info('State reset to initial values');
    
    // Notify all observers
    this.observers.forEach((observers, path) => {
      observers.forEach(observer => {
        try {
          observer(undefined, undefined, path);
        } catch (error) {
          logger.error(`Error in observer during reset for ${path}:`, error);
        }
      });
    });

    if (this.config.enablePersistence) {
      this.clearPersisted();
    }
  }

  /**
   * Get all state as a plain object
   */
  getAll(): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [key, value] of this.state.entries()) {
      result[key] = value;
    }
    return result;
  }

  /**
   * Batch update multiple state values
   */
  batch(updates: Record<string, unknown>, action: string = 'batch update'): void {
    const oldValues: Record<string, unknown> = {};
    
    // Store old values
    for (const path in updates) {
      oldValues[path] = this.state.get(path);
    }

    // Update all values without notifying
    for (const path in updates) {
      this.state.set(path, updates[path]);
    }

    // Add single history entry
    if (this.config.enableHistory && !this.isRestoringHistory) {
      this.addToHistory(action);
    }

    // Invalidate computed dependencies for all changed paths
    for (const path in updates) {
      this.invalidateComputedDependencies(path);
    }

    // Notify observers for all changes
    for (const path in updates) {
      this.notifyObservers(path, updates[path], oldValues[path]);
    }

    // Persist once after all updates
    if (this.config.enablePersistence && !this.isRestoringHistory) {
      this.persist();
    }

    logger.info(`Batch update completed: ${action}`, { paths: Object.keys(updates).length });
  }
}
