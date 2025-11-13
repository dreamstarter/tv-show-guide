/**
 * Component architecture demonstration
 * Shows how to use the new component system
 */

import { ShowCard } from '../components/index.js';
import type { Show } from '../types/index.js';
import { logger } from '../utils/logger.js';

/**
 * Demo component usage and integration
 */
export class ComponentDemo {
  private showCard?: ShowCard;

  /**
   * Initialize the component demonstration
   */
  init(): void {
    logger.info('Initializing component architecture demo');

    // Demo data using actual Show type
    const sampleShow: Show = {
      t: 'Breaking Bad',
      net: 'ABC',
      c: 'hulu',
      ret: false,
      start: '1/20/2008',
      end: '9/29/2013',
      s: 5,
      eps: 62,
      air: 'Sunday'
    };

    try {
      // Create and mount ShowCard component
      this.createShowCard(sampleShow);

      // Set up component communication
      this.setupComponentCommunication();

      logger.info('Component demo initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize component demo', error);
    }
  }

  /**
   * Create and mount ShowCard component
   */
  private createShowCard(show: Show): void {
    this.showCard = new ShowCard({
      show,
      showEditButton: true,
      onEdit: (show: Show) => logger.info('Edit clicked for:', show.t)
    });

    // Mount to demo container (would need to exist in HTML)
    const container = document.querySelector('#demo-show-card');
    if (container) {
      this.showCard.mount(container as HTMLElement);
    }
  }

  /**
   * Set up communication between components
   */
  private setupComponentCommunication(): void {
    // Example: When show card edit is clicked
    if (this.showCard) {
      logger.info('ShowCard created successfully');
    }
  }

  /**
   * Clean up all components
   */
  destroy(): void {
    this.showCard?.destroy();

    logger.info('Component demo destroyed');
  }

  /**
   * Get reference to the ShowCard component
   */
  getShowCard(): ShowCard | undefined {
    return this.showCard;
  }
}