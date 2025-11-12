/**
 * Core application module - Main application orchestrator
 * Manages application lifecycle, initialization, and coordination between modules
 */

import { ShowDatabase } from '../types/index.js';
import { StorageService } from '../services/storageService.js';
import { StateService } from '../services/stateService.js';
import { logger } from '../utils/logger.js';
import { CONFIG } from './config.js';
import * as ShowValidation from '../validation.js';

/**
 * Main Application class - orchestrates all application functionality
 */
export class Application {
  private readonly storageService: StorageService;
  private readonly stateService: StateService;
  private readonly errorHandler: ShowValidation.ErrorHandler;
  private readonly shows: ShowDatabase;
  private initialized = false;

  constructor(shows: ShowDatabase) {
    this.shows = shows;
    this.storageService = new StorageService(CONFIG.STORAGE_KEY);
    this.stateService = new StateService();
    this.errorHandler = new ShowValidation.ErrorHandler();
  }

  /**
   * Initialize the application
   */
  async init(): Promise<void> {
    try {
      if (this.initialized) {
        logger.warn('Application already initialized');
        return;
      }

      logger.info('Initializing TV Show Guide...');

      // Apply preloaded data if any
      await this.loadInitialData();
      
      // Load saved data from storage
      this.storageService.loadData(this.shows);
      
      // Initialize UI components (to be implemented)
      await this.initializeUI();
      
      // Bind event handlers
      this.bindEvents();
      
      this.initialized = true;
      logger.info('TV Show Guide initialized successfully!');
      
    } catch (error) {
      this.errorHandler.handleError(
        error instanceof Error ? error : new Error(String(error)), 
        true, 
        'Application initialization'
      );
      throw error;
    }
  }

  /**
   * Get the state service instance
   */
  getStateService(): StateService {
    return this.stateService;
  }

  /**
   * Get the storage service instance  
   */
  getStorageService(): StorageService {
    return this.storageService;
  }

  /**
   * Get the shows database
   */
  getShows(): Readonly<ShowDatabase> {
    return this.shows;
  }

  /**
   * Save application data
   */
  save(): void {
    this.storageService.saveData(this.shows);
  }

  /**
   * Shutdown the application gracefully
   */
  async shutdown(): Promise<void> {
    try {
      logger.info('Shutting down application...');
      
      // Save any pending changes
      this.save();
      
      // Cleanup resources
      this.cleanup();
      
      this.initialized = false;
      logger.info('Application shutdown complete');
      
    } catch (error) {
      logger.error('Error during shutdown:', error);
    }
  }

  /**
   * Load initial/preloaded data
   */
  private async loadInitialData(): Promise<void> {
    // This will be enhanced to load from external sources in the future
    logger.info('Loading initial data...');
  }

  /**
   * Initialize UI components
   */
  private async initializeUI(): Promise<void> {
    // Placeholder for UI initialization - will be implemented with components
    logger.info('Initializing UI components...');
  }

  /**
   * Bind event handlers
   */
  private bindEvents(): void {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.errorHandler.handleError(
        new Error(event.message),
        false,
        'Global error handler'
      );
    });

    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        // Save data when page becomes hidden
        this.save();
      }
    });

    logger.info('Event handlers bound');
  }

  /**
   * Cleanup resources
   */
  private cleanup(): void {
    // Cleanup any resources, timers, event listeners, etc.
    // This will be expanded as we add more features
  }
}