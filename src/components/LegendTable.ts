/**
 * LegendTable Component - Displays master list of all TV shows
 * 
 * Features:
 * - Displays all shows in a table format
 * - Shows platform, network, title, season info, air day, status
 * - Uses ShowCard components for individual show display
 * - Supports sorting and filtering
 * - Integrates with ReactiveShowManager
 * 
 * @example
 * const legend = new LegendTable({
 *   onShowSelect: (show) => console.log('Selected:', show)
 * });
 * legend.mount(document.querySelector('#legend')!);
 */

import { BaseComponent, BaseProps } from './BaseComponent.js';
import { ShowCard } from './ShowCard.js';
import { ReactiveShowManager } from '../state/ReactiveShowManager.js';
import { Show, ShowDatabase } from '../types/index.js';

/**
 * LegendTable component properties
 */
export interface LegendTableProps extends BaseProps {
  /** Whether to show edit buttons on show cards (default: false) */
  showEditButton?: boolean;
  /** Callback when a show is selected */
  onShowSelect?: (show: Show) => void;
  /** Callback when a show is edited */
  onShowEdit?: (show: Show) => void;
}

/**
 * LegendTable Component - Displays all shows in a master list
 */
export class LegendTable extends BaseComponent<LegendTableProps> {
  private showManager: ReactiveShowManager;
  private showCards: Map<string, ShowCard> = new Map();
  private filteredShows: ShowDatabase = {};
  private unsubscribe: (() => void) | null = null;

  /**
   * Create a new LegendTable instance
   */
  constructor(props: LegendTableProps, showManager: ReactiveShowManager) {
    super(props);
    this.showManager = showManager;
    this.filteredShows = this.showManager.getFilteredShows();
  }

  /**
   * Render the legend table HTML
   */
  protected render(): string {
    const showCount = Object.keys(this.filteredShows).length;

    return `
      <div class="legend-table">
        <div class="legend-table__header">
          <h2 class="legend-table__title">All Shows</h2>
          <div class="legend-table__count">${showCount} ${showCount === 1 ? 'show' : 'shows'}</div>
        </div>
        
        <div class="legend-table__content">
          ${showCount === 0 ? this.renderEmptyState() : this.renderShowList()}
        </div>
      </div>
    `;
  }

  /**
   * Render empty state when no shows match filters
   */
  private renderEmptyState(): string {
    return `
      <div class="legend-table__empty">
        <div class="empty-state">
          <div class="empty-state__icon">📺</div>
          <div class="empty-state__message">No shows found</div>
          <div class="empty-state__hint">Try adjusting your filters</div>
        </div>
      </div>
    `;
  }

  /**
   * Render list of shows
   */
  private renderShowList(): string {
    const shows = Object.entries(this.filteredShows);
    
    // Sort shows by title
    shows.sort(([, a], [, b]) => a.t.localeCompare(b.t));

    return `
      <div class="legend-table__list">
        ${shows.map(([id, show]) => this.renderShowRow(id, show)).join('')}
      </div>
    `;
  }

  /**
   * Render individual show row
   */
  private renderShowRow(id: string, _show: Show): string {
    return `
      <div class="legend-table__row" data-show-id="${this.escapeHtml(id)}">
        <div class="show-card-container"></div>
      </div>
    `;
  }

  /**
   * Called after component is mounted
   */
  protected override onMount(): void {
    // Create ShowCard instances for each show
    this.createShowCards();

    // Subscribe to filtered shows changes
    this.unsubscribe = this.showManager.subscribeToFilteredShows((shows) => {
      this.filteredShows = shows;
      
      if (this.mounted) {
        // Clean up old show cards
        this.cleanupShowCards();
        
        // Re-render
        this.update(this.props);
        
        // Create new show cards
        this.createShowCards();
      }
    });

    // Track the subscription for cleanup
    if (this.unsubscribe) {
      this.addSubscription(this.unsubscribe);
    }
  }

  /**
   * Create ShowCard components for each show
   */
  private createShowCards(): void {
    const shows = Object.entries(this.filteredShows);
    
    shows.forEach(([id, show]) => {
      const row = this.query<HTMLElement>(`[data-show-id="${id}"]`);
      if (row) {
        const container = row.querySelector('.show-card-container') as HTMLElement;
        if (container) {
          const showCardProps: { show: Show; showEditButton: boolean; onEdit?: (show: Show) => void } = {
            show,
            showEditButton: this.props.showEditButton ?? false
          };
          
          if (this.props.onShowEdit) {
            showCardProps.onEdit = this.props.onShowEdit;
          }
          
          const showCard = new ShowCard(showCardProps);
          
          showCard.mount(container);
          this.showCards.set(id, showCard);
          
          // Add click listener for show selection
          const cardElement = container.querySelector('.show-card');
          if (cardElement) {
            this.addEventListener(cardElement, 'click', () => {
              if (this.props.onShowSelect) {
                this.props.onShowSelect(show);
              }
            });
          }
        }
      }
    });
  }

  /**
   * Clean up all show card components
   */
  private cleanupShowCards(): void {
    this.showCards.forEach(card => {
      card.destroy();
    });
    this.showCards.clear();
  }

  /**
   * Called before component is unmounted
   */
  protected override onUnmount(): void {
    this.cleanupShowCards();
  }

  /**
   * Get all currently displayed shows
   */
  getShows(): ShowDatabase {
    return { ...this.filteredShows };
  }

  /**
   * Get show count
   */
  getShowCount(): number {
    return Object.keys(this.filteredShows).length;
  }

  /**
   * Get a specific show card by ID
   */
  getShowCard(id: string): ShowCard | undefined {
    return this.showCards.get(id);
  }

  /**
   * Scroll to a specific show
   */
  scrollToShow(showTitle: string): void {
    const showEntry = Object.entries(this.filteredShows).find(([, show]) => show.t === showTitle);
    if (showEntry) {
      const [id] = showEntry;
      const row = this.query<HTMLElement>(`[data-show-id="${id}"]`);
      if (row) {
        row.scrollIntoView({ behavior: 'smooth', block: 'center' });
        row.classList.add('highlight');
        setTimeout(() => row.classList.remove('highlight'), 2000);
      }
    }
  }
}
