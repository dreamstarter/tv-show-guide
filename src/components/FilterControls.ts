import { BaseComponent } from '../core/BaseComponent.js';
import { Platform, Network } from '../types/index.js';

export interface FilterOptions {
  platforms: Platform[];
  networks: Network[];
  statuses: string[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  showCompleted: boolean;
  showFavorites: boolean;
}

export interface FilterControlsProps {
  options: FilterOptions;
  availablePlatforms: Platform[];
  availableNetworks: Network[];
  availableStatuses: string[];
  onFilterChange?: (filters: Partial<FilterOptions>) => void;
  onReset?: () => void;
}

/**
 * FilterControls component for managing show filtering and sorting
 */
export class FilterControls extends BaseComponent<FilterControlsProps> {
  constructor(props: FilterControlsProps) {
    super(props, {
      className: 'filter-controls',
      attributes: {
        'role': 'region',
        'aria-label': 'Filter and sort controls'
      }
    });
  }

  /**
   * Render the filter controls HTML
   */
  render(): string {
    return `
      <div class="filter-controls-content">
        <div class="filter-header">
          <h3 class="filter-title">Filter & Sort</h3>
          <button class="btn btn-sm btn-outline" data-action="toggle-collapse" title="Toggle filters">
            <span class="toggle-icon">▼</span>
          </button>
        </div>
        <div class="filter-body">
          ${this.renderPlatformFilters()}
          ${this.renderNetworkFilters()}
          ${this.renderStatusFilters()}
          ${this.renderSortControls()}
          ${this.renderToggleOptions()}
          ${this.renderActions()}
        </div>
      </div>
    `;
  }

  /**
   * Render platform filter checkboxes
   */
  private renderPlatformFilters(): string {
    const { options, availablePlatforms } = this.props;
    
    return `
      <div class="filter-group">
        <label class="filter-label">Platforms</label>
        <div class="filter-options">
          ${availablePlatforms.map(platform => `
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                value="${platform}" 
                data-filter="platform"
                ${options.platforms.includes(platform) ? 'checked' : ''}
              >
              <span class="checkbox-text">${this.capitalizeFirst(platform)}</span>
            </label>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Render network filter checkboxes
   */
  private renderNetworkFilters(): string {
    const { options, availableNetworks } = this.props;
    
    return `
      <div class="filter-group">
        <label class="filter-label">Networks</label>
        <div class="filter-options">
          ${availableNetworks.map(network => `
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                value="${network}" 
                data-filter="network"
                ${options.networks.includes(network) ? 'checked' : ''}
              >
              <span class="checkbox-text">${network}</span>
            </label>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Render status filter checkboxes
   */
  private renderStatusFilters(): string {
    const { options, availableStatuses } = this.props;
    
    return `
      <div class="filter-group">
        <label class="filter-label">Status</label>
        <div class="filter-options">
          ${availableStatuses.map(status => `
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                value="${status}" 
                data-filter="status"
                ${options.statuses.includes(status) ? 'checked' : ''}
              >
              <span class="checkbox-text">${status}</span>
            </label>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Render sort controls
   */
  private renderSortControls(): string {
    const { options } = this.props;
    const sortOptions = [
      { value: 'name', label: 'Name' },
      { value: 'network', label: 'Network' },
      { value: 'platform', label: 'Platform' },
      { value: 'status', label: 'Status' },
      { value: 'startDate', label: 'Start Date' },
      { value: 'progress', label: 'Progress' }
    ];

    return `
      <div class="filter-group">
        <label class="filter-label">Sort By</label>
        <div class="sort-controls">
          <select data-filter="sortBy" class="form-select">
            ${sortOptions.map(option => `
              <option value="${option.value}" ${options.sortBy === option.value ? 'selected' : ''}>
                ${option.label}
              </option>
            `).join('')}
          </select>
          <div class="sort-order">
            <label class="radio-label">
              <input 
                type="radio" 
                name="sortOrder" 
                value="asc" 
                data-filter="sortOrder"
                ${options.sortOrder === 'asc' ? 'checked' : ''}
              >
              <span class="radio-text">A-Z</span>
            </label>
            <label class="radio-label">
              <input 
                type="radio" 
                name="sortOrder" 
                value="desc" 
                data-filter="sortOrder"
                ${options.sortOrder === 'desc' ? 'checked' : ''}
              >
              <span class="radio-text">Z-A</span>
            </label>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render toggle options (completed shows, favorites)
   */
  private renderToggleOptions(): string {
    const { options } = this.props;
    
    return `
      <div class="filter-group">
        <label class="filter-label">Options</label>
        <div class="filter-options">
          <label class="checkbox-label">
            <input 
              type="checkbox" 
              data-filter="showCompleted"
              ${options.showCompleted ? 'checked' : ''}
            >
            <span class="checkbox-text">Show Completed</span>
          </label>
          <label class="checkbox-label">
            <input 
              type="checkbox" 
              data-filter="showFavorites"
              ${options.showFavorites ? 'checked' : ''}
            >
            <span class="checkbox-text">Favorites Only</span>
          </label>
        </div>
      </div>
    `;
  }

  /**
   * Render action buttons
   */
  private renderActions(): string {
    return `
      <div class="filter-actions">
        <button class="btn btn-sm btn-outline" data-action="reset">
          Reset Filters
        </button>
        <button class="btn btn-sm btn-primary" data-action="apply">
          Apply Filters
        </button>
      </div>
    `;
  }

  /**
   * Capitalize first letter of string
   */
  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Set up event listeners for filter controls
   */
  protected override setupEventListeners(): void {
    // Platform checkboxes
    this.addEventListener('[data-filter="platform"]', 'change', (event: Event) => {
      this.handlePlatformChange(event);
    });

    // Network checkboxes
    this.addEventListener('[data-filter="network"]', 'change', (event: Event) => {
      this.handleNetworkChange(event);
    });

    // Status checkboxes
    this.addEventListener('[data-filter="status"]', 'change', (event: Event) => {
      this.handleStatusChange(event);
    });

    // Sort by dropdown
    this.addEventListener('[data-filter="sortBy"]', 'change', (event: Event) => {
      this.handleSortByChange(event);
    });

    // Sort order radio buttons
    this.addEventListener('[data-filter="sortOrder"]', 'change', (event: Event) => {
      this.handleSortOrderChange(event);
    });

    // Toggle options
    this.addEventListener('[data-filter="showCompleted"]', 'change', (event: Event) => {
      this.handleShowCompletedChange(event);
    });

    this.addEventListener('[data-filter="showFavorites"]', 'change', (event: Event) => {
      this.handleShowFavoritesChange(event);
    });

    // Action buttons
    this.addEventListener('[data-action="reset"]', 'click', (event: Event) => {
      event.preventDefault();
      this.handleReset();
    });

    this.addEventListener('[data-action="apply"]', 'click', (event: Event) => {
      event.preventDefault();
      this.handleApply();
    });

    // Toggle collapse
    this.addEventListener('[data-action="toggle-collapse"]', 'click', (event: Event) => {
      event.preventDefault();
      this.handleToggleCollapse();
    });
  }

  /**
   * Handle platform filter change
   */
  private handlePlatformChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const platform = target.value as Platform;
    const { options } = this.props;
    
    let newPlatforms: Platform[];
    if (target.checked) {
      newPlatforms = [...options.platforms, platform];
    } else {
      newPlatforms = options.platforms.filter(p => p !== platform);
    }

    this.emitFilterChange({ platforms: newPlatforms });
  }

  /**
   * Handle network filter change
   */
  private handleNetworkChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const network = target.value as Network;
    const { options } = this.props;
    
    let newNetworks: Network[];
    if (target.checked) {
      newNetworks = [...options.networks, network];
    } else {
      newNetworks = options.networks.filter(n => n !== network);
    }

    this.emitFilterChange({ networks: newNetworks });
  }

  /**
   * Handle status filter change
   */
  private handleStatusChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const status = target.value;
    const { options } = this.props;
    
    let newStatuses: string[];
    if (target.checked) {
      newStatuses = [...options.statuses, status];
    } else {
      newStatuses = options.statuses.filter(s => s !== status);
    }

    this.emitFilterChange({ statuses: newStatuses });
  }

  /**
   * Handle sort by change
   */
  private handleSortByChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.emitFilterChange({ sortBy: target.value });
  }

  /**
   * Handle sort order change
   */
  private handleSortOrderChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.emitFilterChange({ sortOrder: target.value as 'asc' | 'desc' });
  }

  /**
   * Handle show completed change
   */
  private handleShowCompletedChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.emitFilterChange({ showCompleted: target.checked });
  }

  /**
   * Handle show favorites change
   */
  private handleShowFavoritesChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.emitFilterChange({ showFavorites: target.checked });
  }

  /**
   * Handle reset filters
   */
  private handleReset(): void {
    const { onReset } = this.props;
    
    if (onReset) {
      onReset();
    }

    this.emit('filter-reset');
  }

  /**
   * Handle apply filters
   */
  private handleApply(): void {
    this.emit('filter-apply', { options: this.props.options });
  }

  /**
   * Handle toggle collapse
   */
  private handleToggleCollapse(): void {
    const filterBody = this.querySelector('.filter-body');
    const toggleIcon = this.querySelector('.toggle-icon');
    
    if (filterBody && toggleIcon) {
      const isCollapsed = filterBody.classList.contains('collapsed');
      
      if (isCollapsed) {
        filterBody.classList.remove('collapsed');
        toggleIcon.textContent = '▼';
      } else {
        filterBody.classList.add('collapsed');
        toggleIcon.textContent = '▶';
      }

      this.emit('filter-toggle', { collapsed: !isCollapsed });
    }
  }

  /**
   * Emit filter change event
   */
  private emitFilterChange(changes: Partial<FilterOptions>): void {
    const { onFilterChange } = this.props;
    
    if (onFilterChange) {
      onFilterChange(changes);
    }

    this.emit('filter-change', changes);
  }

  /**
   * Get current filter options
   */
  getFilterOptions(): FilterOptions {
    return { ...this.props.options };
  }

  /**
   * Update filter options
   */
  updateOptions(options: Partial<FilterOptions>): void {
    this.update({ options: { ...this.props.options, ...options } });
  }

  /**
   * Reset to default options
   */
  resetOptions(): void {
    const defaultOptions: FilterOptions = {
      platforms: [],
      networks: [],
      statuses: [],
      sortBy: 'name',
      sortOrder: 'asc',
      showCompleted: true,
      showFavorites: false
    };

    this.update({ options: defaultOptions });
  }
}