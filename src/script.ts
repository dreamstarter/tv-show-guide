/**
 * TV Show Guide Application - TypeScript Version
 * Manages TV show data with season information, streaming platforms, and weekly scheduling
 */

import { 
  SeasonData,
  ShowDatabase,
  AppConfiguration
} from './types/index.js';

import * as ShowValidation from './validation.js';
import { StorageService } from './services/storageService.js';
import { StateService } from './services/stateService.js';
import { logger } from './utils/logger.js';

// Configuration and Constants
const CONFIG: AppConfiguration = {
  EPISODE_DEFAULTS: { ABC: 18, NBC: 22, CBS: 20, FOX: 13 },
  DAY_ORDER: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const,
  PLATFORMS: ['hulu', 'peacock', 'paramount'] as const,
  STORAGE_KEY: 'showsSeasonData'
};

// Services
const storageService = new StorageService(CONFIG.STORAGE_KEY);
const stateService = new StateService();

// Show database
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

// State management (using StateService)
// appState is now managed by stateService

// Initialize error handler
const errorHandler = new ShowValidation.ErrorHandler();

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
};

// Application object
const app = {
  init: (): void => {
    try {
      // Apply preloaded data
      Object.keys(preloadSeasonData).forEach(k => {
        const showId = parseInt(k);
        if (shows[showId]) {
          Object.assign(shows[showId], preloadSeasonData[k]);
        }
      });

      // Load saved data
      storageService.loadData(shows);
      
      // Initialize views
      app.reRender();
      app.bindEvents();
      
      logger.info('TV Show Guide initialized with TypeScript!');
    } catch (error) {
      errorHandler.handleError(
        error instanceof Error ? error : new Error(String(error)), 
        true, 
        'Application initialization'
      );
    }
  },

  reRender: (): void => {
    try {
      // For now, just show a basic message - full rendering will be added
      logger.info('Rendering views... TS version working!');
    } catch (error) {
      errorHandler.handleError(
        error instanceof Error ? error : new Error(String(error)), 
        true, 
        'Re-rendering views'
      );
    }
  },

  saveData: (): void => {
    storageService.saveData(shows);
  },

  bindEvents: (): void => {
    // Basic event binding - will be expanded
    logger.info('Events bound');
  }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', app.init);
} else {
  app.init();
}

// Export for potential use by other modules
export { 
  app, 
  shows, 
  CONFIG, 
  storageService, 
  stateService 
};