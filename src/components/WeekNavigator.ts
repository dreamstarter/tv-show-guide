/**
 * WeekNavigator Component - Provides week navigation controls
 * 
 * Features:
 * - Previous week button
 * - "This Week" button (reset to current week)
 * - Next week button
 * - Week range display (Sunday - Saturday)
 * - Jump to date picker
 * - Integrates with ReactiveShowManager week offset
 * 
 * @example
 * const navigator = new WeekNavigator({
 *   onWeekChange: (offset) => console.log('Week offset:', offset)
 * });
 * navigator.mount(document.querySelector('#week-nav')!);
 */

import { BaseComponent, BaseProps } from './BaseComponent.js';
import { ReactiveShowManager } from '../state/ReactiveShowManager.js';

/**
 * WeekNavigator component properties
 */
export interface WeekNavigatorProps extends BaseProps {
  /** Callback when week changes */
  onWeekChange?: (offset: number) => void;
  /** Whether to show the date picker (default: true) */
  showDatePicker?: boolean;
}

/**
 * WeekNavigator Component - Manages week navigation
 */
export class WeekNavigator extends BaseComponent<WeekNavigatorProps> {
  private showManager: ReactiveShowManager;
  private currentOffset: number = 0;
  private unsubscribe: (() => void) | null = null;

  /**
   * Create a new WeekNavigator instance
   */
  constructor(props: WeekNavigatorProps, showManager: ReactiveShowManager) {
    super(props);
    this.showManager = showManager;
    this.currentOffset = this.showManager.getWeekOffset();
  }

  /**
   * Render the week navigator HTML
   */
  protected render(): string {
    const { showDatePicker = true } = this.props;
    const weekRange = this.getWeekRangeDisplay();

    return `
      <div class="week-navigator">
        <div class="week-navigator__controls">
          <button 
            type="button" 
            class="btn btn--icon prev-week-btn" 
            title="Previous week"
            aria-label="Previous week"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
            </svg>
          </button>

          <button 
            type="button" 
            class="btn btn--secondary current-week-btn"
            title="Jump to current week"
          >
            This Week
          </button>

          <button 
            type="button" 
            class="btn btn--icon next-week-btn"
            title="Next week"
            aria-label="Next week"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
            </svg>
          </button>
        </div>

        <div class="week-navigator__display">
          <div class="week-range">
            ${weekRange}
          </div>
          ${this.currentOffset !== 0 ? `
            <div class="week-offset-badge">
              ${this.currentOffset > 0 ? '+' : ''}${this.currentOffset} ${Math.abs(this.currentOffset) === 1 ? 'week' : 'weeks'}
            </div>
          ` : ''}
        </div>

        ${showDatePicker ? `
          <div class="week-navigator__picker">
            <label for="week-date-picker" class="sr-only">Jump to date</label>
            <input 
              type="date" 
              id="week-date-picker"
              class="date-picker"
              title="Jump to specific date"
            />
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * Get week range display string
   */
  private getWeekRangeDisplay(): string {
    const weekRange = this.calculateWeekRange(this.currentOffset);
    const startDate = this.formatDate(weekRange.startDate);
    const endDate = this.formatDate(weekRange.endDate);
    
    return `${startDate} – ${endDate}`;
  }

  /**
   * Calculate week range for given offset
   */
  private calculateWeekRange(offset: number): { startDate: Date; endDate: Date } {
    const now = new Date();
    const currentDay = now.getDay();
    const daysToSunday = currentDay === 0 ? 0 : -currentDay;
    
    const startDate = new Date(now);
    startDate.setDate(now.getDate() + daysToSunday + (offset * 7));
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);
    
    return { startDate, endDate };
  }

  /**
   * Format date for display
   */
  private formatDate(date: Date): string {
    const month = date.toLocaleString('en-US', { month: 'short' });
    const day = date.getDate();
    const year = date.getFullYear();
    
    return `${month} ${day}, ${year}`;
  }

  /**
   * Called after component is mounted
   */
  protected override onMount(): void {
    // Previous week button
    const prevBtn = this.query<HTMLButtonElement>('.prev-week-btn');
    if (prevBtn) {
      this.addEventListener(prevBtn, 'click', this.handlePreviousWeek.bind(this));
    }

    // Current week button
    const currentBtn = this.query<HTMLButtonElement>('.current-week-btn');
    if (currentBtn) {
      this.addEventListener(currentBtn, 'click', this.handleCurrentWeek.bind(this));
    }

    // Next week button
    const nextBtn = this.query<HTMLButtonElement>('.next-week-btn');
    if (nextBtn) {
      this.addEventListener(nextBtn, 'click', this.handleNextWeek.bind(this));
    }

    // Date picker
    const datePicker = this.query<HTMLInputElement>('.date-picker');
    if (datePicker) {
      this.addEventListener(datePicker, 'change', this.handleDatePick.bind(this));
    }

    // Subscribe to week offset changes from ReactiveShowManager
    this.unsubscribe = this.showManager.subscribeToWeekOffset((offset) => {
      this.currentOffset = offset;
      if (this.mounted) {
        this.update(this.props);
      }
    });

    // Track the subscription for cleanup
    if (this.unsubscribe) {
      this.addSubscription(this.unsubscribe);
    }
  }

  /**
   * Handle previous week button click
   */
  private handlePreviousWeek(event: Event): void {
    event.preventDefault();
    this.showManager.previousWeek();
    
    if (this.props.onWeekChange) {
      this.props.onWeekChange(this.currentOffset - 1);
    }
  }

  /**
   * Handle current week button click
   */
  private handleCurrentWeek(event: Event): void {
    event.preventDefault();
    this.showManager.currentWeek();
    
    if (this.props.onWeekChange) {
      this.props.onWeekChange(0);
    }
  }

  /**
   * Handle next week button click
   */
  private handleNextWeek(event: Event): void {
    event.preventDefault();
    this.showManager.nextWeek();
    
    if (this.props.onWeekChange) {
      this.props.onWeekChange(this.currentOffset + 1);
    }
  }

  /**
   * Handle date picker change
   */
  private handleDatePick(event: Event): void {
    const input = event.target as HTMLInputElement;
    const selectedDate = new Date(input.value);
    
    if (!isNaN(selectedDate.getTime())) {
      // Calculate offset from current week
      const now = new Date();
      const currentDay = now.getDay();
      const daysToSunday = currentDay === 0 ? 0 : -currentDay;
      
      const currentWeekStart = new Date(now);
      currentWeekStart.setDate(now.getDate() + daysToSunday);
      currentWeekStart.setHours(0, 0, 0, 0);
      
      const selectedDay = selectedDate.getDay();
      const daysToSelectedSunday = selectedDay === 0 ? 0 : -selectedDay;
      
      const selectedWeekStart = new Date(selectedDate);
      selectedWeekStart.setDate(selectedDate.getDate() + daysToSelectedSunday);
      selectedWeekStart.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((selectedWeekStart.getTime() - currentWeekStart.getTime()) / (1000 * 60 * 60 * 24));
      const weekOffset = Math.floor(daysDiff / 7);
      
      this.showManager.setWeekOffset(weekOffset);
      
      if (this.props.onWeekChange) {
        this.props.onWeekChange(weekOffset);
      }
    }
  }

  /**
   * Get current week offset
   */
  getWeekOffset(): number {
    return this.currentOffset;
  }

  /**
   * Set week offset programmatically
   */
  setWeekOffset(offset: number): void {
    this.showManager.setWeekOffset(offset);
  }

  /**
   * Jump to specific date
   */
  jumpToDate(date: Date): void {
    const datePicker = this.query<HTMLInputElement>('.date-picker');
    if (datePicker) {
      const isoString = date.toISOString();
      const dateString = isoString.split('T')[0];
      if (dateString) {
        datePicker.value = dateString;
        
        // Trigger change event
        const event = new Event('change', { bubbles: true });
        datePicker.dispatchEvent(event);
      }
    }
  }
}
