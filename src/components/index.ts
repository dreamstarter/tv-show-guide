/**
 * Component exports for the TV Show Guide application
 */

// Base component foundation
export { BaseComponent } from '../core/BaseComponent.js';
export type { ComponentOptions, DefaultProps, ComponentMethod, EventHandler } from '../core/BaseComponent.js';

// Show display components
export { ShowCard } from './ShowCard.js';
export type { ShowCardProps, TVShow } from './ShowCard.js';
export { showToTVShow } from './ShowCard.js';

// Filter and search components
export { FilterControls } from './FilterControls.js';
export type { FilterControlsProps, FilterOptions } from './FilterControls.js';

export { SearchBox } from './SearchBox.js';
export type { SearchBoxProps } from './SearchBox.js';

// Statistics and reporting components
export { StatsDisplay } from './StatsDisplay.js';
export type { StatsDisplayProps, ShowStats } from './StatsDisplay.js';