/**
 * State management service for the TV Show Guide application
 */

import { SearchResult } from '../types/index.js';

interface AppState {
  weekOffset: number;
  currentSearchTerm: string;
  searchResults: SearchResult[] | null;
}

export class StateService {
  private state: AppState;
  private listeners: ((state: AppState) => void)[] = [];

  constructor() {
    this.state = {
      weekOffset: 0,
      currentSearchTerm: '',
      searchResults: null
    };
  }

  /**
   * Get current state
   */
  getState(): Readonly<AppState> {
    return { ...this.state };
  }

  /**
   * Update state and notify listeners
   */
  setState(updates: Partial<AppState>): void {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener: (state: AppState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Week offset getters and setters
   */
  getWeekOffset(): number {
    return this.state.weekOffset;
  }

  setWeekOffset(offset: number): void {
    this.setState({ weekOffset: offset });
  }

  /**
   * Search term getters and setters
   */
  getSearchTerm(): string {
    return this.state.currentSearchTerm;
  }

  setSearchTerm(term: string): void {
    this.setState({ currentSearchTerm: term });
  }

  /**
   * Search results getters and setters
   */
  getSearchResults(): SearchResult[] | null {
    return this.state.searchResults;
  }

  setSearchResults(results: SearchResult[] | null): void {
    this.setState({ searchResults: results });
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
  }
}