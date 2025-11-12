/**
 * Show Management Module
 * Handles all show-related operations, filtering, and data manipulation
 */

import { Show, ShowDatabase, Platform, Network, AirDay } from '../types/index.js';
import { logger } from '../utils/logger.js';

export interface ShowFilters {
  platforms?: Platform[];
  networks?: Network[];
  returning?: boolean;
  airDays?: AirDay[];
  searchTerm?: string;
}

export interface ShowStats {
  total: number;
  returning: number;
  nonReturning: number;
  byPlatform: Record<Platform, number>;
  byNetwork: Record<Network, number>;
}

/**
 * Show Management Service
 */
export class ShowManager {
  private shows: ShowDatabase;

  constructor(shows: ShowDatabase) {
    this.shows = shows;
  }

  /**
   * Get all shows
   */
  getAllShows(): ShowDatabase {
    return { ...this.shows };
  }

  /**
   * Get shows filtered by criteria
   */
  getFilteredShows(filters: ShowFilters = {}): ShowDatabase {
    const filtered: ShowDatabase = {};

    Object.entries(this.shows).forEach(([id, show]) => {
      if (this.matchesFilters(show, filters)) {
        filtered[parseInt(id)] = show;
      }
    });

    return filtered;
  }

  /**
   * Get shows by platform
   */
  getShowsByPlatform(platform: Platform): ShowDatabase {
    return this.getFilteredShows({ platforms: [platform] });
  }

  /**
   * Get shows by network
   */
  getShowsByNetwork(network: Network): ShowDatabase {
    return this.getFilteredShows({ networks: [network] });
  }

  /**
   * Get shows airing on specific day
   */
  getShowsByAirDay(airDay: AirDay): ShowDatabase {
    return this.getFilteredShows({ airDays: [airDay] });
  }

  /**
   * Search shows by title
   */
  searchShows(searchTerm: string): ShowDatabase {
    return this.getFilteredShows({ searchTerm });
  }

  /**
   * Get returning shows only
   */
  getReturningShows(): ShowDatabase {
    return this.getFilteredShows({ returning: true });
  }

  /**
   * Get non-returning shows only
   */
  getNonReturningShows(): ShowDatabase {
    return this.getFilteredShows({ returning: false });
  }

  /**
   * Get show statistics
   */
  getStats(): ShowStats {
    const stats: ShowStats = {
      total: 0,
      returning: 0,
      nonReturning: 0,
      byPlatform: { hulu: 0, peacock: 0, paramount: 0 },
      byNetwork: { ABC: 0, NBC: 0, CBS: 0, FOX: 0 }
    };

    Object.values(this.shows).forEach(show => {
      stats.total++;
      
      if (show.ret) {
        stats.returning++;
      } else {
        stats.nonReturning++;
      }

      stats.byPlatform[show.c]++;
      stats.byNetwork[show.net]++;
    });

    return stats;
  }

  /**
   * Update a show
   */
  updateShow(id: number, updates: Partial<Show>): boolean {
    if (!this.shows[id]) {
      logger.warn(`Show with ID ${id} not found`);
      return false;
    }

    this.shows[id] = { ...this.shows[id], ...updates };
    logger.info(`Show ${id} updated`);
    return true;
  }

  /**
   * Add a new show
   */
  addShow(id: number, show: Show): boolean {
    if (this.shows[id]) {
      logger.warn(`Show with ID ${id} already exists`);
      return false;
    }

    this.shows[id] = show;
    logger.info(`Show ${id} added`);
    return true;
  }

  /**
   * Remove a show
   */
  removeShow(id: number): boolean {
    if (!this.shows[id]) {
      logger.warn(`Show with ID ${id} not found`);
      return false;
    }

    delete this.shows[id];
    logger.info(`Show ${id} removed`);
    return true;
  }

  /**
   * Check if a show matches the given filters
   */
  private matchesFilters(show: Show, filters: ShowFilters): boolean {
    // Platform filter
    if (filters.platforms && filters.platforms.length > 0) {
      if (!filters.platforms.includes(show.c)) {
        return false;
      }
    }

    // Network filter
    if (filters.networks && filters.networks.length > 0) {
      if (!filters.networks.includes(show.net)) {
        return false;
      }
    }

    // Returning status filter
    if (filters.returning !== undefined) {
      if (show.ret !== filters.returning) {
        return false;
      }
    }

    // Air day filter
    if (filters.airDays && filters.airDays.length > 0) {
      if (!show.air || !filters.airDays.includes(show.air as AirDay)) {
        return false;
      }
    }

    // Search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      const titleMatch = show.t.toLowerCase().includes(searchLower);
      const networkMatch = show.net.toLowerCase().includes(searchLower);
      const platformMatch = show.c.toLowerCase().includes(searchLower);
      
      if (!titleMatch && !networkMatch && !platformMatch) {
        return false;
      }
    }

    return true;
  }
}