/**
 * Component exports for the TV Show Guide application
 */

// Base component foundation
export { BaseComponent } from '../core/BaseComponent.js';
export type { ComponentOptions, DefaultProps, ComponentMethod, EventHandler } from '../core/BaseComponent.js';

// Show display components
export { ShowCard } from './ShowCard.js';
export type { ShowCardProps } from './ShowCard.js';

// Filter and search components
export { FilterControls } from './FilterControls.js';
export type { FilterControlsProps, FilterState } from './FilterControls.js';

export { SearchBox } from './SearchBox.js';
export type { SearchBoxProps } from './SearchBox.js';

// Week navigation components
export { WeekNavigator } from './WeekNavigator.js';
export type { WeekNavigatorProps } from './WeekNavigator.js';

// Statistics and reporting components
export { StatsDisplay } from './StatsDisplay.js';
export type { StatsDisplayProps, ShowStats } from './StatsDisplay.js';