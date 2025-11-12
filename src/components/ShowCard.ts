import { BaseComponent } from '../core/BaseComponent.js';
import { Show } from '../types/index.js';
import { formatDate } from '../utils/dateUtils.js';

// Extended interface for component usage with normalized property names
export interface TVShow {
  id: number;
  name: string;
  network: string;
  platform: string;
  status: string;
  startDate?: string;
  endDate?: string;
  watchedEpisodes: number;
  totalEpisodes: number;
  isFavorite: boolean;
}

// Utility function to convert Show to TVShow
export function showToTVShow(id: number, show: Show): TVShow {
  return {
    id,
    name: show.t,
    network: show.net,
    platform: show.c,
    status: show.ret ? 'Returning' : 'Ended',
    startDate: show.start,
    endDate: show.end,
    watchedEpisodes: 0, // This would come from tracking data
    totalEpisodes: show.eps || 0,
    isFavorite: false // This would come from user preferences
  };
}

export interface ShowCardProps {
  show: TVShow;
  onEdit?: (show: TVShow) => void;
  onDelete?: (show: TVShow) => void;
  onToggleFavorite?: (show: TVShow) => void;
  showControls?: boolean;
}

/**
 * ShowCard component for displaying individual TV show information
 */
export class ShowCard extends BaseComponent<ShowCardProps> {
  constructor(props: ShowCardProps) {
    super(props, {
      className: 'show-card',
      attributes: {
        'data-show-id': props.show.id.toString(),
        'data-show-name': props.show.name
      }
    });
  }

  /**
   * Render the show card HTML
   */
  render(): string {
    const { show, showControls = true } = this.props;
    const statusClass = this.getStatusClass(show.status);
    const favoriteClass = show.isFavorite ? 'favorite' : '';

    return `
      <div class="show-card-content ${statusClass} ${favoriteClass}">
        ${this.renderHeader()}
        ${this.renderDetails()}
        ${this.renderProgress()}
        ${showControls ? this.renderControls() : ''}
      </div>
    `;
  }

  /**
   * Render show header with title and favorite button
   */
  private renderHeader(): string {
    const { show } = this.props;
    
    return `
      <div class="show-header">
        <h3 class="show-title">${this.escapeHtml(show.name)}</h3>
        <button class="favorite-btn" data-action="toggle-favorite" title="${show.isFavorite ? 'Remove from favorites' : 'Add to favorites'}">
          <span class="favorite-icon">${show.isFavorite ? '★' : '☆'}</span>
        </button>
      </div>
    `;
  }

  /**
   * Render show details (network, status, dates)
   */
  private renderDetails(): string {
    const { show } = this.props;
    
    return `
      <div class="show-details">
        ${show.network ? `<div class="show-network">${this.escapeHtml(show.network)}</div>` : ''}
        <div class="show-status status-${show.status.toLowerCase()}">${show.status}</div>
        ${show.startDate ? `<div class="show-date">Started: ${formatDate(new Date(show.startDate))}</div>` : ''}
        ${show.endDate ? `<div class="show-date">Ended: ${formatDate(new Date(show.endDate))}</div>` : ''}
      </div>
    `;
  }

  /**
   * Render progress information
   */
  private renderProgress(): string {
    const { show } = this.props;
    const progressPercent = show.totalEpisodes > 0 
      ? Math.round((show.watchedEpisodes / show.totalEpisodes) * 100) 
      : 0;

    return `
      <div class="show-progress">
        <div class="progress-info">
          <span class="progress-text">
            ${show.watchedEpisodes} / ${show.totalEpisodes} episodes
          </span>
          <span class="progress-percent">${progressPercent}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${progressPercent}%"></div>
        </div>
      </div>
    `;
  }

  /**
   * Render control buttons
   */
  private renderControls(): string {
    return `
      <div class="show-controls">
        <button class="btn btn-sm btn-primary" data-action="edit" title="Edit show">
          Edit
        </button>
        <button class="btn btn-sm btn-danger" data-action="delete" title="Delete show">
          Delete
        </button>
      </div>
    `;
  }

  /**
   * Get CSS class based on show status
   */
  private getStatusClass(status: string): string {
    const statusMap: Record<string, string> = {
      'Watching': 'status-watching',
      'Completed': 'status-completed',
      'On Hold': 'status-on-hold',
      'Plan to Watch': 'status-plan-to-watch',
      'Dropped': 'status-dropped'
    };
    return statusMap[status] || 'status-unknown';
  }

  /**
   * Escape HTML to prevent XSS
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Set up event listeners for card interactions
   */
  protected override setupEventListeners(): void {
    // Favorite toggle
    this.addEventListener('[data-action="toggle-favorite"]', 'click', (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
      this.handleFavoriteToggle();
    });

    // Edit button
    this.addEventListener('[data-action="edit"]', 'click', (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
      this.handleEdit();
    });

    // Delete button
    this.addEventListener('[data-action="delete"]', 'click', (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
      this.handleDelete();
    });

    // Card click (for selection/details)
    this.addEventListener('self', 'click', (event: Event) => {
      const target = event.target as HTMLElement;
      // Only handle clicks on the card itself, not buttons
      if (!target.closest('button')) {
        this.handleCardClick();
      }
    });
  }

  /**
   * Handle favorite toggle
   */
  private handleFavoriteToggle(): void {
    const { show, onToggleFavorite } = this.props;
    
    if (onToggleFavorite) {
      onToggleFavorite(show);
    }

    // Emit custom event
    this.emit('favorite-toggle', { show });
  }

  /**
   * Handle edit action
   */
  private handleEdit(): void {
    const { show, onEdit } = this.props;
    
    if (onEdit) {
      onEdit(show);
    }

    // Emit custom event
    this.emit('show-edit', { show });
  }

  /**
   * Handle delete action
   */
  private handleDelete(): void {
    const { show, onDelete } = this.props;
    
    if (onDelete) {
      onDelete(show);
    }

    // Emit custom event
    this.emit('show-delete', { show });
  }

  /**
   * Handle card click
   */
  private handleCardClick(): void {
    const { show } = this.props;
    
    // Emit custom event for card selection
    this.emit('show-select', { show });
  }

  /**
   * Update show data
   */
  updateShow(show: TVShow): void {
    this.update({ show });
  }

  /**
   * Toggle controls visibility
   */
  toggleControls(visible: boolean): void {
    this.update({ showControls: visible });
  }

  /**
   * Get show data
   */
  getShow(): TVShow {
    return this.props.show;
  }
}