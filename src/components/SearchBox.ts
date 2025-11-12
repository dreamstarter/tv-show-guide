import { BaseComponent } from '../core/BaseComponent.js';
import { debounce } from '../utils/debounce.js';

export interface SearchBoxProps {
  placeholder?: string;
  value?: string;
  debounceMs?: number;
  minChars?: number;
  autoFocus?: boolean;
  showClearButton?: boolean;
  onSearch?: (query: string) => void;
  onClear?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

/**
 * SearchBox component for searching through shows
 */
export class SearchBox extends BaseComponent<SearchBoxProps> {
  private debouncedSearch: (query: string) => void;

  constructor(props: SearchBoxProps) {
    super(props, {
      className: 'search-box',
      attributes: {
        'role': 'search',
        'aria-label': 'Search shows'
      }
    });

    // Create debounced search function
    this.debouncedSearch = debounce(
      (query: string) => this.handleSearch(query),
      props.debounceMs || 300
    );
  }

  /**
   * Render the search box HTML
   */
  render(): string {
    const { 
      placeholder = 'Search shows...', 
      value = '', 
      showClearButton = true,
      autoFocus = false 
    } = this.props;

    return `
      <div class="search-box-content">
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
            value="${this.escapeHtml(value)}"
            ${autoFocus ? 'autofocus' : ''}
            aria-label="${this.escapeHtml(placeholder)}"
            autocomplete="off"
            spellcheck="false"
          >
          ${showClearButton && value ? this.renderClearButton() : ''}
        </div>
        ${this.renderSearchSuggestions()}
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
   * Render search suggestions (placeholder for future enhancement)
   */
  private renderSearchSuggestions(): string {
    return `
      <div class="search-suggestions" style="display: none;">
        <!-- Search suggestions would go here -->
      </div>
    `;
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
   * Set up event listeners for search interactions
   */
  protected override setupEventListeners(): void {
    // Input change events
    this.addEventListener('.search-input', 'input', (event: Event) => {
      this.handleInput(event);
    });

    // Input focus events
    this.addEventListener('.search-input', 'focus', (event: Event) => {
      this.handleFocus(event);
    });

    // Input blur events
    this.addEventListener('.search-input', 'blur', (event: Event) => {
      this.handleBlur(event);
    });

    // Clear button click
    this.addEventListener('[data-action="clear"]', 'click', (event: Event) => {
      event.preventDefault();
      this.handleClear();
    });

    // Keyboard shortcuts
    this.addEventListener('.search-input', 'keydown', (event: Event) => {
      this.handleKeyDown(event as KeyboardEvent);
    });

    // Prevent form submission if inside a form
    this.addEventListener('self', 'submit', (event: Event) => {
      event.preventDefault();
    });
  }

  /**
   * Handle input value changes
   */
  private handleInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const query = target.value.trim();

    // Update props with new value
    this.props.value = target.value;

    // Update clear button visibility
    this.updateClearButton();

    // Only trigger search if meets minimum character requirement
    const minChars = this.props.minChars || 0;
    if (query.length >= minChars) {
      this.debouncedSearch(query);
    } else if (query.length === 0) {
      // Clear search immediately when input is empty
      this.handleSearch('');
    }

    // Emit input change event
    this.emit('search-input', { query, length: query.length });
  }

  /**
   * Handle search execution
   */
  private handleSearch(query: string): void {
    const { onSearch } = this.props;
    
    if (onSearch) {
      onSearch(query);
    }

    this.emit('search-execute', { query });
  }

  /**
   * Handle input focus
   */
  private handleFocus(_event: Event): void {
    const { onFocus } = this.props;
    
    if (onFocus) {
      onFocus();
    }

    // Add focus class to wrapper
    const wrapper = this.querySelector('.search-input-wrapper');
    wrapper?.classList.add('focused');

    this.emit('search-focus');
  }

  /**
   * Handle input blur
   */
  private handleBlur(_event: Event): void {
    const { onBlur } = this.props;
    
    if (onBlur) {
      onBlur();
    }

    // Remove focus class from wrapper
    const wrapper = this.querySelector('.search-input-wrapper');
    wrapper?.classList.remove('focused');

    this.emit('search-blur');
  }

  /**
   * Handle clear button click
   */
  private handleClear(): void {
    const input = this.querySelector('.search-input') as HTMLInputElement;
    
    if (input) {
      input.value = '';
      this.props.value = '';
      
      // Update UI
      this.updateClearButton();
      
      // Focus back to input
      input.focus();
      
      // Trigger search with empty query
      this.handleSearch('');
    }

    const { onClear } = this.props;
    if (onClear) {
      onClear();
    }

    this.emit('search-clear');
  }

  /**
   * Handle keyboard interactions
   */
  private handleKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Escape': {
        // Clear search on escape
        this.handleClear();
        break;
      }
        
      case 'Enter': {
        // Trigger immediate search on enter (bypass debounce)
        event.preventDefault();
        const input = event.target as HTMLInputElement;
        this.handleSearch(input.value.trim());
        break;
      }
    }

    this.emit('search-keydown', { key: event.key, query: (event.target as HTMLInputElement).value });
  }

  /**
   * Update clear button visibility
   */
  private updateClearButton(): void {
    const wrapper = this.querySelector('.search-input-wrapper');
    const clearButton = this.querySelector('.clear-button');
    const hasValue = this.props.value && this.props.value.length > 0;
    const showClearButton = this.props.showClearButton !== false;

    if (wrapper) {
      if (hasValue && showClearButton) {
        if (!clearButton) {
          // Add clear button if it doesn't exist
          wrapper.insertAdjacentHTML('beforeend', this.renderClearButton());
          // Re-setup event listeners for the new button
          this.setupEventListeners();
        }
        wrapper.classList.add('has-clear-button');
      } else {
        if (clearButton) {
          clearButton.remove();
        }
        wrapper.classList.remove('has-clear-button');
      }
    }
  }

  /**
   * Get current search value
   */
  getValue(): string {
    return this.props.value || '';
  }

  /**
   * Set search value programmatically
   */
  setValue(value: string): void {
    const input = this.querySelector('.search-input') as HTMLInputElement;
    
    if (input) {
      input.value = value;
      this.props.value = value;
      this.updateClearButton();
      
      // Trigger search if value meets minimum requirements
      const minChars = this.props.minChars || 0;
      if (value.length >= minChars) {
        this.handleSearch(value);
      }
    }
  }

  /**
   * Focus the search input
   */
  focus(): void {
    const input = this.querySelector('.search-input') as HTMLInputElement;
    input?.focus();
  }

  /**
   * Clear the search input
   */
  clear(): void {
    this.handleClear();
  }

  /**
   * Check if search input is focused
   */
  isFocused(): boolean {
    const input = this.querySelector('.search-input') as HTMLInputElement;
    return document.activeElement === input;
  }
}