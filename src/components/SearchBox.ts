/**
 * SearchBox Component - Provides search functionality for TV shows
 * 
 * Features:
 * - Debounced search input (300ms default)
 * - Clear button
 * - Minimum character threshold
 * - Keyboard shortcuts (Enter, Escape)
 * - Integrates with ReactiveShowManager
 */

import { BaseComponent, BaseProps } from './BaseComponent.js';
import { ReactiveShowManager } from '../state/ReactiveShowManager.js';

/**
 * SearchBox component properties
 */
export interface SearchBoxProps extends BaseProps {
  /** Placeholder text for input */
  placeholder?: string;
  /** Debounce delay in milliseconds (default: 300) */
  debounceMs?: number;
  /** Minimum characters before triggering search (default: 2) */
  minChars?: number;
  /** Whether to auto-focus the input (default: false) */
  autoFocus?: boolean;
  /** Whether to show the clear button (default: true) */
  showClearButton?: boolean;
  /** Callback when search is executed */
  onSearch?: (query: string) => void;
  /** Callback when search is cleared */
  onClear?: () => void;
}

/**
 * SearchBox Component - Manages show search functionality
 */
export class SearchBox extends BaseComponent<SearchBoxProps> {
  private showManager: ReactiveShowManager;
  private currentValue: string = '';
  private debounceTimeout: number | null = null;

  /**
   * Create a new SearchBox instance
   */
  constructor(props: SearchBoxProps, showManager: ReactiveShowManager) {
    super(props);
    this.showManager = showManager;
  }

  /**
   * Render the search box HTML
   */
  protected render(): string {
    const { 
      placeholder = 'Search shows...', 
      showClearButton = true,
      autoFocus = false 
    } = this.props;

    return `
      <div class="search-box">
        <div class="search-input-wrapper">
          <div class="search-icon">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
            </svg>
          </div>
          <input 
            type="text" 
            class="search-input"
            placeholder="${this.escapeHtml(placeholder)}"
            value="${this.escapeHtml(this.currentValue)}"
            ${autoFocus ? 'autofocus' : ''}
            aria-label="${this.escapeHtml(placeholder)}"
            autocomplete="off"
            spellcheck="false"
          >
          ${showClearButton && this.currentValue ? this.renderClearButton() : ''}
        </div>
      </div>
    `;
  }

  /**
   * Render clear button
   */
  private renderClearButton(): string {
    return `
      <button 
        type="button" 
        class="clear-button" 
        data-action="clear"
        title="Clear search"
        aria-label="Clear search"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
          <path d="M8.293 7l3.147-3.146a.5.5 0 0 0-.708-.708L7.586 6.293 4.44 3.146a.5.5 0 1 0-.708.708L6.879 7 3.732 10.146a.5.5 0 0 0 .708.708L7.586 7.707l3.147 3.147a.5.5 0 0 0 .708-.708L8.293 7z"/>
        </svg>
      </button>
    `;
  }



  /**
   * Called after component is mounted
   */
  protected override onMount(): void {
    // Input change events
    const searchInput = this.query<HTMLInputElement>('.search-input');
    if (searchInput) {
      this.addEventListener(searchInput, 'input', this.handleInput.bind(this));
      this.addEventListener(searchInput, 'keydown', ((e: Event) => this.handleKeyDown(e as KeyboardEvent)) as EventListener);
    }

    // Clear button click
    const clearBtn = this.query<HTMLButtonElement>('[data-action="clear"]');
    if (clearBtn) {
      this.addEventListener(clearBtn, 'click', this.handleClear.bind(this));
    }
  }

  /**
   * Handle input value changes
   */
  private handleInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.currentValue = target.value;
    const query = target.value.trim();

    // Clear existing debounce timeout
    if (this.debounceTimeout !== null) {
      window.clearTimeout(this.debounceTimeout);
    }

    // Update UI to show/hide clear button
    if (this.mounted) {
      this.update(this.props);
    }

    const minChars = this.props.minChars ?? 2;
    
    if (query.length === 0) {
      // Clear search immediately when input is empty
      this.executeSearch('');
    } else if (query.length >= minChars) {
      // Debounce search for non-empty queries
      const debounceMs = this.props.debounceMs ?? 300;
      this.debounceTimeout = window.setTimeout(() => {
        this.executeSearch(query);
      }, debounceMs);
    }
  }

  /**
   * Execute search with ReactiveShowManager
   */
  private executeSearch(query: string): void {
    // Update show manager search term
    this.showManager.setSearchTerm(query);
    
    // Notify callback
    if (this.props.onSearch) {
      this.props.onSearch(query);
    }
  }

  /**
   * Handle clear button click
   */
  private handleClear(event: Event): void {
    event.preventDefault();
    
    const input = this.query<HTMLInputElement>('.search-input');
    if (input) {
      input.value = '';
      this.currentValue = '';
      
      // Update UI
      if (this.mounted) {
        this.update(this.props);
      }
      
      // Focus back to input
      input.focus();
      
      // Trigger search with empty query
      this.executeSearch('');
    }

    if (this.props.onClear) {
      this.props.onClear();
    }
  }

  /**
   * Handle keyboard interactions
   */
  private handleKeyDown(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    
    if (event.key === 'Escape') {
      // Clear search on escape
      input.value = '';
      this.currentValue = '';
      if (this.mounted) {
        this.update(this.props);
      }
      this.executeSearch('');
      if (this.props.onClear) {
        this.props.onClear();
      }
    } else if (event.key === 'Enter') {
      // Trigger immediate search on enter (bypass debounce)
      event.preventDefault();
      if (this.debounceTimeout !== null) {
        window.clearTimeout(this.debounceTimeout);
      }
      this.executeSearch(input.value.trim());
    }
  }

  /**
   * Get current search value
   */
  getValue(): string {
    return this.currentValue;
  }

  /**
   * Set search value programmatically
   */
  setValue(value: string): void {
    const input = this.query<HTMLInputElement>('.search-input');
    if (input) {
      input.value = value;
      this.currentValue = value;
      if (this.mounted) {
        this.update(this.props);
      }
      
      const minChars = this.props.minChars ?? 2;
      if (value.trim().length >= minChars) {
        this.executeSearch(value.trim());
      }
    }
  }

  /**
   * Clear the search input
   */
  clear(): void {
    this.setValue('');
    if (this.props.onClear) {
      this.props.onClear();
    }
  }

  /**
   * Focus the search input
   */
  focus(): void {
    const input = this.query<HTMLInputElement>('.search-input');
    input?.focus();
  }
}