/**
 * Core data types for the TV Show Guide application
 */

export type Platform = 'hulu' | 'peacock' | 'paramount';
export type Network = 'ABC' | 'NBC' | 'CBS' | 'FOX';
export type AirDay = 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

/**
 * Main show object representing a TV show (matches original structure)
 */
export interface Show {
  /** Title of the show */
  t: string;
  /** Platform where show streams */
  c: Platform;
  /** Network that airs the show */
  net: Network;
  /** Current season number (null if not set) */
  s: number | null;
  /** Season start date (ISO format YYYY-MM-DD) */
  start: string;
  /** Season end date (ISO format YYYY-MM-DD) */
  end: string;
  /** Number of episodes in season (null if not set) */
  eps: number | null;
  /** Day of week show airs */
  air: AirDay | '';
  /** Whether show is returning next season */
  ret: boolean;
}

/**
 * Season data for import/export operations (matches PRELOAD_SEASON_DATA structure)
 */
export interface SeasonData {
  /** Season number */
  s?: number;
  /** Season start date */
  start?: string;
  /** Season end date */  
  end?: string;
  /** Number of episodes */
  eps?: number;
  /** Day show airs */
  air?: AirDay | '';
  /** Whether show is returning */
  ret?: boolean;
}

/**
 * Show database mapping show IDs to show objects
 */
export type ShowDatabase = Record<number, Show>;

/**
 * Application configuration
 */
export interface AppConfiguration {
  /** Default episode counts per network */
  EPISODE_DEFAULTS: Record<Network, number>;
  /** Days of the week in order */
  DAY_ORDER: readonly AirDay[];
  /** Available streaming platforms */
  PLATFORMS: readonly Platform[];
  /** Local storage key */
  STORAGE_KEY: string;
}

/**
 * Application filter state
 */
export interface FilterState {
  platforms: Platform[];
  showNonReturning: boolean;
  useEstimates: boolean;
  networkEstimates: Record<Network, boolean>;
}

/**
 * Application state management
 */
export interface AppState {
  shows: ShowDatabase;
  filters: FilterState;
  currentView: 'all' | 'week';
  weekOffset: number;
  searchTerm: string;
}

/**
 * Search functionality types
 */
export interface SearchResult {
  id: number;
  score: number;
}

/**
 * Error handling types
 */
export type ErrorCode = 
  | 'REQUIRED_FIELD'
  | 'INVALID_TYPE'
  | 'OUT_OF_RANGE'
  | 'INVALID_FORMAT'
  | 'INVALID_ENUM_VALUE'
  | 'DATE_LOGIC_ERROR'
  | 'SAVE_FAILED'
  | 'LOAD_FAILED'
  | 'IMPORT_FAILED'
  | 'EXPORT_FAILED'
  | 'NETWORK_ERROR'
  | 'STORAGE_QUOTA_EXCEEDED'
  | 'VALIDATION_ERROR'
  | 'DATA_LOAD_ERROR'
  | 'RENDERING_ERROR'
  | 'SEARCH_ERROR'
  | 'STORAGE_ERROR'
  | 'UNKNOWN_ERROR';

export interface ShowError {
  code: ErrorCode;
  message: string;
  context?: unknown;
  timestamp: Date;
}

/**
 * Notification system types
 */
export type NotificationType = 'error' | 'success' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title?: string;
  message: string;
  duration?: number;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: () => void;
  style?: 'primary' | 'secondary';
}

/**
 * Data import/export types
 */
export interface ImportOptions {
  validateData?: boolean;
  mergeStrategy?: 'replace' | 'merge' | 'skip';
  showProgress?: boolean;
}

export interface ExportOptions {
  format?: 'json' | 'csv';
  includeMetadata?: boolean;
  compress?: boolean;
}

export interface DataImportResult {
  success: boolean;
  imported: number;
  skipped: number;
  errors: string[];
}

/**
 * Date processing utilities
 */
export interface DateRange {
  start: Date;
  end: Date;
}

export interface WeekData {
  startDate: Date;
  endDate: Date;
  shows: Record<AirDay, number[]>;
}

/**
 * Performance monitoring types
 */
export interface PerformanceMetrics {
  renderTime: number;
  searchTime: number;
  dataLoadTime: number;
  memoryUsage?: {
    used: number;
    total: number;
    limit: number;
  };
}

/**
 * Event system types
 */
export type EventType = 
  | 'show-updated'
  | 'filter-changed'
  | 'view-changed'
  | 'search-performed'
  | 'data-imported'
  | 'error-occurred';

export interface AppEvent<T = unknown> {
  type: EventType;
  data: T;
  timestamp: Date;
}

export type EventListener<T = unknown> = (event: AppEvent<T>) => void;

/**
 * Utility types for better type safety
 */
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & Record<string, never>;

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & globalThis.Required<Pick<T, K>>;

/**
 * DOM element type helpers
 */
export type HTMLElementTagName = keyof HTMLElementTagNameMap;
export type QueryResult<T extends HTMLElementTagName> = HTMLElementTagNameMap[T] | null;

/**
 * Function type utilities
 */
export type AsyncFunction<T = unknown, R = unknown> = (data: T) => Promise<R>;
export type SyncFunction<T = unknown, R = unknown> = (data: T) => R;
export type AnyFunction = (...args: unknown[]) => unknown;