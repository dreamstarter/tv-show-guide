/**
 * StatsDisplay Component - Displays TV show statistics
 * 
 * Features:
 * - Total show count
 * - Returning vs non-returning breakdown
 * - Platform distribution (Hulu, Peacock, Paramount)
 * - Network distribution (ABC, NBC, CBS, FOX)
 * - Reactive updates from ReactiveShowManager
 */

import { BaseComponent, BaseProps } from './BaseComponent.js';
import { ReactiveShowManager } from '../state/ReactiveShowManager.js';
import { Platform, Network } from '../types/index.js';

/**
 * Statistics data structure
 */
export interface ShowStats {
  total: number;
  returning: number;
  nonReturning: number;
  byPlatform: Record<Platform, number>;
  byNetwork: Record<Network, number>;
}

/**
 * StatsDisplay component properties
 */
export interface StatsDisplayProps extends BaseProps {
  /** Callback when stats are updated */
  onStatsUpdate?: (stats: ShowStats) => void;
}

/**
 * StatsDisplay Component - Manages show statistics display
 */
export class StatsDisplay extends BaseComponent<StatsDisplayProps> {
  private showManager: ReactiveShowManager;
  private currentStats: ShowStats;
  private unsubscribe: (() => void) | null = null;

  /**
   * Create a new StatsDisplay instance
   */
  constructor(props: StatsDisplayProps, showManager: ReactiveShowManager) {
    super(props);
    this.showManager = showManager;
    this.currentStats = this.calculateStats();
  }

  /**
   * Render the stats display HTML
   */
  protected render(): string {
    const stats = this.currentStats;

    return `
      <div class="stats-display">
        <div class="stats-section">
          <h3 class="stats-section__title">Overview</h3>
          <div class="stats-grid">
            ${this.renderStatCard('Total Shows', stats.total, 'total')}
            ${this.renderStatCard('Returning', stats.returning, 'returning')}
            ${this.renderStatCard('Non-Returning', stats.nonReturning, 'non-returning')}
          </div>
        </div>

        <div class="stats-section">
          <h3 class="stats-section__title">By Platform</h3>
          <div class="stats-breakdown">
            ${this.renderPlatformStats(stats.byPlatform)}
          </div>
        </div>

        <div class="stats-section">
          <h3 class="stats-section__title">By Network</h3>
          <div class="stats-breakdown">
            ${this.renderNetworkStats(stats.byNetwork)}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Calculate statistics from show manager
   */
  private calculateStats(): ShowStats {
    const stats = this.showManager.getStats();
    
    return {
      total: stats.total,
      returning: stats.returning,
      nonReturning: stats.nonReturning,
      byPlatform: stats.byPlatform,
      byNetwork: stats.byNetwork
    };
  }

  /**
   * Render platform statistics
   */
  private renderPlatformStats(byPlatform: Record<Platform, number>): string {
    const platforms: Platform[] = ['hulu', 'peacock', 'paramount'];
    
    return platforms.map(platform => {
      const count = byPlatform[platform] || 0;
      const label = platform.charAt(0).toUpperCase() + platform.slice(1);
      return this.renderBreakdownItem(label, count, platform);
    }).join('');
  }

  /**
   * Render network statistics
   */
  private renderNetworkStats(byNetwork: Record<Network, number>): string {
    const networks: Network[] = ['ABC', 'NBC', 'CBS', 'FOX'];
    
    return networks.map(network => {
      const count = byNetwork[network] || 0;
      return this.renderBreakdownItem(network, count, network.toLowerCase());
    }).join('');
  }

  /**
   * Render individual stat card
   */
  private renderStatCard(label: string, value: number, type: string): string {
    return `
      <div class="stat-card stat-card--${type}">
        <div class="stat-card__value">${value}</div>
        <div class="stat-card__label">${label}</div>
      </div>
    `;
  }

  /**
   * Render breakdown item (platform/network)
   */
  private renderBreakdownItem(label: string, count: number, cssClass: string): string {
    const percentage = this.currentStats.total > 0 ? Math.round((count / this.currentStats.total) * 100) : 0;

    return `
      <div class="breakdown-item">
        <div class="breakdown-item__info">
          <span class="breakdown-item__label ${cssClass}">${this.escapeHtml(label)}</span>
          <span class="breakdown-item__count">${count}</span>
        </div>
        <div class="breakdown-item__bar">
          <div class="breakdown-item__fill" style="width: ${percentage}%"></div>
        </div>
      </div>
    `;
  }

  /**
   * Called after component is mounted
   */
  protected override onMount(): void {
    // Subscribe to stats changes from ReactiveShowManager
    this.unsubscribe = this.showManager.subscribeToStats((stats) => {
      this.currentStats = {
        total: stats.total,
        returning: stats.returning,
        nonReturning: stats.nonReturning,
        byPlatform: stats.byPlatform,
        byNetwork: stats.byNetwork
      };
      
      if (this.mounted) {
        this.update(this.props);
      }
      
      if (this.props.onStatsUpdate) {
        this.props.onStatsUpdate(this.currentStats);
      }
    });

    // Track the subscription for cleanup
    if (this.unsubscribe) {
      this.addSubscription(this.unsubscribe);
    }
  }

  /**
   * Get current stats data
   */
  getStats(): ShowStats {
    return { ...this.currentStats };
  }

  /**
   * Refresh stats from show manager
   */
  refresh(): void {
    this.currentStats = this.calculateStats();
    if (this.mounted) {
      this.update(this.props);
    }
  }
}