/**
 * ReactiveShowManager - State-managed wrapper for ShowManager
 * Provides reactive show data with automatic UI updates, undo/redo, and persistence
 */

import { StateManager } from './StateManager.js';
import { ShowManager, ShowFilters, ShowStats } from '../modules/showManager.js';
import { Show, ShowDatabase, Platform, Network, AirDay } from '../types/index.js';
import { logger } from '../utils/logger.js';

/**
 * Configuration for ReactiveShowManager
 */
export interface ReactiveShowManagerConfig {
  persistenceKey?: string;
  enablePersistence?: boolean;
  enableHistory?: boolean;
  maxHistorySize?: number;
}

/**
 * ReactiveShowManager - Integrates ShowManager with StateManager
 * for reactive, undoable show data management
 */
export class ReactiveShowManager {
  private stateManager: StateManager;
  private showManager: ShowManager;

  constructor(initialShows: ShowDatabase, config: ReactiveShowManagerConfig = {}) {
    // Initialize state manager
    this.stateManager = new StateManager({
      persistenceKey: config.persistenceKey || 'tv-show-guide-reactive',
      enablePersistence: config.enablePersistence ?? true,
      enableHistory: config.enableHistory ?? true,
      maxHistorySize: config.maxHistorySize ?? 50,
    });

    // Initialize show manager
    this.showManager = new ShowManager(initialShows);

    // Initialize state
    this.initializeState(initialShows);

    // Define computed properties
    this.defineComputedProperties();

    logger.info('ReactiveShowManager initialized', {
      showCount: Object.keys(initialShows).length,
      config,
    });
  }

  /**
   * Initialize state with shows and default filters
   */
  private initializeState(shows: ShowDatabase): void {
    this.stateManager.set('shows', shows, 'initialize shows');
    this.stateManager.set('filters', {
      platforms: [],
      networks: [],
      returning: undefined,
      airDays: [],
      searchTerm: '',
    }, 'initialize filters');
    this.stateManager.set('ui.currentView', 'all-shows', 'initialize view');
    this.stateManager.set('ui.searchTerm', '', 'initialize search');
  }

  /**
   * Define computed properties for show data
   */
  private defineComputedProperties(): void {
    // Computed: Filtered shows based on current filters
    this.stateManager.defineComputed(
      'filteredShows',
      () => {
        const shows = this.stateManager.get<ShowDatabase>('shows');
        const filters = this.stateManager.get<ShowFilters>('filters');
        
        if (!shows) {
          return {};
        }

        // Update internal ShowManager with current shows
        this.showManager = new ShowManager(shows);
        return this.showManager.getFilteredShows(filters || {});
      },
      ['shows', 'filters']
    );

    // Computed: Show statistics
    this.stateManager.defineComputed(
      'stats',
      () => {
        const shows = this.stateManager.get<ShowDatabase>('shows');
        if (!shows) {
          return {
            total: 0,
            returning: 0,
            nonReturning: 0,
            byPlatform: { hulu: 0, peacock: 0, paramount: 0 },
            byNetwork: { ABC: 0, NBC: 0, CBS: 0, FOX: 0 }
          };
        }

        this.showManager = new ShowManager(shows);
        return this.showManager.getStats();
      },
      ['shows']
    );

    // Computed: Shows by platform
    this.stateManager.defineComputed(
      'showsByPlatform.hulu',
      () => {
        const shows = this.stateManager.get<ShowDatabase>('shows');
        if (!shows) {
          return {};
        }
        this.showManager = new ShowManager(shows);
        return this.showManager.getShowsByPlatform('hulu');
      },
      ['shows']
    );

    this.stateManager.defineComputed(
      'showsByPlatform.peacock',
      () => {
        const shows = this.stateManager.get<ShowDatabase>('shows');
        if (!shows) {
          return {};
        }
        this.showManager = new ShowManager(shows);
        return this.showManager.getShowsByPlatform('peacock');
      },
      ['shows']
    );

    this.stateManager.defineComputed(
      'showsByPlatform.paramount',
      () => {
        const shows = this.stateManager.get<ShowDatabase>('shows');
        if (!shows) {
          return {};
        }
        this.showManager = new ShowManager(shows);
        return this.showManager.getShowsByPlatform('paramount');
      },
      ['shows']
    );

    // Computed: Returning shows only
    this.stateManager.defineComputed(
      'returningShows',
      () => {
        const shows = this.stateManager.get<ShowDatabase>('shows');
        if (!shows) {
          return {};
        }
        this.showManager = new ShowManager(shows);
        return this.showManager.getReturningShows();
      },
      ['shows']
    );

    // Computed: Week view data (shows grouped by air day)
    this.stateManager.defineComputed(
      'weekViewData',
      () => {
        const shows = this.stateManager.get<ShowDatabase>('shows');
        const filters = this.stateManager.get<ShowFilters>('filters');
        
        if (!shows) {
          return {
            Sunday: [],
            Monday: [],
            Tuesday: [],
            Wednesday: [],
            Thursday: [],
            Friday: [],
            Saturday: [],
          };
        }

        this.showManager = new ShowManager(shows);
        const filteredShows = this.showManager.getFilteredShows(filters || {});
        
        // Group shows by air day
        const weekData: Record<AirDay, Show[]> = {
          Sunday: [],
          Monday: [],
          Tuesday: [],
          Wednesday: [],
          Thursday: [],
          Friday: [],
          Saturday: [],
        };

        Object.values(filteredShows).forEach(show => {
          if (show.air && show.air.length > 0) {
            weekData[show.air as AirDay].push(show);
          }
        });

        return weekData;
      },
      ['shows', 'filters']
    );

    logger.debug('Computed properties defined for ReactiveShowManager');
  }

  /**
   * Get all shows (reactive)
   */
  getAllShows(): ShowDatabase {
    return this.stateManager.get<ShowDatabase>('shows') || {};
  }

  /**
   * Get filtered shows (reactive, computed)
   */
  getFilteredShows(): ShowDatabase {
    return this.stateManager.get<ShowDatabase>('filteredShows') || {};
  }

  /**
   * Get show statistics (reactive, computed)
   */
  getStats(): ShowStats {
    return this.stateManager.get<ShowStats>('stats') || {
      total: 0,
      returning: 0,
      nonReturning: 0,
      byPlatform: { hulu: 0, peacock: 0, paramount: 0 },
      byNetwork: { ABC: 0, NBC: 0, CBS: 0, FOX: 0 }
    };
  }

  /**
   * Get shows by platform (reactive, computed)
   */
  getShowsByPlatform(platform: Platform): ShowDatabase {
    return this.stateManager.get<ShowDatabase>(`showsByPlatform.${platform}`) || {};
  }

  /**
   * Get returning shows (reactive, computed)
   */
  getReturningShows(): ShowDatabase {
    return this.stateManager.get<ShowDatabase>('returningShows') || {};
  }

  /**
   * Get week view data (reactive, computed)
   */
  getWeekViewData(): Record<AirDay, Show[]> {
    return this.stateManager.get<Record<AirDay, Show[]>>('weekViewData') || {
      Sunday: [],
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
    };
  }

  /**
   * Update filters (triggers reactive updates)
   */
  setFilters(filters: Partial<ShowFilters>, action: string = 'update filters'): void {
    const currentFilters = this.stateManager.get<ShowFilters>('filters') || {};
    const newFilters = { ...currentFilters, ...filters };
    this.stateManager.set('filters', newFilters, action);
    logger.debug('Filters updated', newFilters);
  }

  /**
   * Set platform filter
   */
  setPlatformFilter(platforms: Platform[], action: string = 'filter by platform'): void {
    this.setFilters({ platforms }, action);
  }

  /**
   * Set network filter
   */
  setNetworkFilter(networks: Network[], action: string = 'filter by network'): void {
    this.setFilters({ networks }, action);
  }

  /**
   * Set returning status filter
   */
  setReturningFilter(returning: boolean | undefined, action: string = 'filter by returning status'): void {
    const currentFilters = this.stateManager.get<ShowFilters>('filters') || {};
    const newFilters = { ...currentFilters, returning };
    this.stateManager.set('filters', newFilters, action);
  }

  /**
   * Set search term
   */
  setSearchTerm(searchTerm: string, action: string = 'search shows'): void {
    this.setFilters({ searchTerm }, action);
    this.stateManager.set('ui.searchTerm', searchTerm, action);
  }

  /**
   * Clear all filters
   */
  clearFilters(action: string = 'clear filters'): void {
    this.stateManager.set('filters', {
      platforms: [],
      networks: [],
      returning: undefined,
      airDays: [],
      searchTerm: '',
    }, action);
  }

  /**
   * Update a show (triggers reactive updates, enables undo/redo)
   */
  updateShow(id: number, updates: Partial<Show>, action?: string): boolean {
    const shows = this.getAllShows();
    
    if (!shows[id]) {
      logger.warn(`Show with ID ${id} not found`);
      return false;
    }

    const updatedShows = {
      ...shows,
      [id]: { ...shows[id], ...updates }
    };

    const actionDescription = action || `update show: ${shows[id].t}`;
    this.stateManager.set('shows', updatedShows, actionDescription);
    logger.info(`Show ${id} updated: ${shows[id].t}`);
    return true;
  }

  /**
   * Add a new show (triggers reactive updates, enables undo/redo)
   */
  addShow(id: number, show: Show, action?: string): boolean {
    const shows = this.getAllShows();
    
    if (shows[id]) {
      logger.warn(`Show with ID ${id} already exists`);
      return false;
    }

    const updatedShows = {
      ...shows,
      [id]: show
    };

    const actionDescription = action || `add show: ${show.t}`;
    this.stateManager.set('shows', updatedShows, actionDescription);
    logger.info(`Show ${id} added: ${show.t}`);
    return true;
  }

  /**
   * Remove a show (triggers reactive updates, enables undo/redo)
   */
  removeShow(id: number, action?: string): boolean {
    const shows = this.getAllShows();
    
    if (!shows[id]) {
      logger.warn(`Show with ID ${id} not found`);
      return false;
    }

    const showTitle = shows[id].t;
    const updatedShows = { ...shows };
    delete updatedShows[id];

    const actionDescription = action || `remove show: ${showTitle}`;
    this.stateManager.set('shows', updatedShows, actionDescription);
    logger.info(`Show ${id} removed: ${showTitle}`);
    return true;
  }

  /**
   * Batch update multiple shows (efficient, single history entry)
   */
  batchUpdateShows(updates: Record<number, Partial<Show>>, action: string = 'batch update shows'): void {
    const shows = this.getAllShows();
    const updatedShows = { ...shows };

    Object.entries(updates).forEach(([id, update]) => {
      const showId = parseInt(id);
      if (updatedShows[showId]) {
        updatedShows[showId] = { ...updatedShows[showId], ...update };
      }
    });

    this.stateManager.set('shows', updatedShows, action);
    logger.info(`Batch updated ${Object.keys(updates).length} shows`);
  }

  /**
   * Replace all shows (use for import operations)
   */
  replaceAllShows(shows: ShowDatabase, action: string = 'replace all shows'): void {
    this.stateManager.set('shows', shows, action);
    logger.info(`Replaced all shows: ${Object.keys(shows).length} shows`);
  }

  /**
   * Subscribe to show changes
   */
  subscribeToShows(callback: (shows: ShowDatabase) => void): () => void {
    return this.stateManager.subscribe('shows', (newValue) => {
      callback(newValue as ShowDatabase);
    });
  }

  /**
   * Subscribe to filtered shows changes
   */
  subscribeToFilteredShows(callback: (shows: ShowDatabase) => void): () => void {
    return this.stateManager.subscribe('filteredShows', (newValue) => {
      callback(newValue as ShowDatabase);
    });
  }

  /**
   * Subscribe to stats changes
   */
  subscribeToStats(callback: (stats: ShowStats) => void): () => void {
    return this.stateManager.subscribe('stats', (newValue) => {
      callback(newValue as ShowStats);
    });
  }

  /**
   * Subscribe to filter changes
   */
  subscribeToFilters(callback: (filters: ShowFilters) => void): () => void {
    return this.stateManager.subscribe('filters', (newValue) => {
      callback(newValue as ShowFilters);
    });
  }

  /**
   * Subscribe to week view data changes
   */
  subscribeToWeekView(callback: (weekData: Record<AirDay, Show[]>) => void): () => void {
    return this.stateManager.subscribe('weekViewData', (newValue) => {
      callback(newValue as Record<AirDay, Show[]>);
    });
  }

  /**
   * Subscribe to any state change
   */
  subscribeToAllChanges(callback: (path: string, newValue: unknown, oldValue: unknown) => void): () => void {
    return this.stateManager.subscribe('*', (newValue, oldValue, path) => {
      callback(path, newValue, oldValue);
    });
  }

  /**
   * Undo last change
   */
  undo(): boolean {
    return this.stateManager.undo();
  }

  /**
   * Redo last undone change
   */
  redo(): boolean {
    return this.stateManager.redo();
  }

  /**
   * Check if undo is available
   */
  canUndo(): boolean {
    return this.stateManager.canUndo();
  }

  /**
   * Check if redo is available
   */
  canRedo(): boolean {
    return this.stateManager.canRedo();
  }

  /**
   * Get history information
   */
  getHistoryInfo(): { canUndo: boolean; canRedo: boolean; currentIndex: number; size: number } {
    return this.stateManager.getHistoryInfo();
  }

  /**
   * Load persisted state
   */
  load(): boolean {
    const loaded = this.stateManager.load();
    if (loaded) {
      logger.info('ReactiveShowManager state loaded from storage');
    }
    return loaded;
  }

  /**
   * Clear persisted state
   */
  clearPersisted(): void {
    this.stateManager.clearPersisted();
    logger.info('ReactiveShowManager persisted state cleared');
  }

  /**
   * Reset to initial state
   */
  reset(initialShows: ShowDatabase): void {
    this.stateManager.reset();
    this.initializeState(initialShows);
    this.defineComputedProperties();
    logger.info('ReactiveShowManager reset to initial state');
  }

  /**
   * Get direct access to state manager (for advanced use)
   */
  getStateManager(): StateManager {
    return this.stateManager;
  }

  /**
   * Get current state snapshot
   */
  getStateSnapshot(): Record<string, unknown> {
    return this.stateManager.getAll();
  }
}
