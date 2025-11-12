/**
 * DOM Integration Layer
 * Connects the new modular architecture to existing HTML elements
 * Now uses ReactiveShowManager for automatic UI updates
 */

import { logger } from '../utils/logger.js';
import { ShowManager } from '../modules/showManager.js';
import { ReactiveShowManager } from '../state/ReactiveShowManager.js';
import { Show } from '../types/index.js';

export interface DOMElements {
  btnAll: HTMLButtonElement | null;
  btnWeek: HTMLButtonElement | null;
  viewAll: HTMLElement | null;
  viewWeek: HTMLElement | null;
  searchInput: HTMLInputElement | null;
  clearSearch: HTMLButtonElement | null;
  allList: HTMLElement | null;
  weekTable: HTMLElement | null;
  importBtn: HTMLButtonElement | null;
  exportBtn: HTMLButtonElement | null;
  importFile: HTMLInputElement | null;
  legendTable: HTMLElement | null;
  editWrap: HTMLElement | null;
  editor: HTMLElement | null;
  loadPaste: HTMLButtonElement | null;
  pasteJson: HTMLTextAreaElement | null;
}

export interface ViewMode {
  current: 'all' | 'week';
  setMode: (mode: 'all' | 'week') => void;
  onModeChange?: (mode: 'all' | 'week') => void;
}

/**
 * DOM Integration class for managing UI interactions
 * Now reactive - automatically updates UI when state changes
 */
export class DOMIntegration {
  private elements: DOMElements;
  private viewMode: ViewMode;
  private searchTerm = '';
  private debounceTimer: number | null = null;
  private showManager: ShowManager; // Legacy - kept for backward compatibility
  private reactiveShowManager?: ReactiveShowManager;
  private unsubscribers: Array<() => void> = [];

  constructor(showManager: ShowManager, reactiveShowManager?: ReactiveShowManager) {
    this.showManager = showManager;
    if (reactiveShowManager) {
      this.reactiveShowManager = reactiveShowManager;
    }
    this.elements = this.getElements();
    this.viewMode = {
      current: 'all',
      setMode: this.setMode.bind(this)
    };
  }

  /**
   * Initialize DOM integration and event listeners
   */
  init(): void {
    try {
      this.setupEventListeners();
      
      // Setup reactive subscriptions if ReactiveShowManager is available
      if (this.reactiveShowManager) {
        this.setupReactiveSubscriptions();
        logger.info('Reactive subscriptions enabled');
      } else {
        logger.warn('ReactiveShowManager not available - using legacy mode');
      }
      
      this.setMode('all'); // Start with "All Shows" view
      
      // Render legend and editor with individual error handling
      try {
        this.renderLegend(); // Render the legend table
      } catch (legendError) {
        logger.error('Failed to render legend', legendError);
      }
      
      try {
        this.renderEditor(); // Render the editor form
      } catch (editorError) {
        logger.error('Failed to render editor', editorError);
      }
      
      logger.info('DOM integration initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize DOM integration', error);
      throw error;
    }
  }

  /**
   * Setup reactive subscriptions for automatic UI updates
   */
  private setupReactiveSubscriptions(): void {
    if (!this.reactiveShowManager) {
      return;
    }

    // Subscribe to filtered shows changes - updates both All Shows and Week views
    const unsubFilteredShows = this.reactiveShowManager.subscribeToFilteredShows(() => {
      logger.debug('Filtered shows changed - updating current view');
      if (this.viewMode.current === 'all') {
        this.renderAllShows();
      } else {
        this.renderWeekView();
      }
      this.renderLegend(); // Update legend when shows change
    });
    this.unsubscribers.push(unsubFilteredShows);

    // Subscribe to show changes - updates editor
    const unsubShows = this.reactiveShowManager.subscribeToShows(() => {
      logger.debug('Shows changed - updating editor');
      this.renderEditor();
    });
    this.unsubscribers.push(unsubShows);

    // Subscribe to filter changes - updates all views
    const unsubFilters = this.reactiveShowManager.subscribeToFilters(() => {
      logger.debug('Filters changed - updating views');
      if (this.viewMode.current === 'all') {
        this.renderAllShows();
      } else {
        this.renderWeekView();
      }
      this.renderLegend();
    });
    this.unsubscribers.push(unsubFilters);

    logger.info('Reactive subscriptions setup complete');
  }

  /**
   * Get all required DOM elements
   */
  private getElements(): DOMElements {
    return {
      btnAll: document.getElementById('btnAll') as HTMLButtonElement,
      btnWeek: document.getElementById('btnWeek') as HTMLButtonElement,
      viewAll: document.getElementById('viewAll'),
      viewWeek: document.getElementById('viewWeek'),
      searchInput: document.getElementById('searchInput') as HTMLInputElement,
      clearSearch: document.getElementById('clearSearch') as HTMLButtonElement,
      allList: document.getElementById('allList'),
      weekTable: document.getElementById('weekTable'),
      importBtn: document.getElementById('importBtn') as HTMLButtonElement,
      exportBtn: document.getElementById('exportBtn') as HTMLButtonElement,
      importFile: document.getElementById('importFile') as HTMLInputElement,
      legendTable: document.getElementById('legendTable'),
      editWrap: document.getElementById('editWrap'),
      editor: document.getElementById('editor'),
      loadPaste: document.getElementById('loadPaste') as HTMLButtonElement,
      pasteJson: document.getElementById('pasteJson') as HTMLTextAreaElement
    };
  }

  /**
   * Set up all event listeners for DOM elements
   */
  private setupEventListeners(): void {
    // View toggle buttons
    this.elements.btnAll?.addEventListener('click', () => {
      this.setMode('all');
    });

    this.elements.btnWeek?.addEventListener('click', () => {
      this.setMode('week');
    });

    // Search functionality
    if (this.elements.searchInput) {
      this.elements.searchInput.addEventListener('input', (e) => {
        const query = (e.target as HTMLInputElement).value;
        this.handleSearch(query);
      });

      this.elements.searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.clearSearch();
        } else if (e.key === 'Enter') {
          e.preventDefault();
          this.performSearch((e.target as HTMLInputElement).value);
        }
      });
    }

    // Clear search button
    this.elements.clearSearch?.addEventListener('click', () => {
      this.clearSearch();
    });

    // Import/Export buttons
    this.elements.importBtn?.addEventListener('click', () => {
      this.elements.importFile?.click();
    });

    this.elements.exportBtn?.addEventListener('click', () => {
      this.handleExport();
    });

    this.elements.importFile?.addEventListener('change', (e) => {
      this.handleFileImport(e);
    });

    // Platform filters
    const platformIds = ['pf-hulu', 'pf-peacock', 'pf-paramount'];
    platformIds.forEach(id => {
      const element = document.getElementById(id) as HTMLInputElement;
      element?.addEventListener('change', () => {
        this.handleFilterChange();
      });
    });

    // Other filters
    const filterIds = ['show-nonret', 'use-estimates', 'est-abc', 'est-nbc', 'est-cbs', 'est-fox'];
    filterIds.forEach(id => {
      const element = document.getElementById(id) as HTMLInputElement;
      element?.addEventListener('change', () => {
        this.handleFilterChange();
      });
    });

    logger.info('DOM event listeners set up successfully');
  }

  /**
   * Set the view mode (All Shows or Week Airing)
   */
  private setMode(mode: 'all' | 'week'): void {
    const { btnAll, btnWeek, viewAll, viewWeek } = this.elements;

    if (mode === 'all') {
      viewAll?.classList.remove('hidden');
      viewWeek?.classList.add('hidden');
      btnAll?.classList.add('active');
      btnWeek?.classList.remove('active');
      btnAll?.setAttribute('aria-pressed', 'true');
      btnWeek?.setAttribute('aria-pressed', 'false');
    } else {
      viewWeek?.classList.remove('hidden');
      viewAll?.classList.add('hidden');
      btnWeek?.classList.add('active');
      btnAll?.classList.remove('active');
      btnWeek?.setAttribute('aria-pressed', 'true');
      btnAll?.setAttribute('aria-pressed', 'false');
    }

    this.viewMode.current = mode;

    // Trigger mode change callback
    if (this.viewMode.onModeChange) {
      this.viewMode.onModeChange(mode);
    }

    // Render the appropriate view
    this.renderCurrentView();

    logger.info(`View mode set to: ${mode}`);
  }

  /**
   * Handle search input with debouncing
   */
  private handleSearch(query: string): void {
    this.searchTerm = query;

    // Update clear button visibility
    if (this.elements.clearSearch) {
      this.elements.clearSearch.style.display = query ? 'flex' : 'none';
    }

    // Debounce the search
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = window.setTimeout(() => {
      this.performSearch(query);
    }, 300);
  }

  /**
   * Perform the actual search
   */
  private performSearch(query: string): void {
    logger.info(`Performing search for: "${query}"`);
    
    // Re-render all views with the new search query
    this.renderCurrentView();
    this.renderLegend();
  }

  /**
   * Clear search input and results
   */
  private clearSearch(): void {
    if (this.elements.searchInput) {
      this.elements.searchInput.value = '';
      this.searchTerm = '';
    }

    if (this.elements.clearSearch) {
      this.elements.clearSearch.style.display = 'none';
    }

    this.performSearch('');
    
    // Focus back to search input
    this.elements.searchInput?.focus();
  }

  /**
   * Handle filter changes
   */
  private handleFilterChange(): void {
    logger.info('Filters changed - re-rendering views');
    this.renderCurrentView();
    this.renderLegend();
  }

  /**
   * Handle file import
   */
  private handleFileImport(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>): void => {
        try {
          const content = e.target?.result as string;
          const data = JSON.parse(content);
          logger.info('Import data loaded', data);
          // TODO: Integrate with actual import functionality
        } catch (error) {
          logger.error('Failed to parse imported file', error);
          alert('Invalid JSON file');
        }
      };
      reader.readAsText(file);
    }
  }

  /**
   * Handle data export
   */
  private handleExport(): void {
    try {
      // TODO: Get actual data from ShowManager
      const data = { message: 'Export functionality coming soon' };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'tv-show-data.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      logger.info('Export completed');
    } catch (error) {
      logger.error('Export failed', error);
    }
  }

  /**
   * Render the current view based on mode
   */
  private renderCurrentView(): void {
    if (this.viewMode.current === 'all') {
      this.renderAllShows();
    } else {
      this.renderWeekView();
    }
  }

  /**
   * Render all shows view
   */
  private renderAllShows(): void {
    if (!this.elements.allList) {
      return;
    }

    try {
      // Get all shows and convert to array format
      const allShows = this.showManager.getAllShows();
      let showEntries = Object.entries(allShows).map(([id, show]) => ({ id: parseInt(id), show }));

      // Apply platform and status filters
      showEntries = this.getFilteredShowEntries(showEntries);

      // Apply search filter if there's a search term
      if (this.searchTerm) {
        const searchResults = this.showManager.searchShows(this.searchTerm);
        const searchIds = new Set(Object.keys(searchResults).map(id => parseInt(id)));
        showEntries = showEntries.filter(({ id }) => searchIds.has(id));
      }

      // Sort shows alphabetically by title
      showEntries.sort((a, b) => a.show.t.localeCompare(b.show.t));

      if (showEntries.length === 0) {
        this.elements.allList.innerHTML = '<em>No shows match the current search and filters</em>';
      } else {
        const items = showEntries.map(({ show }) => {
          const statusClass = show.ret ? '' : 'ended';
          
          // Format date information
          const seasonInfo = show.s ? `S${show.s}` : 'S?';
          const dateInfo = show.start 
            ? ` <span class="meta">(${seasonInfo}: ${show.start}${show.end ? ' – ' + show.end : ''})</span>` 
            : '';

          // Highlight search terms in title
          let displayTitle = show.t;
          if (this.searchTerm) {
            const regex = new RegExp(`(${this.escapeRegex(this.searchTerm)})`, 'gi');
            displayTitle = show.t.replace(regex, '<mark>$1</mark>');
          }

          // Create platform chip and show entry
          const platformDisplay = show.c.charAt(0).toUpperCase() + show.c.slice(1);
          return `<span class="${show.c} chip">${platformDisplay}</span> <span class="${statusClass}">${displayTitle}</span>${dateInfo}`;
        });

        this.elements.allList.innerHTML = items.join('<br>');

        // Add search indicator if searching
        if (this.searchTerm) {
          const indicator = `<div class="search-results-indicator"><span class="muted">Search results for "${this.escapeHtml(this.searchTerm)}": ${items.length} shows found</span></div><br>`;
          this.elements.allList.innerHTML = indicator + this.elements.allList.innerHTML;
        }
      }

      logger.info(`All shows view rendered with ${showEntries.length} shows`);
    } catch (error) {
      logger.error('Error rendering all shows view', error);
      this.elements.allList.innerHTML = 'Error loading shows. Please refresh the page.';
    }
  }

  /**
   * Render week airing view
   */
  private renderWeekView(): void {
    if (!this.elements.weekTable) {
      return;
    }

    try {
      // Get all shows and organize by air day
      const allShows = this.showManager.getAllShows();
      let showEntries = Object.entries(allShows).map(([id, show]) => ({ id: parseInt(id), show }));

      // Apply platform and status filters
      showEntries = this.getFilteredShowEntries(showEntries);

      // Apply search filter if there's a search term
      if (this.searchTerm) {
        const searchResults = this.showManager.searchShows(this.searchTerm);
        const searchIds = new Set(Object.keys(searchResults).map(id => parseInt(id)));
        showEntries = showEntries.filter(({ id }) => searchIds.has(id));
      }

      // Group shows by air day
      const showsByDay: Record<string, Array<{ id: number; show: Show }>> = {
        'Sunday': [],
        'Monday': [],
        'Tuesday': [],
        'Wednesday': [],
        'Thursday': [],
        'Friday': [],
        'Saturday': []
      };

      // Filter shows that have air days and group them
      showEntries.forEach(({ id, show }) => {
        if (show.air && show.air in showsByDay) {
          const dayArray = showsByDay[show.air];
          if (dayArray) {
            dayArray.push({ id, show });
          }
        }
      });

      // Sort shows within each day alphabetically
      Object.keys(showsByDay).forEach(day => {
        const dayShows = showsByDay[day];
        if (dayShows) {
          dayShows.sort((a, b) => a.show.t.localeCompare(b.show.t));
        }
      });

      // Create the weekly schedule table
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      let tableHtml = '<div class="week-schedule"><table class="week-table">';
      
      // Table header
      tableHtml += '<thead><tr>';
      days.forEach(day => {
        const dayShows = showsByDay[day];
        const count = dayShows ? dayShows.length : 0;
        tableHtml += `<th>${day}<br><span class="day-count">(${count} shows)</span></th>`;
      });
      tableHtml += '</tr></thead>';

      // Find the maximum number of shows on any day for consistent row layout
      const maxShows = Math.max(...days.map(day => {
        const dayShows = showsByDay[day];
        return dayShows ? dayShows.length : 0;
      }));

      // Table body - create rows for each show slot
      tableHtml += '<tbody>';
      for (let i = 0; i < maxShows; i++) {
        tableHtml += '<tr>';
        days.forEach(day => {
          const dayShows = showsByDay[day];
          if (dayShows && i < dayShows.length) {
            const showEntry = dayShows[i];
            if (showEntry) {
              const { show } = showEntry;
              const statusClass = show.ret ? '' : 'ended';
              
              // Format date information
              const seasonInfo = show.s ? `S${show.s}` : 'S?';
              const dateInfo = show.start 
                ? `<br><span class="meta">${seasonInfo}: ${show.start}${show.end ? ' – ' + show.end : ''}</span>` 
                : '';

              // Highlight search terms in title
              let displayTitle = show.t;
              if (this.searchTerm) {
                const regex = new RegExp(`(${this.escapeRegex(this.searchTerm)})`, 'gi');
                displayTitle = show.t.replace(regex, '<mark>$1</mark>');
              }

              const platformDisplay = show.c.charAt(0).toUpperCase() + show.c.slice(1);
              tableHtml += `
                <td class="show-cell">
                  <span class="${show.c} chip">${platformDisplay}</span>
                  <div class="show-title ${statusClass}">${displayTitle}</div>
                  <div class="show-details">${dateInfo}</div>
                </td>
              `;
            } else {
              tableHtml += '<td class="empty-cell"></td>';
            }
          } else {
            tableHtml += '<td class="empty-cell"></td>';
          }
        });
        tableHtml += '</tr>';
      }
      tableHtml += '</tbody></table>';

      // Add summary information
      const totalFilteredShows = showEntries.length;
      const showsWithAirDays = showEntries.filter(({ show }) => show.air).length;
      const showsWithoutAirDays = totalFilteredShows - showsWithAirDays;

      tableHtml += `<div class="week-summary">
        <p><strong>Weekly Schedule Summary:</strong></p>
        <ul>
          <li>${totalFilteredShows} shows total (after filters)</li>
          <li>${showsWithAirDays} shows with air day information</li>
          ${showsWithoutAirDays > 0 ? `<li>${showsWithoutAirDays} shows without air day information</li>` : ''}
        </ul>
      </div>`;

      // Add search indicator if searching
      if (this.searchTerm) {
        const searchIndicator = `<div class="search-results-indicator"><span class="muted">Week view filtered for "${this.escapeHtml(this.searchTerm)}" - ${totalFilteredShows} shows found</span></div>`;
        tableHtml = searchIndicator + tableHtml;
      }

      tableHtml += '</div>';
      this.elements.weekTable.innerHTML = tableHtml;

      logger.info(`Week view rendered with ${totalFilteredShows} shows across ${days.length} days`);
    } catch (error) {
      logger.error('Error rendering week view', error);
      this.elements.weekTable.innerHTML = '<p>Error loading week view. Please refresh the page.</p>';
    }
  }

  /**
   * Get filtered show entries based on platform and status filters
   */
  private getFilteredShowEntries(showEntries: Array<{ id: number; show: Show }>): Array<{ id: number; show: Show }> {
    const selectedPlatforms = this.getSelectedPlatforms();
    const includeNonReturning = this.isNonReturningEnabled();

    return showEntries.filter(({ show }) => {
      // Platform filter
      if (!selectedPlatforms.has(show.c)) {
        return false;
      }

      // Returning status filter
      if (!includeNonReturning && show.ret === false) {
        return false;
      }

      return true;
    });
  }

  /**
   * Get selected platform filters from checkboxes
   */
  private getSelectedPlatforms(): Set<string> {
    const platforms = new Set<string>();
    const platformIds = ['pf-hulu', 'pf-peacock', 'pf-paramount'];
    
    platformIds.forEach(id => {
      const checkbox = document.getElementById(id) as HTMLInputElement;
      if (checkbox?.checked) {
        const platform = id.replace('pf-', '');
        platforms.add(platform);
      }
    });

    return platforms;
  }

  /**
   * Check if non-returning shows filter is enabled
   */
  private isNonReturningEnabled(): boolean {
    const checkbox = document.getElementById('show-nonret') as HTMLInputElement;
    return checkbox?.checked ?? false;
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
   * Escape regex special characters
   */
  private escapeRegex(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Get current view mode
   */
  getViewMode(): 'all' | 'week' {
    return this.viewMode.current;
  }

  /**
   * Render legend table
   */
  renderLegend(): void {
    const legendElement = this.elements.legendTable;
    if (!legendElement) {
      logger.error('Legend table element not found - #legendTable is null');
      return;
    }

    try {
      logger.info('Rendering legend table...');
      
      // Quick test to verify element works
      legendElement.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';
      
      // Get all shows and convert to array format
      const allShows = this.showManager.getAllShows();
      logger.info(`Found ${Object.keys(allShows).length} total shows`);
      let showEntries = Object.entries(allShows).map(([id, show]) => ({ id: parseInt(id), show }));

      // Apply platform and status filters
      showEntries = this.getFilteredShowEntries(showEntries);

      // Apply search filter if there's a search term
      if (this.searchTerm) {
        const searchResults = this.showManager.searchShows(this.searchTerm);
        const searchIds = new Set(Object.keys(searchResults).map(id => parseInt(id)));
        showEntries = showEntries.filter(({ id }) => searchIds.has(id));
      }

      // Sort by ID
      showEntries.sort((a, b) => a.id - b.id);

      // Build legend table rows (4 columns per row)
      let rows = '';
      for (let i = 0; i < showEntries.length; i += 4) {
        const rowEntries = showEntries.slice(i, i + 4);
        let cells = rowEntries.map(({ id, show }) => {
          const statusClass = show.ret ? '' : 'ended';
          
          // Format date information
          const seasonInfo = show.s ? `S${show.s}` : 'S?';
          const dateInfo = show.start 
            ? `${seasonInfo}: ${show.start}${show.end ? ' – ' + show.end : ''}` 
            : 'Season dates: TBD';

          // Highlight search terms in title
          let displayTitle = show.t;
          if (this.searchTerm) {
            const regex = new RegExp(`(${this.escapeRegex(this.searchTerm)})`, 'gi');
            displayTitle = show.t.replace(regex, '<mark>$1</mark>');
          }

          return `<td>
            <span class="${show.c} chip">${id}</span> 
            <span class="${statusClass}">${displayTitle}</span>
            <span class="meta">${dateInfo}</span>
          </td>`;
        }).join('');

        // Pad with empty cells if needed
        const cellCount = rowEntries.length;
        for (let j = cellCount; j < 4; j++) {
          cells += '<td></td>';
        }

        rows += `<tr>${cells}</tr>`;
      }

      if (showEntries.length === 0) {
        rows = '<tr><td colspan="4" style="text-align: center; font-style: italic;">No shows match the current search and filters.</td></tr>';
      }

      legendElement.innerHTML = rows;
      logger.info(`Legend rendered with ${showEntries.length} shows`);
    } catch (error) {
      logger.error('Error rendering legend', error);
      legendElement.innerHTML = '<tr><td colspan="4">Error loading shows. Please refresh the page.</td></tr>';
    }
  }

  /**
   * Render editor form
   */
  renderEditor(): void {
    const editWrapElement = this.elements.editWrap;
    if (!editWrapElement) {
      logger.error('Editor wrap element not found - #editWrap is null');
      return;
    }

    try {
      logger.info('Rendering editor form...');
      
      // Quick test to verify element works
      editWrapElement.innerHTML = '<p>Loading editor...</p>';
      
      const allShows = this.showManager.getAllShows();
      logger.info(`Building editor for ${Object.keys(allShows).length} shows`);
      const showEntries = Object.entries(allShows)
        .map(([id, show]) => ({ id: parseInt(id), show }))
        .sort((a, b) => a.id - b.id);

      let html = '<table class="editor"><thead><tr><th>#</th><th>Title</th><th>Platform</th><th>Network</th><th>Air Day</th><th>Season</th><th>Start</th><th>End</th><th>Eps</th><th>Returning</th></tr></thead><tbody>';

      const dayOrder = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

      showEntries.forEach(({ id, show }) => {
        const platformDisplay = show.c.charAt(0).toUpperCase() + show.c.slice(1);
        html += `<tr>
          <td>${id}</td>
          <td>${show.t}</td>
          <td><span class="${show.c} chip">${platformDisplay}</span></td>
          <td><span class="${show.net.toLowerCase()}-logo">${show.net}</span></td>
          <td>
            <select data-k="${id}" data-f="air">
              ${['', ...dayOrder].map(d => 
                `<option value="${d}" ${show.air === d ? 'selected' : ''}>${d || '—'}</option>`
              ).join('')}
            </select>
          </td>
          <td><input type="number" min="1" max="50" data-k="${id}" data-f="s" value="${show.s ?? ''}" title="Season number (1-50)"></td>
          <td><input type="date" data-k="${id}" data-f="start" value="${show.start || ''}" title="Season start date"></td>
          <td><input type="date" data-k="${id}" data-f="end" value="${show.end || ''}" title="Season end date"></td>
          <td><input type="number" min="1" max="100" data-k="${id}" data-f="eps" value="${show.eps ?? ''}" title="Number of episodes (1-100)"></td>
          <td style="text-align: center"><input type="checkbox" data-k="${id}" data-f="ret" ${show.ret ? 'checked' : ''} title="Is this show returning?"></td>
        </tr>`;
      });

      html += '</tbody></table><div style="margin-top: 8px;"><button id="saveEdits" type="button" class="btn">Save Changes</button> <span class="muted">Saves locally in your browser</span></div>';
      editWrapElement.innerHTML = html;

      // Add event listener for save button
      const saveBtn = document.getElementById('saveEdits');
      if (saveBtn) {
        saveBtn.addEventListener('click', () => this.handleSaveEdits());
      }

      logger.info('Editor rendered');
    } catch (error) {
      logger.error('Error rendering editor', error);
      editWrapElement.innerHTML = '<p>Error loading editor. Please refresh the page.</p>';
    }
  }

  /**
   * Handle saving editor changes
   */
  private handleSaveEdits(): void {
    try {
      const inputs = document.querySelectorAll('#editWrap [data-k]');
      const changes: Record<number, Partial<Show>> = {};

      inputs.forEach(el => {
        const element = el as HTMLInputElement | HTMLSelectElement;
        const k = element.getAttribute('data-k');
        const f = element.getAttribute('data-f');
        
        if (!k || !f) {
          return;
        }

        const showId = parseInt(k);
        let val: string | number | boolean | null = element.type === 'checkbox' 
          ? (element as HTMLInputElement).checked 
          : element.value;

        if (f === 's' || f === 'eps') {
          val = val ? parseInt(val as string, 10) : null;
        }

        if (!changes[showId]) {
          changes[showId] = {};
        }

        (changes[showId] as Record<string, unknown>)[f] = val === '' ? '' : val;
      });

      // Update shows in the show manager
      Object.entries(changes).forEach(([showId, updates]) => {
        const id = parseInt(showId);
        const allShows = this.showManager.getAllShows();
        if (allShows[id]) {
          Object.assign(allShows[id], updates);
        }
      });

      logger.info('Editor changes saved', changes);
      
      // Re-render all views
      this.renderCurrentView();
      this.renderLegend();
      
      alert('Changes saved successfully!');
    } catch (error) {
      logger.error('Error saving editor changes', error);
      alert('Error saving changes. Please try again.');
    }
  }

  /**
   * Get current search term
   */
  getSearchTerm(): string {
    return this.searchTerm;
  }

  /**
   * Set mode change callback
   */
  onModeChange(callback: (mode: 'all' | 'week') => void): void {
    this.viewMode.onModeChange = callback;
  }

  /**
   * Destroy DOM integration and clean up
   */
  destroy(): void {
    // Clear any pending debounce timers
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // Cleanup reactive subscriptions
    this.unsubscribers.forEach(unsub => unsub());
    this.unsubscribers = [];

    // Event listeners will be automatically removed when elements are removed
    logger.info('DOM integration destroyed');
  }
}