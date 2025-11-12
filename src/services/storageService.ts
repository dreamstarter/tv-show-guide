/**
 * Data storage service for persisting show data to localStorage
 */

import { ShowDatabase, SeasonData } from '../types/index.js';
import { logger } from '../utils/logger.js';

export class StorageService {
  private readonly storageKey: string;

  constructor(storageKey = 'showsSeasonData') {
    this.storageKey = storageKey;
  }

  /**
   * Loads show data from localStorage
   */
  loadData(shows: ShowDatabase): void {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) {
      return;
    }

    try {
      const data = JSON.parse(raw);
      Object.keys(data).forEach(k => {
        const showId = parseInt(k);
        if (shows[showId]) {
          Object.assign(shows[showId], data[k]);
        }
      });
      logger.info('Data loaded successfully');
    } catch (error) {
      logger.warn('Failed to load saved data:', error);
    }
  }

  /**
   * Saves show data to localStorage
   */
  saveData(shows: ShowDatabase): void {
    try {
      const out: Record<string, SeasonData> = {};
      
      Object.keys(shows).forEach(k => {
        const show = shows[parseInt(k)];
        if (show) {
          const { s, start, end, eps, air, ret } = show;
          const seasonData: SeasonData = {};
          
          if (s !== null) {
            seasonData.s = s;
          }
          if (start) {
            seasonData.start = start;
          }
          if (end) {
            seasonData.end = end;
          }
          if (eps !== null) {
            seasonData.eps = eps;
          }
          if (air) {
            seasonData.air = air;
          }
          if (ret !== undefined) {
            seasonData.ret = ret;
          }
          
          out[k] = seasonData;
        }
      });
      
      localStorage.setItem(this.storageKey, JSON.stringify(out));
      logger.info('Data saved successfully');
    } catch (error) {
      logger.warn('Failed to save data:', error);
    }
  }
}