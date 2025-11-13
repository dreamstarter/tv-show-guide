/**
 * ShowCard Component - Displays a single TV show with all its information
 * 
 * Features:
 * - Platform chip (Hulu, Peacock, Paramount)
 * - Network badge (ABC, NBC, CBS, FOX)
 * - Show title with returning/ended status styling
 * - Season information (number, start/end dates)
 * - Air day display
 * - Edit button with click handler
 * 
 * @example
 * const card = new ShowCard({
 *   show: myShow,
 *   onEdit: (show) => console.log('Edit:', show)
 * });
 * card.mount(document.querySelector('#container')!);
 */

import { BaseComponent, BaseProps } from './BaseComponent.js';
import { Show } from '../types/index.js';

/**
 * ShowCard component properties
 */
export interface ShowCardProps extends BaseProps {
  /** The show data to display */
  show: Show;
  /** Optional callback when edit button is clicked */
  onEdit?: (show: Show) => void;
  /** Optional search term to highlight in the title */
  searchTerm?: string;
  /** Whether to show the edit button (default: false) */
  showEditButton?: boolean;
}

/**
 * ShowCard Component - Displays information for a single TV show
 */
export class ShowCard extends BaseComponent<ShowCardProps> {
  
  /**
   * Create a new ShowCard instance
   */
  constructor(props: ShowCardProps) {
    super(props);
  }

  /**
   * Render the show card HTML
   */
  protected render(): string {
    const { show, searchTerm, showEditButton = false } = this.props;
    
    // Determine status class (returning or ended)
    const statusClass = show.ret ? '' : 'ended';
    
    // Format platform display (capitalize)
    const platformDisplay = show.c.charAt(0).toUpperCase() + show.c.slice(1);
    
    // Format season info
    const seasonInfo = this.formatSeasonInfo(show);
    
    // Format air day
    const airDay = show.air || 'TBD';
    
    // Highlight search term in title if provided
    const displayTitle = searchTerm 
      ? this.highlightSearchTerm(show.t, searchTerm)
      : this.escapeHtml(show.t);
    
    return `
      <div class="show-card__header">
        <span class="${show.c} chip">${platformDisplay}</span>
        ${show.net ? `<span class="${show.net.toLowerCase()}-logo network-badge">${show.net}</span>` : ''}
      </div>
      <div class="show-card__content">
        <h3 class="show-title ${statusClass}">${displayTitle}</h3>
        <div class="show-card__meta">
          <div class="show-meta-item">
            <span class="meta-label">Air Day:</span>
            <span class="meta-value">${airDay}</span>
          </div>
          ${seasonInfo ? `
            <div class="show-meta-item">
              <span class="meta-label">Season:</span>
              <span class="meta-value">${seasonInfo}</span>
            </div>
          ` : ''}
          <div class="show-meta-item">
            <span class="meta-label">Status:</span>
            <span class="meta-value status-${show.ret ? 'returning' : 'ended'}">
              ${show.ret ? 'Returning' : 'Ended'}
            </span>
          </div>
        </div>
      </div>
      ${showEditButton ? `
        <div class="show-card__actions">
          <button class="btn btn--small edit-btn" type="button" data-show-title="${this.escapeHtml(show.t)}">
            Edit
          </button>
        </div>
      ` : ''}
    `;
  }

  /**
   * Format season information for display
   */
  private formatSeasonInfo(show: Show): string {
    const seasonNum = show.s ? `S${show.s}` : 'S?';
    
    if (!show.start && !show.end) {
      return `${seasonNum}: TBD`;
    }
    
    if (show.start && show.end) {
      return `${seasonNum}: ${show.start} – ${show.end}`;
    }
    
    if (show.start) {
      return `${seasonNum}: ${show.start} – Present`;
    }
    
    return `${seasonNum}`;
  }

  /**
   * Highlight search term in text
   */
  private highlightSearchTerm(text: string, searchTerm: string): string {
    if (!searchTerm) {
      return this.escapeHtml(text);
    }
    
    const escapedText = this.escapeHtml(text);
    const escapedSearchTerm = this.escapeRegex(searchTerm);
    const regex = new RegExp(`(${escapedSearchTerm})`, 'gi');
    
    return escapedText.replace(regex, '<mark>$1</mark>');
  }

  /**
   * Escape special regex characters
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Called after component is mounted
   */
  protected override onMount(): void {
    // Set up edit button listener if edit button is shown
    if (this.props.showEditButton) {
      const editBtn = this.query<HTMLButtonElement>('.edit-btn');
      if (editBtn) {
        this.addEventListener(editBtn, 'click', this.handleEdit.bind(this));
      }
    }
  }

  /**
   * Handle edit button click
   */
  private handleEdit(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    
    if (this.props.onEdit) {
      this.props.onEdit(this.props.show);
    }
  }

  /**
   * Update component with new show data
   */
  updateShow(show: Show): void {
    this.update({ ...this.props, show });
  }

  /**
   * Update search term highlighting
   */
  updateSearchTerm(searchTerm: string): void {
    this.update({ ...this.props, searchTerm });
  }

  /**
   * Get the show data from this card
   */
  getShow(): Show {
    return this.props.show;
  }
}