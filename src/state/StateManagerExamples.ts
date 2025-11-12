/**
 * StateManager Example Usage
 * 
 * This file demonstrates all the features of the StateManager:
 * - Basic state operations (get, set, delete)
 * - Observers and subscriptions
 * - Computed properties
 * - Undo/redo functionality
 * - State persistence
 * - Batch updates
 */

import { StateManager } from './StateManager.js';
import { logger } from '../utils/logger.js';

/**
 * Example 1: Basic State Operations
 */
export function basicStateExample(): void {
  logger.info('=== Basic State Operations ===');
  
  const stateManager = new StateManager({
    persistenceKey: 'example-basic',
    enablePersistence: false,
    enableHistory: true,
  });

  // Set state values
  stateManager.set('user.name', 'John Doe', 'set user name');
  stateManager.set('user.email', 'john@example.com', 'set user email');
  stateManager.set('settings.theme', 'dark', 'set theme');

  // Get state values
  const name = stateManager.get<string>('user.name');
  const email = stateManager.get<string>('user.email');
  const theme = stateManager.get<string>('settings.theme');
  
  logger.info('User:', { name, email });
  logger.info('Theme:', theme);

  // Check if state exists
  logger.info('Has user.name:', stateManager.has('user.name'));
  logger.info('Has user.age:', stateManager.has('user.age'));

  // Delete state
  stateManager.delete('settings.theme', 'delete theme');
  logger.info('Has theme after delete:', stateManager.has('settings.theme'));
}

/**
 * Example 2: Observers and Subscriptions
 */
export function observersExample(): void {
  logger.info('=== Observers and Subscriptions ===');
  
  const stateManager = new StateManager({ enablePersistence: false });

  // Subscribe to specific state changes
  const unsubscribeCount = stateManager.subscribe('counter', (newValue, oldValue, path) => {
    logger.info(`Counter changed from ${oldValue} to ${newValue} at ${path}`);
  });

  // Subscribe to all state changes with wildcard
  const unsubscribeAll = stateManager.subscribe('*', (newValue, oldValue, path) => {
    logger.info(`State changed at ${path}: ${oldValue} -> ${newValue}`);
  });

  // Trigger state changes
  stateManager.set('counter', 0, 'initialize counter');
  stateManager.set('counter', 1, 'increment counter');
  stateManager.set('counter', 2, 'increment counter');
  stateManager.set('other.value', 'test', 'set other value');

  // Unsubscribe
  unsubscribeCount();
  unsubscribeAll();
  
  logger.info('Unsubscribed from observers');
  stateManager.set('counter', 3, 'increment counter'); // Won't trigger observers
}

/**
 * Example 3: Computed Properties
 */
export function computedPropertiesExample(): void {
  logger.info('=== Computed Properties ===');
  
  const stateManager = new StateManager({ enablePersistence: false });

  // Set base values
  stateManager.set('cart.items', [
    { name: 'Apple', price: 1.50, quantity: 3 },
    { name: 'Banana', price: 0.75, quantity: 5 },
    { name: 'Orange', price: 2.00, quantity: 2 },
  ], 'initialize cart');

  // Define computed property for total price
  stateManager.defineComputed(
    'cart.total',
    () => {
      const items = stateManager.get<Array<{ price: number; quantity: number }>>('cart.items') || [];
      return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },
    ['cart.items'] // Dependencies
  );

  // Define computed property for item count
  stateManager.defineComputed(
    'cart.itemCount',
    () => {
      const items = stateManager.get<Array<{ quantity: number }>>('cart.items') || [];
      return items.reduce((sum, item) => sum + item.quantity, 0);
    },
    ['cart.items']
  );

  // Get computed values
  logger.info('Cart total:', stateManager.get('cart.total'));
  logger.info('Item count:', stateManager.get('cart.itemCount'));

  // Subscribe to computed property changes
  stateManager.subscribe('cart.total', (newValue) => {
    const total = newValue as number;
    logger.info(`Cart total updated: $${total?.toFixed(2) || '0.00'}`);
  });

  // Update cart items - computed properties will automatically recalculate
  stateManager.set('cart.items', [
    { name: 'Apple', price: 1.50, quantity: 5 }, // Changed quantity
    { name: 'Banana', price: 0.75, quantity: 5 },
  ], 'update cart items');

  logger.info('Updated cart total:', stateManager.get('cart.total'));
  logger.info('Updated item count:', stateManager.get('cart.itemCount'));
}

/**
 * Example 4: Undo/Redo Functionality
 */
export function undoRedoExample(): void {
  logger.info('=== Undo/Redo Functionality ===');
  
  const stateManager = new StateManager({
    enablePersistence: false,
    enableHistory: true,
    maxHistorySize: 10,
  });

  // Subscribe to state changes
  stateManager.subscribe('document.content', (newValue) => {
    logger.info('Document content:', newValue);
  });

  // Make some changes
  stateManager.set('document.content', 'Hello', 'type hello');
  stateManager.set('document.content', 'Hello World', 'type world');
  stateManager.set('document.content', 'Hello World!', 'add exclamation');

  logger.info('History info:', stateManager.getHistoryInfo());

  // Undo changes
  logger.info('Undo...');
  stateManager.undo(); // Back to "Hello World"
  logger.info('Current content:', stateManager.get('document.content'));

  logger.info('Undo...');
  stateManager.undo(); // Back to "Hello"
  logger.info('Current content:', stateManager.get('document.content'));

  // Redo changes
  logger.info('Redo...');
  stateManager.redo(); // Forward to "Hello World"
  logger.info('Current content:', stateManager.get('document.content'));

  logger.info('Final history info:', stateManager.getHistoryInfo());
}

/**
 * Example 5: State Persistence
 */
export function persistenceExample(): void {
  logger.info('=== State Persistence ===');
  
  // Create state manager with persistence
  const stateManager1 = new StateManager({
    persistenceKey: 'example-persistence',
    enablePersistence: true,
  });

  // Set some values
  stateManager1.set('user.preferences.theme', 'dark', 'set theme');
  stateManager1.set('user.preferences.language', 'en', 'set language');
  stateManager1.set('user.lastVisit', new Date().toISOString(), 'record visit');

  logger.info('State saved to localStorage');
  logger.info('All state:', stateManager1.getAll());

  // Create new instance and load persisted state
  const stateManager2 = new StateManager({
    persistenceKey: 'example-persistence',
    enablePersistence: true,
  });

  const loaded = stateManager2.load();
  logger.info('State loaded from localStorage:', loaded);
  logger.info('Loaded state:', stateManager2.getAll());

  // Clean up
  stateManager2.clearPersisted();
  logger.info('Persisted state cleared');
}

/**
 * Example 6: Batch Updates
 */
export function batchUpdatesExample(): void {
  logger.info('=== Batch Updates ===');
  
  const stateManager = new StateManager({ enablePersistence: false });

  // Subscribe to changes
  let notificationCount = 0;
  stateManager.subscribe('*', () => {
    notificationCount++;
  });

  // Individual updates trigger multiple notifications
  logger.info('Individual updates:');
  stateManager.set('a', 1, 'set a');
  stateManager.set('b', 2, 'set b');
  stateManager.set('c', 3, 'set c');
  logger.info('Notifications after individual updates:', notificationCount);

  notificationCount = 0;

  // Batch update triggers single notification per property
  logger.info('Batch update:');
  stateManager.batch({
    'x': 10,
    'y': 20,
    'z': 30,
  }, 'batch set coordinates');
  logger.info('Notifications after batch update:', notificationCount);

  logger.info('Final state:', stateManager.getAll());
}

/**
 * Example 7: Integration with TV Show Data
 */
export function tvShowStateExample(): void {
  logger.info('=== TV Show State Integration ===');
  
  const stateManager = new StateManager({
    persistenceKey: 'tv-show-guide-demo',
    enablePersistence: false,
  });

  // Initialize show data
  stateManager.set('shows', {
    1: { id: 1, n: '911', c: 'hulu', l: 'abc', r: true, s: 8, d: 5 },
    2: { id: 2, n: 'Chicago Fire', c: 'peacock', l: 'nbc', r: true, s: 13, d: 3 },
    3: { id: 3, n: 'Grey\'s Anatomy', c: 'hulu', l: 'abc', r: true, s: 22, d: 4 },
  }, 'initialize shows');

  // Set filter state
  stateManager.set('filters.platform', 'all', 'set platform filter');
  stateManager.set('filters.showReturning', true, 'show only returning');
  stateManager.set('ui.currentView', 'all-shows', 'set current view');

  // Define computed property for filtered shows
  stateManager.defineComputed(
    'filteredShows',
    () => {
      interface ShowData { id: number; n: string; c: string; l: string; r: boolean; s: number; d: number }
      const shows = stateManager.get<Record<number, ShowData>>('shows') || {};
      const platformFilter = stateManager.get<string>('filters.platform');
      const showReturning = stateManager.get<boolean>('filters.showReturning');

      const filtered = Object.values(shows).filter(show => {
        if (platformFilter !== 'all' && show.c !== platformFilter) {
          return false;
        }
        if (showReturning && !show.r) {
          return false;
        }
        return true;
      });

      return filtered;
    },
    ['shows', 'filters.platform', 'filters.showReturning']
  );

  // Subscribe to filtered shows changes
  stateManager.subscribe('filteredShows', (newValue) => {
    const shows = newValue as unknown[];
    logger.info(`Filtered shows updated: ${shows?.length || 0} shows`);
  });

  // Test filtering
  logger.info('All shows:', stateManager.get('filteredShows'));
  
  stateManager.set('filters.platform', 'hulu', 'filter by hulu');
  logger.info('Hulu shows:', stateManager.get('filteredShows'));
  
  stateManager.set('filters.platform', 'peacock', 'filter by peacock');
  logger.info('Peacock shows:', stateManager.get('filteredShows'));
}

/**
 * Run all examples
 */
export function runAllExamples(): void {
  logger.info('\n\n🚀 Starting StateManager Examples\n');
  
  basicStateExample();
  logger.info('\n');
  
  observersExample();
  logger.info('\n');
  
  computedPropertiesExample();
  logger.info('\n');
  
  undoRedoExample();
  logger.info('\n');
  
  persistenceExample();
  logger.info('\n');
  
  batchUpdatesExample();
  logger.info('\n');
  
  tvShowStateExample();
  
  logger.info('\n✅ All examples completed\n');
}
