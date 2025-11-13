/**
 * AllShowsList Component
 * Displays all filtered shows in an alphabetical list
 */

import { BaseComponent, BaseProps } from './BaseComponent.js';
import { ShowCard } from './ShowCard.js';
import { ReactiveShowManager } from '../state/ReactiveShowManager.js';
import { Show, ShowDatabase } from '../types/index.js';

/**
 * Props for AllShowsList component
 */
export interface AllShowsListProps extends BaseProps {
  /** Reactive show manager instance */
  manager: ReactiveShowManager;
  /** Optional callback when show edit button is clicked */
  onShowEdit?: (show: Show) => void;
  /** Whether to show edit buttons on show cards */
  showEditButton?: boolean;
}

/**
 * AllShowsList component
 * Displays all filtered shows in a single alphabetical list
 */
export class AllShowsList extends BaseComponent<AllShowsListProps> {
  private manager: ReactiveShowManager;
  private showCards: Map<string, ShowCard> = new Map();
  private filteredShows: ShowDatabase = {};

  constructor(props: AllShowsListProps) {
    super(props);
    this.manager = props.manager;
  }

  /**
   * Render the all shows list
   */
  protected render(): string {
    const showCount = Object.keys(this.filteredShows).length;
    
    if (showCount === 0) {
      return this.renderEmptyState();
    }

    return `
      <div class="all-shows-list">
        <div class="list-header">
          <h2>All Shows (Alphabetical)</h2>
          <span class="show-count">${showCount} show${showCount !== 1 ? 's' : ''}</span>
        </div>
        <div class="show-list">
          ${this.renderShowList()}
        </div>
      </div>
    `;
  }

  /**
   * Render empty state when no shows match filters
   */
  private renderEmptyState(): string {
    return `
      <div class="all-shows-list">
        <div class="empty-state">
          <svg class="empty-icon" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="3" width="20" height="18" rx="2" ry="2"></rect>
            <line x1="8" y1="21" x2="16" y2="21"></line>
            <line x1="12" y1="17" x2="12" y2="21"></line>
            <line x1="7" y1="7" x2="17" y2="7"></line>
            <line x1="7" y1="11" x2="17" y2="11"></line>
          </svg>
          <p class="empty-message">No shows match the current filters</p>
          <p class="empty-hint">Try adjusting your platform or search filters</p>
        </div>
      </div>
    `;
  }

  /**
   * Render list of shows
   */
  private renderShowList(): string {
    return Object.entries(this.filteredShows)
      .sort(([, a], [, b]) => a.t.localeCompare(b.t))
      .map(([id]) => this.renderShowRow(id))
      .join('');
  }

  /**
   * Render a single show row container
   */
  private renderShowRow(id: string): string {
    return `
      <div class="all-shows-row" data-show-id="${id}">
        <div class="show-card-container"></div>
      </div>
    `;
  }

  /**
   * Component mounted - set up subscriptions and create show cards
   */
  protected override onMount(): void {
    this.subscribeToFilteredShows();
  }

  /**
   * Subscribe to filtered shows and re-render when they change
   */
  private subscribeToFilteredShows(): void {
    this.addSubscription(
      this.manager.subscribeToFilteredShows((filteredShows) => {
        // Update internal state
        this.filteredShows = filteredShows;
        
        // Re-render the component
        this.update({});
        
        // Recreate show cards after DOM update
        this.cleanupShowCards();
        this.createShowCards();
      })
    );
  }

  /**
   * Create ShowCard instances for all shows
   */
  private createShowCards(): void {
    Object.entries(this.filteredShows).forEach(([id, show]) => {
      const row = this.query<HTMLElement>(`[data-show-id="${id}"]`);
      if (row) {
        const container = row.querySelector('.show-card-container') as HTMLElement;
        if (container) {
          // Conditionally construct props to satisfy exactOptionalPropertyTypes
          const showCardProps: {
            show: Show;
            showEditButton: boolean;
            onEdit?: (show: Show) => void;
          } = {
            show,
            showEditButton: this.props.showEditButton ?? false
          };
          
          if (this.props.onShowEdit) {
            showCardProps.onEdit = this.props.onShowEdit;
          }
          
          const showCard = new ShowCard(showCardProps);
          showCard.mount(container);
          this.showCards.set(id, showCard);
        }
      }
    });
  }

  /**
   * Clean up all show card instances
   */
  private cleanupShowCards(): void {
    this.showCards.forEach(card => card.destroy());
    this.showCards.clear();
  }

  /**
   * Component unmounting - cleanup show cards
   */
  protected override onUnmount(): void {
    this.cleanupShowCards();
  }

  /**
   * Get all shows currently displayed
   */
  public getShows(): ShowDatabase {
    return { ...this.filteredShows };
  }

  /**
   * Get the total number of shows
   */
  public getShowCount(): number {
    return Object.keys(this.filteredShows).length;
  }

  /**
   * Get a specific show card instance
   */
  public getShowCard(showId: string): ShowCard | undefined {
    return this.showCards.get(showId);
  }

  /**
   * Scroll to a specific show by title
   */
  public scrollToShow(title: string): void {
    // Find the show ID by title
    const entry = Object.entries(this.filteredShows).find(([, show]) => 
      show.t.toLowerCase() === title.toLowerCase()
    );
    
    if (entry) {
      const [id] = entry;
      const showCard = this.showCards.get(id);
      if (showCard) {
        const cardElement = this.query<HTMLElement>(`[data-show-id="${id}"]`);
        if (cardElement) {
          cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  }
}
