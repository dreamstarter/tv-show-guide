/**
 * TV Show Guide Application - Main Entry Point
 * Modern modular architecture with TypeScript
 */

import { SeasonData, ShowDatabase } from './types/index.js';
import { Application } from './core/Application.js';
import { ShowManager } from './modules/showManager.js';
import { ReactiveShowManager } from './state/ReactiveShowManager.js';
import { DOMIntegration } from './core/DOMIntegration.js';
import { logger } from './utils/logger.js';

// Show database - this will eventually be moved to a data module
const shows: ShowDatabase = {
  1: { t: '911', c: 'hulu', net: 'ABC', s: null, start: '', end: '', eps: null, air: 'Thursday', ret: true },
  2: { t: '911 Lonestar', c: 'hulu', net: 'FOX', s: null, start: '', end: '', eps: null, air: 'Tuesday', ret: true },
  3: { t: '911 Nashville', c: 'hulu', net: 'ABC', s: null, start: '', end: '', eps: null, air: 'Thursday', ret: true },
  4: { t: 'Brilliant Minds', c: 'peacock', net: 'NBC', s: null, start: '', end: '', eps: null, air: 'Monday', ret: true },
  5: { t: 'Chicago Fire', c: 'peacock', net: 'NBC', s: null, start: '', end: '', eps: null, air: 'Wednesday', ret: true },
  6: { t: 'Chicago Med', c: 'peacock', net: 'NBC', s: null, start: '', end: '', eps: null, air: 'Wednesday', ret: true },
  7: { t: 'Chicago PD', c: 'peacock', net: 'NBC', s: null, start: '', end: '', eps: null, air: 'Wednesday', ret: true },
  8: { t: 'Doc', c: 'hulu', net: 'FOX', s: null, start: '', end: '', eps: null, air: 'Tuesday', ret: true },
  9: { t: 'Elsbeth', c: 'paramount', net: 'CBS', s: null, start: '', end: '', eps: null, air: 'Thursday', ret: true },
  10: { t: 'Fire Country', c: 'paramount', net: 'CBS', s: null, start: '', end: '', eps: null, air: 'Friday', ret: true },
  11: { t: 'Found', c: 'peacock', net: 'NBC', s: null, start: '', end: '', eps: null, air: 'Wednesday', ret: false },
  12: { t: 'The Good Doctor', c: 'hulu', net: 'ABC', s: null, start: '', end: '', eps: null, air: 'Tuesday', ret: false },
  13: { t: "Grey's Anatomy", c: 'hulu', net: 'ABC', s: null, start: '', end: '', eps: null, air: 'Thursday', ret: true },
  14: { t: 'High County', c: 'hulu', net: 'FOX', s: null, start: '', end: '', eps: null, air: 'Thursday', ret: true },
  15: { t: 'High Potential', c: 'hulu', net: 'ABC', s: null, start: '', end: '', eps: null, air: 'Tuesday', ret: true },
  16: { t: 'The Irrational', c: 'peacock', net: 'NBC', s: null, start: '', end: '', eps: null, air: 'Wednesday', ret: false },
  17: { t: 'Law & Order', c: 'peacock', net: 'NBC', s: null, start: '', end: '', eps: null, air: 'Thursday', ret: true },
  18: { t: 'L&O: Organized Crime', c: 'peacock', net: 'NBC', s: null, start: '', end: '', eps: null, air: 'Thursday', ret: true },
  19: { t: 'L&O: SVU', c: 'peacock', net: 'NBC', s: null, start: '', end: '', eps: null, air: 'Thursday', ret: true },
  20: { t: 'Matlock', c: 'paramount', net: 'CBS', s: null, start: '', end: '', eps: null, air: 'Thursday', ret: true },
  21: { t: 'Murder in a Small Town', c: 'hulu', net: 'FOX', s: null, start: '', end: '', eps: null, air: 'Tuesday', ret: true },
  22: { t: 'New Amsterdam', c: 'peacock', net: 'NBC', s: null, start: '', end: '', eps: null, air: 'Tuesday', ret: false },
  23: { t: 'The Cleaning Lady', c: 'hulu', net: 'FOX', s: null, start: '', end: '', eps: null, air: 'Friday', ret: false },
  24: { t: 'The Conners', c: 'peacock', net: 'ABC', s: null, start: '', end: '', eps: null, air: 'Friday', ret: false },
  25: { t: 'The Resident', c: 'hulu', net: 'FOX', s: null, start: '', end: '', eps: null, air: 'Tuesday', ret: false },
  26: { t: 'Rescue: Hi Surf', c: 'hulu', net: 'FOX', s: null, start: '', end: '', eps: null, air: 'Monday', ret: false },
  27: { t: 'Shifting Gears', c: 'hulu', net: 'ABC', s: null, start: '', end: '', eps: null, air: 'Wednesday', ret: true },
  28: { t: 'Station 19', c: 'hulu', net: 'ABC', s: null, start: '', end: '', eps: null, air: 'Thursday', ret: false },
  29: { t: 'SWAT', c: 'paramount', net: 'CBS', s: null, start: '', end: '', eps: null, air: 'Friday', ret: false },
  30: { t: 'Tracker', c: 'paramount', net: 'CBS', s: null, start: '', end: '', eps: null, air: 'Sunday', ret: true },
  31: { t: 'Watson', c: 'paramount', net: 'CBS', s: null, start: '', end: '', eps: null, air: 'Monday', ret: true },
  32: { t: 'Will Trent', c: 'hulu', net: 'ABC', s: null, start: '', end: '', eps: null, air: 'Tuesday', ret: true }
};

// Preloaded season data - applied during initialization
const preloadSeasonData: Record<string, SeasonData> = {
  "15": { "s": 2, "start": "2025-09-16", "air": "Tuesday", "ret": true },
  "8": { "s": 2, "start": "2025-09-23", "air": "Tuesday", "ret": true },
  "4": { "s": 2, "start": "2025-09-22", "air": "Monday", "ret": true },
  "17": { "s": 25, "start": "2025-09-25", "air": "Thursday", "ret": true },
  "18": { "s": 5, "start": "2025-09-25", "air": "Thursday", "ret": true },
  "19": { "s": 27, "start": "2025-09-25", "air": "Thursday", "ret": true },
  "5": { "s": 14, "start": "2025-10-01", "air": "Wednesday", "ret": true },
  "6": { "s": 11, "start": "2025-10-01", "air": "Wednesday", "ret": true },
  "7": { "s": 13, "start": "2025-10-01", "air": "Wednesday", "ret": true },
  "1": { "s": 9, "start": "2025-10-09", "air": "Thursday", "ret": true },
  "3": { "s": 1, "start": "2025-10-09", "air": "Thursday", "ret": true },
  "13": { "s": 22, "start": "2025-10-09", "air": "Thursday", "ret": true },
  "27": { "s": 2, "start": "2025-10-01", "air": "Wednesday", "ret": true },
  "20": { "s": 2, "start": "2025-10-12", "air": "Thursday", "ret": true },
  "9": { "s": 3, "start": "2025-10-16", "air": "Thursday", "ret": true },
  "31": { "s": 2, "start": "2025-10-13", "air": "Monday", "ret": true },
  "21": { "s": 2, "start": "2025-09-23", "air": "Tuesday", "ret": true },
  "10": { "s": 4, "start": "2025-10-17", "air": "Friday", "ret": true },
  "30": { "s": 3, "start": "2025-10-19", "air": "Sunday", "ret": true },
  "2": { "ret": true, "air": "Tuesday" },
  "32": { "ret": true, "air": "Tuesday" },
  "12": { "ret": false }, "28": { "ret": false }, "22": { "ret": false },
  "25": { "ret": false }, "24": { "ret": false }, "11": { "ret": false },
  "16": { "ret": false }, "23": { "ret": false }, "26": { "ret": false },
  "29": { "ret": false }
};

// Application instances
const app = new Application(shows);
const showManager = new ShowManager(shows); // Legacy - will be phased out
const reactiveShowManager = new ReactiveShowManager(shows, {
  persistenceKey: 'tv-show-guide-state',
  enablePersistence: true,
  enableHistory: true,
  maxHistorySize: 50,
});
const domIntegration = new DOMIntegration(showManager);

/**
 * Apply preloaded season data to shows
 */
function applyPreloadedData(): void {
  Object.keys(preloadSeasonData).forEach(k => {
    const showId = parseInt(k);
    if (shows[showId]) {
      Object.assign(shows[showId], preloadSeasonData[k]);
    }
  });
  logger.info('Preloaded season data applied');
  
  // Update reactive show manager with preloaded data
  reactiveShowManager.replaceAllShows(shows, 'apply preloaded data');
}

/**
 * Legacy app object for backward compatibility
 * This will be phased out as we move to the new Application class
 */
const legacyApp = {
  init: async (): Promise<void> => {
    try {
      // Apply preloaded data
      applyPreloadedData();
      
      // Attach reactive show manager to application
      app.setReactiveShowManager(reactiveShowManager);
      
      // Initialize the new modular application
      await app.init();
      
      // Initialize DOM integration for UI interactions
      domIntegration.init();
      
      logger.info('Application started using new modular architecture with ReactiveShowManager');
    } catch (error) {
      logger.error('Failed to initialize application:', error);
    }
  },

  save: (): void => {
    app.save();
  },

  // Legacy ShowManager methods (kept for backward compatibility)
  getStats: (): ReturnType<typeof showManager.getStats> => {
    return showManager.getStats();
  },

  searchShows: (term: string): ReturnType<typeof showManager.searchShows> => {
    return showManager.searchShows(term);
  },

  getShowsByPlatform: (platform: 'hulu' | 'peacock' | 'paramount'): ReturnType<typeof showManager.getShowsByPlatform> => {
    return showManager.getShowsByPlatform(platform);
  },

  // ReactiveShowManager access methods (new reactive API)
  getReactiveManager: (): ReactiveShowManager => {
    return reactiveShowManager;
  },

  // Reactive versions of common operations
  updateShow: (id: number, updates: Partial<typeof shows[number]>, action?: string): boolean => {
    return reactiveShowManager.updateShow(id, updates, action);
  },

  undo: (): boolean => {
    return reactiveShowManager.undo();
  },

  redo: (): boolean => {
    return reactiveShowManager.redo();
  },

  canUndo: (): boolean => {
    return reactiveShowManager.canUndo();
  },

  canRedo: (): boolean => {
    return reactiveShowManager.canRedo();
  }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => legacyApp.init());
} else {
  legacyApp.init();
}

// Export for potential use by other modules
export { 
  app, 
  showManager, 
  reactiveShowManager,
  shows, 
  legacyApp as appLegacy 
};