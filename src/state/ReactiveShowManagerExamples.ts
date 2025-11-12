/**
 * ReactiveShowManager Example Usage
 * Demonstrates how to use the reactive show management system
 */

import { ReactiveShowManager } from './ReactiveShowManager.js';
import { ShowDatabase } from '../types/index.js';
import { logger } from '../utils/logger.js';

/**
 * Sample show data for demonstrations
 */
const sampleShows: ShowDatabase = {
  1: {
    t: '911',
    c: 'hulu',
    net: 'ABC',
    s: 8,
    start: '2025-10-09',
    end: '2026-05-15',
    eps: 18,
    air: 'Thursday',
    ret: true,
  },
  2: {
    t: 'Chicago Fire',
    c: 'peacock',
    net: 'NBC',
    s: 13,
    start: '2025-10-01',
    end: '2026-05-20',
    eps: 22,
    air: 'Wednesday',
    ret: true,
  },
  3: {
    t: "Grey's Anatomy",
    c: 'hulu',
    net: 'ABC',
    s: 22,
    start: '2025-10-05',
    end: '2026-05-18',
    eps: 20,
    air: 'Thursday',
    ret: true,
  },
  4: {
    t: 'Law & Order',
    c: 'peacock',
    net: 'NBC',
    s: 25,
    start: '2025-09-25',
    end: '2026-05-22',
    eps: 22,
    air: 'Thursday',
    ret: true,
  },
  5: {
    t: 'Tracker',
    c: 'paramount',
    net: 'CBS',
    s: 3,
    start: '2025-10-19',
    end: '2026-05-10',
    eps: 22,
    air: 'Sunday',
    ret: true,
  },
};

/**
 * Example 1: Basic ReactiveShowManager Setup
 */
export function basicReactiveExample(): void {
  logger.info('=== Basic ReactiveShowManager Example ===');

  const reactiveManager = new ReactiveShowManager(sampleShows, {
    persistenceKey: 'example-reactive-basic',
    enablePersistence: false,
    enableHistory: true,
  });

  // Get all shows
  const allShows = reactiveManager.getAllShows();
  logger.info('Total shows:', Object.keys(allShows).length);

  // Get statistics (computed property)
  const stats = reactiveManager.getStats();
  logger.info('Statistics:', stats);

  // Get shows by platform (computed property)
  const huluShows = reactiveManager.getShowsByPlatform('hulu');
  logger.info('Hulu shows:', Object.keys(huluShows).length);
}

/**
 * Example 2: Reactive Subscriptions
 */
export function subscriptionsExample(): void {
  logger.info('=== Reactive Subscriptions Example ===');

  const reactiveManager = new ReactiveShowManager(sampleShows, {
    enablePersistence: false,
  });

  // Subscribe to show changes
  const unsubscribeShows = reactiveManager.subscribeToShows((shows) => {
    logger.info(`Shows updated! Total: ${Object.keys(shows).length}`);
  });

  // Subscribe to stats changes
  const unsubscribeStats = reactiveManager.subscribeToStats((stats) => {
    logger.info(`Stats updated! Returning: ${stats.returning}, Non-returning: ${stats.nonReturning}`);
  });

  // Subscribe to filtered shows
  const unsubscribeFiltered = reactiveManager.subscribeToFilteredShows((shows) => {
    logger.info(`Filtered shows updated! Count: ${Object.keys(shows).length}`);
  });

  // Make changes - observers will be notified automatically
  logger.info('\nUpdating show 1...');
  reactiveManager.updateShow(1, { s: 9 }, 'update 911 to season 9');

  logger.info('\nAdding new show...');
  reactiveManager.addShow(6, {
    t: 'New Show',
    c: 'hulu',
    net: 'ABC',
    s: 1,
    start: '2025-11-01',
    end: '2026-05-01',
    eps: 10,
    air: 'Monday',
    ret: true,
  }, 'add new show');

  logger.info('\nRemoving show 6...');
  reactiveManager.removeShow(6, 'remove new show');

  // Clean up subscriptions
  unsubscribeShows();
  unsubscribeStats();
  unsubscribeFiltered();
  logger.info('\nUnsubscribed from all changes');
}

/**
 * Example 3: Filtering and Computed Properties
 */
export function filteringExample(): void {
  logger.info('=== Filtering and Computed Properties Example ===');

  const reactiveManager = new ReactiveShowManager(sampleShows, {
    enablePersistence: false,
  });

  // Subscribe to filtered shows changes
  reactiveManager.subscribeToFilteredShows((shows) => {
    logger.info(`Filtered shows: ${Object.keys(shows).length} shows`);
    Object.values(shows).forEach(show => {
      logger.info(`  - ${show.t} (${show.c})`);
    });
  });

  // Initial state
  logger.info('\nAll shows:');
  const all = reactiveManager.getFilteredShows();
  logger.info(`Count: ${Object.keys(all).length}`);

  // Filter by platform
  logger.info('\nFiltering by Hulu...');
  reactiveManager.setPlatformFilter(['hulu'], 'filter by hulu');

  // Filter by network
  logger.info('\nFiltering by NBC...');
  reactiveManager.clearFilters();
  reactiveManager.setNetworkFilter(['NBC'], 'filter by nbc');

  // Search
  logger.info('\nSearching for "Law"...');
  reactiveManager.clearFilters();
  reactiveManager.setSearchTerm('Law', 'search for law');

  // Clear filters
  logger.info('\nClearing all filters...');
  reactiveManager.clearFilters();
}

/**
 * Example 4: Undo/Redo Functionality
 */
export function undoRedoExample(): void {
  logger.info('=== Undo/Redo Example ===');

  const reactiveManager = new ReactiveShowManager(sampleShows, {
    enablePersistence: false,
    enableHistory: true,
    maxHistorySize: 10,
  });

  // Subscribe to show changes
  reactiveManager.subscribeToShows((shows) => {
    const show1 = shows[1];
    logger.info(`Show 1 season: ${show1?.s || 'N/A'}`);
  });

  // Make changes
  logger.info('\nMaking changes...');
  reactiveManager.updateShow(1, { s: 9 }, 'update to season 9');
  reactiveManager.updateShow(1, { s: 10 }, 'update to season 10');
  reactiveManager.updateShow(1, { s: 11 }, 'update to season 11');

  logger.info('\nHistory info:', reactiveManager.getHistoryInfo());

  // Undo changes
  logger.info('\nUndo...');
  reactiveManager.undo(); // Back to season 10

  logger.info('Undo...');
  reactiveManager.undo(); // Back to season 9

  logger.info('Undo...');
  reactiveManager.undo(); // Back to original (season 8)

  // Redo changes
  logger.info('\nRedo...');
  reactiveManager.redo(); // Forward to season 9

  logger.info('Redo...');
  reactiveManager.redo(); // Forward to season 10

  logger.info('\nFinal history info:', reactiveManager.getHistoryInfo());
}

/**
 * Example 5: Week View Data
 */
export function weekViewExample(): void {
  logger.info('=== Week View Data Example ===');

  const reactiveManager = new ReactiveShowManager(sampleShows, {
    enablePersistence: false,
  });

  // Subscribe to week view changes
  reactiveManager.subscribeToWeekView((weekData) => {
    logger.info('\nWeek View Updated:');
    Object.entries(weekData).forEach(([day, shows]) => {
      if (shows.length > 0) {
        logger.info(`  ${day}: ${shows.length} show(s)`);
        shows.forEach(show => {
          logger.info(`    - ${show.t}`);
        });
      }
    });
  });

  // Get week view data (computed property)
  const weekData = reactiveManager.getWeekViewData();
  logger.info('\nInitial week view:');
  Object.entries(weekData).forEach(([day, shows]) => {
    logger.info(`${day}: ${shows.length} show(s)`);
  });

  // Filter by platform - week view automatically updates
  logger.info('\nFiltering by Hulu...');
  reactiveManager.setPlatformFilter(['hulu']);

  // Clear filter
  logger.info('\nClearing filter...');
  reactiveManager.clearFilters();
}

/**
 * Example 6: Batch Operations
 */
export function batchOperationsExample(): void {
  logger.info('=== Batch Operations Example ===');

  const reactiveManager = new ReactiveShowManager(sampleShows, {
    enablePersistence: false,
    enableHistory: true,
  });

  let updateCount = 0;
  reactiveManager.subscribeToShows(() => {
    updateCount++;
    logger.info(`Update notification ${updateCount}`);
  });

  // Individual updates - multiple notifications
  logger.info('\nIndividual updates:');
  reactiveManager.updateShow(1, { s: 9 });
  reactiveManager.updateShow(2, { s: 14 });
  reactiveManager.updateShow(3, { s: 23 });
  logger.info(`Total notifications: ${updateCount}`);

  // Reset counter
  updateCount = 0;

  // Batch update - single notification
  logger.info('\nBatch update:');
  reactiveManager.batchUpdateShows({
    1: { s: 10 },
    2: { s: 15 },
    3: { s: 24 },
  }, 'batch season update');
  logger.info(`Total notifications: ${updateCount}`);

  // Undo batch operation
  logger.info('\nUndo batch operation...');
  reactiveManager.undo();
  logger.info('Batch operation undone!');
}

/**
 * Example 7: Persistence
 */
export function persistenceExample(): void {
  logger.info('=== Persistence Example ===');

  // Create manager with persistence
  const reactiveManager1 = new ReactiveShowManager(sampleShows, {
    persistenceKey: 'example-reactive-persistence',
    enablePersistence: true,
  });

  // Make some changes
  reactiveManager1.updateShow(1, { s: 10 }, 'update season');
  reactiveManager1.setPlatformFilter(['hulu']);

  logger.info('State saved automatically');
  logger.info('Current filtered shows:', Object.keys(reactiveManager1.getFilteredShows()).length);

  // Create new instance and load persisted state
  const reactiveManager2 = new ReactiveShowManager({}, {
    persistenceKey: 'example-reactive-persistence',
    enablePersistence: true,
  });

  const loaded = reactiveManager2.load();
  logger.info('State loaded:', loaded);

  if (loaded) {
    logger.info('Loaded shows:', Object.keys(reactiveManager2.getAllShows()).length);
    logger.info('Loaded filtered shows:', Object.keys(reactiveManager2.getFilteredShows()).length);
  }

  // Clean up
  reactiveManager2.clearPersisted();
  logger.info('Persisted state cleared');
}

/**
 * Example 8: Real-world Integration Pattern
 */
export function integrationPatternExample(): void {
  logger.info('=== Integration Pattern Example ===');

  const reactiveManager = new ReactiveShowManager(sampleShows, {
    enablePersistence: true,
    enableHistory: true,
  });

  // Simulate UI components subscribing to state
  logger.info('Setting up UI subscriptions...');

  // All Shows view subscription
  const unsubAllShows = reactiveManager.subscribeToFilteredShows((shows) => {
    logger.info('[All Shows View] Render with', Object.keys(shows).length, 'shows');
  });

  // Week View subscription
  const unsubWeekView = reactiveManager.subscribeToWeekView((weekData) => {
    const totalShows = Object.values(weekData).reduce((sum, shows) => sum + shows.length, 0);
    logger.info('[Week View] Render with', totalShows, 'shows across all days');
  });

  // Stats display subscription
  const unsubStats = reactiveManager.subscribeToStats((stats) => {
    logger.info('[Stats Display] Total:', stats.total, 'Returning:', stats.returning);
  });

  // History controls subscription
  const unsubHistory = reactiveManager.subscribeToAllChanges(() => {
    const historyInfo = reactiveManager.getHistoryInfo();
    logger.info('[History Controls] Can Undo:', historyInfo.canUndo, 'Can Redo:', historyInfo.canRedo);
  });

  // Simulate user interactions
  logger.info('\n[User Action] Apply platform filter...');
  reactiveManager.setPlatformFilter(['hulu', 'peacock']);

  logger.info('\n[User Action] Update show...');
  reactiveManager.updateShow(1, { eps: 20 }, 'user edited episode count');

  logger.info('\n[User Action] Undo change...');
  reactiveManager.undo();

  logger.info('\n[User Action] Clear filters...');
  reactiveManager.clearFilters();

  // Clean up subscriptions
  unsubAllShows();
  unsubWeekView();
  unsubStats();
  unsubHistory();
  logger.info('\nAll subscriptions cleaned up');
}

/**
 * Run all examples
 */
export function runAllReactiveExamples(): void {
  logger.info('\n\n🚀 Starting ReactiveShowManager Examples\n');

  basicReactiveExample();
  logger.info('\n');

  subscriptionsExample();
  logger.info('\n');

  filteringExample();
  logger.info('\n');

  undoRedoExample();
  logger.info('\n');

  weekViewExample();
  logger.info('\n');

  batchOperationsExample();
  logger.info('\n');

  persistenceExample();
  logger.info('\n');

  integrationPatternExample();

  logger.info('\n✅ All reactive examples completed\n');
}
