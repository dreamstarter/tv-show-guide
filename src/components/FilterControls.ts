/**
 * FilterControls Component - Provides filtering controls for TV shows
 * 
 * Features:
 * - Platform checkboxes (Hulu, Peacock, Paramount)
 * - "Show Non-Returning" toggle
 * - "Use Estimates" toggle with network checkboxes
 * - Reactive filtering through ReactiveShowManager
 */

import { BaseComponent, BaseProps } from './BaseComponent.js';
import { ReactiveShowManager } from '../state/ReactiveShowManager.js';
import { Platform, Network } from '../types/index.js';

/**
 * Filter state interface
 */
export interface FilterState {
  /** Selected platforms */
  platforms: Platform[];
  /** Whether to show non-returning shows */
  showNonReturning: boolean;
  /** Whether to use network estimates */
  useEstimates: boolean;
  /** Selected networks for estimates */
  estimateNetworks: Network[];
}

/**
 * FilterControls component properties
 */
export interface FilterControlsProps extends BaseProps {
  /** Optional callback when filters change */
  onFilterChange?: (filters: FilterState) => void;
  /** Optional callback when filters are reset */
  onReset?: () => void;
}

/**
 * FilterControls Component - Manages show filtering options
 */
export class FilterControls extends BaseComponent<FilterControlsProps> {
  private showManager: ReactiveShowManager;
  private filterState: FilterState;

  /**
   * Create a new FilterControls instance
   */
  constructor(props: FilterControlsProps, showManager: ReactiveShowManager) {
    super(props);
    this.showManager = showManager;
    
    // Initialize filter state with default values
    this.filterState = {
      platforms: ['hulu', 'peacock', 'paramount'],
      showNonReturning: false,
      useEstimates: false,
      estimateNetworks: []
    };
  }

  /**
   * Render the filter controls HTML
   */
  protected render(): string {
    const { platforms, showNonReturning, useEstimates, estimateNetworks } = this.filterState;

    return `
      <div class="filter-controls">
        <div class="filter-section">
          <h3 class="filter-section__title">Platforms</h3>
          <div class="filter-group">
            ${this.renderPlatformCheckbox('hulu', 'Hulu', platforms)}
            ${this.renderPlatformCheckbox('peacock', 'Peacock', platforms)}
            ${this.renderPlatformCheckbox('paramount', 'Paramount+', platforms)}
          </div>
        </div>

        <div class="filter-section">
          <h3 class="filter-section__title">Display Options</h3>
          <div class="filter-group">
            <label class="filter-checkbox">
              <input 
                type="checkbox" 
                name="show-non-returning" 
                ${showNonReturning ? 'checked' : ''}
              />
              <span>Show Non-Returning Shows</span>
            </label>
          </div>
        </div>

        <div class="filter-section">
          <h3 class="filter-section__title">Network Estimates</h3>
          <div class="filter-group">
            <label class="filter-checkbox">
              <input 
                type="checkbox" 
                name="use-estimates" 
                ${useEstimates ? 'checked' : ''}
              />
              <span>Use Network Estimates</span>
            </label>
          </div>
          
          ${useEstimates ? `
            <div class="filter-subgroup">
              ${this.renderNetworkCheckbox('ABC', estimateNetworks)}
              ${this.renderNetworkCheckbox('NBC', estimateNetworks)}
              ${this.renderNetworkCheckbox('CBS', estimateNetworks)}
              ${this.renderNetworkCheckbox('FOX', estimateNetworks)}
            </div>
          ` : ''}
        </div>

        <div class="filter-actions">
          <button type="button" class="btn btn--secondary reset-btn">
            Reset Filters
          </button>
          <button type="button" class="btn btn--primary apply-btn">
            Apply Filters
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Render a platform checkbox
   */
  private renderPlatformCheckbox(platform: Platform, label: string, selected: Platform[]): string {
    const isChecked = selected.includes(platform);
    return `
      <label class="filter-checkbox">
        <input 
          type="checkbox" 
          name="platform" 
          value="${platform}" 
          ${isChecked ? 'checked' : ''}
        />
        <span class="${platform} chip">${label}</span>
      </label>
    `;
  }

  /**
   * Render a network checkbox
   */
  private renderNetworkCheckbox(network: Network, selected: Network[]): string {
    const isChecked = selected.includes(network);
    return `
      <label class="filter-checkbox">
        <input 
          type="checkbox" 
          name="network" 
          value="${network}" 
          ${isChecked ? 'checked' : ''}
        />
        <span class="${network.toLowerCase()}-logo network-badge">${network}</span>
      </label>
    `;
  }

  /**
   * Called after component is mounted
   */
  protected override onMount(): void {
    // Set up platform checkbox listeners
    const platformCheckboxes = this.queryAll<HTMLInputElement>('input[name="platform"]');
    platformCheckboxes.forEach(checkbox => {
      this.addEventListener(checkbox, 'change', this.handlePlatformChange.bind(this));
    });

    // Set up show non-returning toggle
    const nonReturningCheckbox = this.query<HTMLInputElement>('input[name="show-non-returning"]');
    if (nonReturningCheckbox) {
      this.addEventListener(nonReturningCheckbox, 'change', this.handleNonReturningChange.bind(this));
    }

    // Set up use estimates toggle
    const useEstimatesCheckbox = this.query<HTMLInputElement>('input[name="use-estimates"]');
    if (useEstimatesCheckbox) {
      this.addEventListener(useEstimatesCheckbox, 'change', this.handleUseEstimatesChange.bind(this));
    }

    // Set up network checkbox listeners
    const networkCheckboxes = this.queryAll<HTMLInputElement>('input[name="network"]');
    networkCheckboxes.forEach(checkbox => {
      this.addEventListener(checkbox, 'change', this.handleNetworkChange.bind(this));
    });

    // Set up button listeners
    const resetBtn = this.query<HTMLButtonElement>('.reset-btn');
    if (resetBtn) {
      this.addEventListener(resetBtn, 'click', this.handleReset.bind(this));
    }

    const applyBtn = this.query<HTMLButtonElement>('.apply-btn');
    if (applyBtn) {
      this.addEventListener(applyBtn, 'click', this.handleApply.bind(this));
    }
  }

  /**
   * Handle platform checkbox change
   */
  private handlePlatformChange(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const platform = checkbox.value as Platform;

    if (checkbox.checked) {
      if (!this.filterState.platforms.includes(platform)) {
        this.filterState.platforms.push(platform);
      }
    } else {
      this.filterState.platforms = this.filterState.platforms.filter(p => p !== platform);
    }
  }

  /**
   * Handle non-returning toggle change
   */
  private handleNonReturningChange(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    this.filterState.showNonReturning = checkbox.checked;
  }

  /**
   * Handle use estimates toggle change
   */
  private handleUseEstimatesChange(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    this.filterState.useEstimates = checkbox.checked;
    
    // Re-render to show/hide network checkboxes
    if (this.mounted) {
      this.update(this.props);
    }
  }

  /**
   * Handle network checkbox change
   */
  private handleNetworkChange(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const network = checkbox.value as Network;

    if (checkbox.checked) {
      if (!this.filterState.estimateNetworks.includes(network)) {
        this.filterState.estimateNetworks.push(network);
      }
    } else {
      this.filterState.estimateNetworks = this.filterState.estimateNetworks.filter(n => n !== network);
    }
  }

  /**
   * Handle reset button click
   */
  private handleReset(event: Event): void {
    event.preventDefault();

    // Reset to default state
    this.filterState = {
      platforms: ['hulu', 'peacock', 'paramount'],
      showNonReturning: false,
      useEstimates: false,
      estimateNetworks: []
    };

    // Update UI
    if (this.mounted) {
      this.update(this.props);
    }

    // Notify callback
    if (this.props.onReset) {
      this.props.onReset();
    }

    // Apply the reset filters
    this.applyFilters();
  }

  /**
   * Handle apply button click
   */
  private handleApply(event: Event): void {
    event.preventDefault();
    this.applyFilters();
  }

  /**
   * Apply current filters to the show manager
   */
  private applyFilters(): void {
    // Update show manager with new platform filters
    this.showManager.setPlatformFilter(this.filterState.platforms);
    
    // Update returning filter based on showNonReturning toggle
    // If showNonReturning is false, filter out non-returning shows (returning: true)
    // If showNonReturning is true, show all shows (returning: undefined)
    this.showManager.setReturningFilter(
      this.filterState.showNonReturning ? undefined : true
    );

    // Note: useEstimates and estimateNetworks would need additional ShowManager support
    // For now, just track them in filterState for future implementation
    
    // Notify callback
    if (this.props.onFilterChange) {
      this.props.onFilterChange(this.filterState);
    }
  }

  /**
   * Get current filter state
   */
  getFilterState(): FilterState {
    return { ...this.filterState };
  }

  /**
   * Set filter state programmatically
   */
  setFilterState(filters: Partial<FilterState>): void {
    this.filterState = {
      ...this.filterState,
      ...filters
    };

    if (this.mounted) {
      this.update(this.props);
    }
  }
}