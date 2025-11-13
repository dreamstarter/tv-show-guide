/**
 * WeekViewTable Component
 * Displays shows in a weekly calendar grid grouped by day of the week
 */

import { BaseComponent, BaseProps } from './BaseComponent.js';
import { ShowCard } from './ShowCard.js';
import { ReactiveShowManager } from '../state/ReactiveShowManager.js';
import { Show, ShowDatabase, AirDay } from '../types/index.js';

/**
 * Props for WeekViewTable component
 */
export interface WeekViewTableProps extends BaseProps {
  /** Reactive show manager instance */
  manager: ReactiveShowManager;
  /** Optional callback when show edit button is clicked */
  onShowEdit?: (show: Show) => void;
  /** Whether to show edit buttons on show cards */
  showEditButton?: boolean;
}

/**
 * WeekViewTable component
 * Displays shows grouped by day of the week in a calendar-style layout
 */
export class WeekViewTable extends BaseComponent<WeekViewTableProps> {
  private manager: ReactiveShowManager;
  private showCards: Map<string, ShowCard> = new Map();
  private weekShows: Record<AirDay, ShowDatabase> = {
    Sunday: {},
    Monday: {},
    Tuesday: {},
    Wednesday: {},
    Thursday: {},
    Friday: {},
    Saturday: {}
  };
  private readonly days: readonly AirDay[] = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
  ];

  constructor(props: WeekViewTableProps) {
    super(props);
    this.manager = props.manager;
  }

  /**
   * Render the week view table
   */
  protected render(): string {
    return `
      <div class="week-view-table">
        <div class="week-grid">
          ${this.renderDayColumns()}
        </div>
      </div>
    `;
  }

  /**
   * Render all day columns
   */
  private renderDayColumns(): string {
    return this.days
      .map(day => this.renderDayColumn(day))
      .join('');
  }

  /**
   * Render a single day column
   */
  private renderDayColumn(day: AirDay): string {
    const dayShows = this.weekShows[day];
    const showCount = Object.keys(dayShows).length;

    return `
      <div class="day-column" data-day="${day}">
        <div class="day-header">
          <h3 class="day-name">${day}</h3>
          <span class="show-count">${showCount} show${showCount !== 1 ? 's' : ''}</span>
        </div>
        <div class="day-shows" data-day-shows="${day}">
          ${showCount === 0 ? this.renderEmptyDay() : this.renderDayShowList(day)}
        </div>
      </div>
    `;
  }

  /**
   * Render empty state for a day with no shows
   */
  private renderEmptyDay(): string {
    return `
      <div class="empty-day">
        <svg class="empty-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
        <p class="empty-message">No shows on this day</p>
      </div>
    `;
  }

  /**
   * Render list of shows for a day
   */
  private renderDayShowList(day: AirDay): string {
    const dayShows = this.weekShows[day];
    
    return Object.entries(dayShows)
      .sort(([, a], [, b]) => a.t.localeCompare(b.t))
      .map(([id]) => this.renderShowRow(id))
      .join('');
  }

  /**
   * Render a single show row container
   */
  private renderShowRow(id: string): string {
    return `
      <div class="week-show-row" data-show-id="${id}">
        <div class="show-card-container"></div>
      </div>
    `;
  }

  /**
   * Component mounted - set up subscriptions and create show cards
   */
  protected override onMount(): void {
    // Subscribe to week shows changes
    this.subscribeToWeekShows();
    
    // Subscribe to week offset changes to refresh the view
    this.addSubscription(
      this.manager.subscribeToWeekOffset(() => {
        this.subscribeToWeekShows();
      })
    );
  }

  /**
   * Subscribe to week shows and re-render when they change
   */
  private subscribeToWeekShows(): void {
    this.addSubscription(
      this.manager.subscribeToWeekView((weekData) => {
        // Convert array format to ShowDatabase format
        const convertedWeekShows: Record<AirDay, ShowDatabase> = {
          Sunday: {},
          Monday: {},
          Tuesday: {},
          Wednesday: {},
          Thursday: {},
          Friday: {},
          Saturday: {}
        };

        // Convert Show[] to ShowDatabase for each day
        this.days.forEach(day => {
          const showsForDay = weekData[day];
          showsForDay.forEach((show, index) => {
            // ShowDatabase uses numeric IDs
            const numericId = index;
            convertedWeekShows[day][numericId] = show;
          });
        });

        // Update internal state
        this.weekShows = convertedWeekShows;
        
        // Re-render the component
        this.update({});
        
        // Recreate show cards after DOM update
        this.cleanupShowCards();
        this.createShowCards();
      })
    );
  }

  /**
   * Create ShowCard instances for all shows in the week
   */
  private createShowCards(): void {
    this.days.forEach(day => {
      const dayShows = this.weekShows[day];
      
      Object.entries(dayShows).forEach(([id, show]) => {
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
   * Get all shows currently displayed in the week view
   */
  public getWeekShows(): Record<AirDay, ShowDatabase> {
    return { ...this.weekShows };
  }

  /**
   * Get shows for a specific day
   */
  public getShowsForDay(day: AirDay): ShowDatabase {
    return { ...this.weekShows[day] };
  }

  /**
   * Get the total number of shows in the week
   */
  public getTotalShowCount(): number {
    return this.days.reduce((total, day) => {
      return total + Object.keys(this.weekShows[day]).length;
    }, 0);
  }

  /**
   * Get show count for a specific day
   */
  public getShowCountForDay(day: AirDay): number {
    return Object.keys(this.weekShows[day]).length;
  }

  /**
   * Get a specific show card instance
   */
  public getShowCard(showId: string): ShowCard | undefined {
    return this.showCards.get(showId);
  }

  /**
   * Scroll to a specific show by its ID
   */
  public scrollToShow(showId: string): void {
    const showCard = this.showCards.get(showId);
    if (showCard) {
      const cardElement = this.query<HTMLElement>(`[data-show-id="${showId}"]`);
      if (cardElement) {
        cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }

  /**
   * Highlight a specific day column
   */
  public highlightDay(day: AirDay): void {
    // Remove existing highlights
    this.queryAll('.day-column.highlighted').forEach(col => {
      col.classList.remove('highlighted');
    });

    // Add highlight to specified day
    const dayColumn = this.query<HTMLElement>(`[data-day="${day}"]`);
    if (dayColumn) {
      dayColumn.classList.add('highlighted');
    }
  }

  /**
   * Clear all day highlights
   */
  public clearHighlights(): void {
    this.queryAll('.day-column.highlighted').forEach(col => {
      col.classList.remove('highlighted');
    });
  }
}
