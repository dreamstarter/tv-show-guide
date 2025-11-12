/**
 * Component architecture demonstration
 * Shows how to use the new component system
 */

import { ShowCard, FilterControls, SearchBox, StatsDisplay } from '../components/index.js';
import type { TVShow, FilterOptions, ShowStats } from '../components/index.js';
import { logger } from '../utils/logger.js';

/**
 * Demo component usage and integration
 */
export class ComponentDemo {
  private showCard?: ShowCard;
  private filterControls?: FilterControls;
  private searchBox?: SearchBox;
  private statsDisplay?: StatsDisplay;

  /**
   * Initialize the component demonstration
   */
  init(): void {
    logger.info('Initializing component architecture demo');

    // Demo data
    const sampleShow: TVShow = {
      id: 1,
      name: 'Breaking Bad',
      network: 'AMC',
      platform: 'hulu',
      status: 'Completed',
      startDate: '2008-01-20',
      endDate: '2013-09-29',
      watchedEpisodes: 62,
      totalEpisodes: 62,
      isFavorite: true
    };

    const sampleStats: ShowStats = {
      total: 25,
      watching: 8,
      completed: 12,
      onHold: 3,
      planToWatch: 2,
      dropped: 0,
      totalEpisodes: 1250,
      watchedEpisodes: 800,
      averageProgress: 64,
      favoriteCount: 5,
      platformBreakdown: {
        hulu: 10,
        peacock: 8,
        paramount: 7
      },
      networkBreakdown: {
        NBC: 8,
        ABC: 7,
        CBS: 6,
        FOX: 4
      }
    };

    const filterOptions: FilterOptions = {
      platforms: [],
      networks: [],
      statuses: [],
      sortBy: 'name',
      sortOrder: 'asc',
      showCompleted: true,
      showFavorites: false
    };

    try {
      // Create and mount components
      this.createShowCard(sampleShow);
      this.createSearchBox();
      this.createFilterControls(filterOptions);
      this.createStatsDisplay(sampleStats);

      // Set up component communication
      this.setupComponentCommunication();

      logger.info('Component demo initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize component demo', error);
    }
  }

  /**
   * Create and mount ShowCard component
   */
  private createShowCard(show: TVShow): void {
    this.showCard = new ShowCard({
      show,
      showControls: true,
      onEdit: (show: TVShow) => logger.info('Edit clicked for:', show.name),
      onDelete: (show: TVShow) => logger.info('Delete clicked for:', show.name),
      onToggleFavorite: (show: TVShow) => logger.info('Favorite toggled for:', show.name)
    });

    // Mount to demo container (would need to exist in HTML)
    const container = document.querySelector('#demo-show-card');
    if (container) {
      this.showCard.mount(container as HTMLElement);
    }
  }

  /**
   * Create and mount SearchBox component
   */
  private createSearchBox(): void {
    this.searchBox = new SearchBox({
      placeholder: 'Search your shows...',
      debounceMs: 300,
      minChars: 2,
      showClearButton: true,
      onSearch: (query: string) => logger.info('Search query:', query),
      onClear: () => logger.info('Search cleared')
    });

    const container = document.querySelector('#demo-search-box');
    if (container) {
      this.searchBox.mount(container as HTMLElement);
    }
  }

  /**
   * Create and mount FilterControls component
   */
  private createFilterControls(options: FilterOptions): void {
    this.filterControls = new FilterControls({
      options,
      availablePlatforms: ['hulu', 'peacock', 'paramount'],
      availableNetworks: ['ABC', 'NBC', 'CBS', 'FOX'],
      availableStatuses: ['Watching', 'Completed', 'On Hold', 'Plan to Watch', 'Dropped'],
      onFilterChange: (filters: Partial<FilterOptions>) => logger.info('Filters changed:', filters),
      onReset: () => logger.info('Filters reset')
    });

    const container = document.querySelector('#demo-filter-controls');
    if (container) {
      this.filterControls.mount(container as HTMLElement);
    }
  }

  /**
   * Create and mount StatsDisplay component
   */
  private createStatsDisplay(stats: ShowStats): void {
    this.statsDisplay = new StatsDisplay({
      stats,
      showDetailed: false,
      animated: true,
      onViewChange: (view: 'summary' | 'detailed') => logger.info('Stats view changed to:', view)
    });

    const container = document.querySelector('#demo-stats-display');
    if (container) {
      this.statsDisplay.mount(container as HTMLElement);
    }
  }

  /**
   * Set up communication between components
   */
  private setupComponentCommunication(): void {
    // Example: When search changes, update other components
    if (this.searchBox) {
      this.searchBox.getElement()?.addEventListener('search-execute', (event: Event) => {
        const customEvent = event as CustomEvent;
        logger.info('Search executed, could update show list:', customEvent.detail);
        
        // Could trigger filter updates, show list refresh, etc.
      });
    }

    // Example: When filters change, update stats
    if (this.filterControls) {
      this.filterControls.getElement()?.addEventListener('filter-change', (event: Event) => {
        const customEvent = event as CustomEvent;
        logger.info('Filters changed, could update stats:', customEvent.detail);
        
        // Could recalculate stats based on new filters
      });
    }

    // Example: When show card actions happen
    if (this.showCard) {
      this.showCard.getElement()?.addEventListener('favorite-toggle', (event: Event) => {
        const customEvent = event as CustomEvent;
        logger.info('Show favorited, could update stats:', customEvent.detail);
        
        // Could update favorite count in stats
      });
    }
  }

  /**
   * Clean up all components
   */
  destroy(): void {
    this.showCard?.unmount();
    this.searchBox?.unmount();
    this.filterControls?.unmount();
    this.statsDisplay?.unmount();

    logger.info('Component demo destroyed');
  }

  /**
   * Get all mounted components for external access
   */
  getComponents(): {
    showCard: ShowCard | undefined;
    searchBox: SearchBox | undefined;
    filterControls: FilterControls | undefined;
    statsDisplay: StatsDisplay | undefined;
  } {
    return {
      showCard: this.showCard,
      searchBox: this.searchBox,
      filterControls: this.filterControls,
      statsDisplay: this.statsDisplay
    };
  }
}