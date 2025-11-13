/**
 * DOM Integration Layer (Refactored)
 * Connects the component architecture to the HTML elements
 * Uses component-based architecture instead of manual DOM manipulation
 */

import { logger } from '../utils/logger.js';
import { ReactiveShowManager } from '../state/ReactiveShowManager.js';

// Import all components
import {
  FilterControls,
  SearchBox,
  WeekNavigator,
  StatsDisplay,
  LegendTable,
  WeekViewTable,
  AllShowsList
} from '../components/index.js';

/**
 * DOM Integration class for managing UI interactions with components
 */
export class DOMIntegrationRefactored {
  private reactiveShowManager: ReactiveShowManager;
  private currentView: 'all' | 'week' = 'all';
  
  // Component instances
  private filterControls: FilterControls | null = null;
  private searchBox: SearchBox | null = null;
  private weekNavigator: WeekNavigator | null = null;
  private statsDisplay: StatsDisplay | null = null;
  private legendTable: LegendTable | null = null;
  private weekViewTable: WeekViewTable | null = null;
  private allShowsList: AllShowsList | null = null;
  
  // DOM element references
  private elements = {
    btnAll: document.getElementById('btnAll') as HTMLButtonElement | null,
    btnWeek: document.getElementById('btnWeek') as HTMLButtonElement | null,
    viewAll: document.getElementById('viewAll') as HTMLElement | null,
    viewWeek: document.getElementById('viewWeek') as HTMLElement | null,
    filtersSection: document.querySelector('.filters') as HTMLElement | null,
    searchContainer: document.querySelector('.search-container') as HTMLElement | null,
    filterRows: document.querySelectorAll('.filter-row'),
    legendSection: document.querySelector('section:has(#legendTable)') as HTMLElement | null,
    legendTable: document.getElementById('legendTable') as HTMLElement | null,
    allList: document.getElementById('allList') as HTMLElement | null,
    weekControls: document.querySelector('#viewWeek .controls') as HTMLElement | null,
    weekTable: document.getElementById('weekTable') as HTMLElement | null,
    undoBtn: document.getElementById('undoBtn') as HTMLButtonElement | null,
    redoBtn: document.getElementById('redoBtn') as HTMLButtonElement | null,
    historyStatus: document.getElementById('historyStatus') as HTMLElement | null,
    importBtn: document.getElementById('importBtn') as HTMLButtonElement | null,
    exportBtn: document.getElementById('exportBtn') as HTMLButtonElement | null,
    importFile: document.getElementById('importFile') as HTMLInputElement | null
  };

  constructor(reactiveShowManager: ReactiveShowManager) {
    this.reactiveShowManager = reactiveShowManager;
  }

  /**
   * Initialize DOM integration and mount components
   */
  init(): void {
    try {
      logger.info('Initializing refactored DOM integration with components...');
      
      // Initialize all components
      this.initializeComponents();
      
      // Setup view toggle handlers
      this.setupViewToggles();
      
      // Setup history controls
      this.setupHistoryControls();
      
      // Setup import/export
      this.setupImportExport();
      
      // Set initial view
      this.setView('all');
      
      logger.info('DOM integration initialized successfully with component architecture');
    } catch (error) {
      logger.error('Failed to initialize DOM integration', error);
      throw error;
    }
  }

  /**
   * Initialize all component instances
   */
  private initializeComponents(): void {
    // Initialize FilterControls (replaces manual filter handling)
    const filterContainer = document.createElement('div');
    filterContainer.id = 'filter-controls-component';
    
    // Replace the existing filter rows with component
    if (this.elements.filterRows.length > 0) {
      const firstFilterRow = this.elements.filterRows[0] as HTMLElement;
      firstFilterRow.parentNode?.insertBefore(filterContainer, firstFilterRow);
      
      // Hide original filter rows
      this.elements.filterRows.forEach(row => {
        (row as HTMLElement).style.display = 'none';
      });
    }
    
    this.filterControls = new FilterControls(
      {},
      this.reactiveShowManager
    );
    this.filterControls.mount(filterContainer);
    logger.info('FilterControls component mounted');

    // Initialize SearchBox (replaces manual search handling)
    const searchContainer = this.elements.searchContainer;
    if (searchContainer) {
      // Hide original search input
      const originalInput = searchContainer.querySelector('#searchInput');
      const originalClear = searchContainer.querySelector('#clearSearch');
      if (originalInput) {
        (originalInput as HTMLElement).style.display = 'none';
      }
      if (originalClear) {
        (originalClear as HTMLElement).style.display = 'none';
      }
      
      const searchBoxContainer = document.createElement('div');
      searchBoxContainer.id = 'search-box-component';
      searchContainer.appendChild(searchBoxContainer);
      
      this.searchBox = new SearchBox(
        {
          placeholder: 'Search by title, network, or platform...'
        },
        this.reactiveShowManager
      );
      this.searchBox.mount(searchBoxContainer);
      logger.info('SearchBox component mounted');
    }

    // Initialize WeekNavigator (replaces manual week navigation)
    const weekControls = this.elements.weekControls;
    if (weekControls) {
      // Hide original week controls
      weekControls.querySelectorAll('button, input, span').forEach(el => {
        (el as HTMLElement).style.display = 'none';
      });
      
      const weekNavContainer = document.createElement('div');
      weekNavContainer.id = 'week-navigator-component';
      weekControls.appendChild(weekNavContainer);
      
      this.weekNavigator = new WeekNavigator(
        {},
        this.reactiveShowManager
      );
      this.weekNavigator.mount(weekNavContainer);
      logger.info('WeekNavigator component mounted');
    }

    // Initialize LegendTable (replaces manual legend rendering)
    const legendContainer = this.elements.legendTable;
    if (legendContainer) {
      // Clear any existing content
      legendContainer.innerHTML = '';
      
      this.legendTable = new LegendTable(
        {
          showEditButton: false
        },
        this.reactiveShowManager
      );
      this.legendTable.mount(legendContainer);
      logger.info('LegendTable component mounted');
    }

    // Initialize WeekViewTable (replaces manual week view rendering)
    const weekTableContainer = this.elements.weekTable;
    if (weekTableContainer) {
      // Clear any existing content
      weekTableContainer.innerHTML = '';
      
      this.weekViewTable = new WeekViewTable({
        manager: this.reactiveShowManager,
        showEditButton: false
      });
      this.weekViewTable.mount(weekTableContainer);
      logger.info('WeekViewTable component mounted');
    }

    // Initialize AllShowsList (replaces manual all shows rendering)
    const allListContainer = this.elements.allList;
    if (allListContainer) {
      // Clear any existing content
      allListContainer.innerHTML = '';
      
      this.allShowsList = new AllShowsList({
        manager: this.reactiveShowManager,
        showEditButton: false
      });
      this.allShowsList.mount(allListContainer);
      logger.info('AllShowsList component mounted');
    }

    // Initialize StatsDisplay (optional - for showing statistics)
    // We can add this to the page if desired, but it's not in the original HTML
    // For now, we'll skip it unless you want to add a stats section
  }

  /**
   * Setup view toggle buttons
   */
  private setupViewToggles(): void {
    this.elements.btnAll?.addEventListener('click', () => {
      this.setView('all');
    });

    this.elements.btnWeek?.addEventListener('click', () => {
      this.setView('week');
    });
  }

  /**
   * Set the view mode (All Shows or Week Airing)
   */
  private setView(mode: 'all' | 'week'): void {
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

    this.currentView = mode;
    logger.info(`View mode set to: ${mode}`);
  }

  /**
   * Setup history controls (undo/redo)
   */
  private setupHistoryControls(): void {
    // Update button states initially
    this.updateHistoryButtons();

    // Setup undo/redo button handlers
    this.elements.undoBtn?.addEventListener('click', () => {
      this.handleUndo();
    });

    this.elements.redoBtn?.addEventListener('click', () => {
      this.handleRedo();
    });

    // Setup keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Ctrl+Z or Cmd+Z for undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        this.handleUndo();
      }
      // Ctrl+Y or Cmd+Y or Ctrl+Shift+Z for redo
      else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        this.handleRedo();
      }
    });

    // Subscribe to state changes to update history buttons
    this.reactiveShowManager.subscribeToAllChanges(() => {
      this.updateHistoryButtons();
    });
  }

  /**
   * Handle undo action
   */
  private handleUndo(): void {
    if (this.reactiveShowManager.canUndo()) {
      this.reactiveShowManager.undo();
      logger.info('Undo performed');
    }
  }

  /**
   * Handle redo action
   */
  private handleRedo(): void {
    if (this.reactiveShowManager.canRedo()) {
      this.reactiveShowManager.redo();
      logger.info('Redo performed');
    }
  }

  /**
   * Update the state of history buttons
   */
  private updateHistoryButtons(): void {
    const { undoBtn, redoBtn, historyStatus } = this.elements;
    
    if (undoBtn) {
      undoBtn.disabled = !this.reactiveShowManager.canUndo();
    }
    
    if (redoBtn) {
      redoBtn.disabled = !this.reactiveShowManager.canRedo();
    }

    if (historyStatus) {
      const info = this.reactiveShowManager.getHistoryInfo();
      if (info.size > 0 && info.currentIndex >= 0) {
        historyStatus.textContent = `${info.currentIndex + 1}/${info.size}`;
      } else {
        historyStatus.textContent = '';
      }
    }
  }

  /**
   * Setup import/export functionality
   */
  private setupImportExport(): void {
    this.elements.importBtn?.addEventListener('click', () => {
      this.elements.importFile?.click();
    });

    this.elements.exportBtn?.addEventListener('click', () => {
      this.handleExport();
    });

    this.elements.importFile?.addEventListener('change', (e) => {
      this.handleFileImport(e);
    });
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
          
          // Replace all shows with imported data
          this.reactiveShowManager.replaceAllShows(data, 'import shows from file');
          
          logger.info('Import completed', { showCount: Object.keys(data).length });
          alert(`Successfully imported ${Object.keys(data).length} shows!`);
        } catch (error) {
          logger.error('Failed to parse imported file', error);
          alert('Invalid JSON file. Please check the file format and try again.');
        }
      };
      reader.readAsText(file);
    }
    
    // Reset file input
    target.value = '';
  }

  /**
   * Handle data export
   */
  private handleExport(): void {
    try {
      const shows = this.reactiveShowManager.getAllShows();
      const data = JSON.stringify(shows, null, 2);
      
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `tv-shows-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      logger.info('Export completed', { showCount: Object.keys(shows).length });
    } catch (error) {
      logger.error('Export failed', error);
      alert('Failed to export shows. Please try again.');
    }
  }

  /**
   * Get current view mode
   */
  getViewMode(): 'all' | 'week' {
    return this.currentView;
  }

  /**
   * Get component instances (for external access if needed)
   */
  getComponents(): {
    filterControls: FilterControls | null;
    searchBox: SearchBox | null;
    weekNavigator: WeekNavigator | null;
    statsDisplay: StatsDisplay | null;
    legendTable: LegendTable | null;
    weekViewTable: WeekViewTable | null;
    allShowsList: AllShowsList | null;
  } {
    return {
      filterControls: this.filterControls,
      searchBox: this.searchBox,
      weekNavigator: this.weekNavigator,
      statsDisplay: this.statsDisplay,
      legendTable: this.legendTable,
      weekViewTable: this.weekViewTable,
      allShowsList: this.allShowsList
    };
  }

  /**
   * Destroy DOM integration and clean up components
   */
  destroy(): void {
    // Destroy all component instances
    this.filterControls?.destroy();
    this.searchBox?.destroy();
    this.weekNavigator?.destroy();
    this.statsDisplay?.destroy();
    this.legendTable?.destroy();
    this.weekViewTable?.destroy();
    this.allShowsList?.destroy();
    
    logger.info('DOM integration destroyed with all components cleaned up');
  }
}
