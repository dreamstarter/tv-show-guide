/**
 * Core configuration for the TV Show Guide application
 * Centralized configuration management with environment-specific settings
 */

import { Platform } from '../types/index.js';

export interface EpisodeDefaults {
  ABC: number;
  NBC: number;
  CBS: number;
  FOX: number;
}

export interface AppConfig {
  readonly EPISODE_DEFAULTS: EpisodeDefaults;
  readonly DAY_ORDER: readonly string[];
  readonly PLATFORMS: readonly Platform[];
  readonly STORAGE_KEY: string;
  readonly APP_VERSION: string;
  readonly DEVELOPMENT_MODE: boolean;
}

/**
 * Main application configuration
 */
export const CONFIG: AppConfig = {
  EPISODE_DEFAULTS: { ABC: 18, NBC: 22, CBS: 20, FOX: 13 },
  DAY_ORDER: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const,
  PLATFORMS: ['hulu', 'peacock', 'paramount'] as const,
  STORAGE_KEY: 'showsSeasonData',
  APP_VERSION: '1.0.0',
  DEVELOPMENT_MODE: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
} as const;

/**
 * Theme configuration
 */
export const THEME_CONFIG = {
  DEFAULT_THEME: 'auto',
  STORAGE_KEY: 'selectedTheme',
  THEMES: {
    light: {
      name: 'Light',
      className: 'theme-light'
    },
    dark: {
      name: 'Dark', 
      className: 'theme-dark'
    },
    auto: {
      name: 'Auto',
      className: 'theme-auto'
    }
  }
} as const;

/**
 * UI configuration constants
 */
export const UI_CONFIG = {
  DEBOUNCE_DELAY: 300,
  NOTIFICATION_DURATION: 5000,
  ANIMATION_DURATION: 200,
  MOBILE_BREAKPOINT: 768,
  TABLET_BREAKPOINT: 1024
} as const;

/**
 * Validation configuration
 */
export const VALIDATION_CONFIG = {
  TITLE: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 100
  },
  SEASON: {
    MIN_VALUE: 1,
    MAX_VALUE: 50
  },
  EPISODES: {
    MIN_VALUE: 1,
    MAX_VALUE: 100
  }
} as const;