import { BaseComponent } from '../core/BaseComponent.js';

export interface ShowStats {
  total: number;
  watching: number;
  completed: number;
  onHold: number;
  planToWatch: number;
  dropped: number;
  totalEpisodes: number;
  watchedEpisodes: number;
  averageProgress: number;
  favoriteCount: number;
  platformBreakdown: Record<string, number>;
  networkBreakdown: Record<string, number>;
}

export interface StatsDisplayProps {
  stats: ShowStats;
  showDetailed?: boolean;
  animated?: boolean;
  onViewChange?: (view: 'summary' | 'detailed') => void;
}

/**
 * StatsDisplay component for showing TV show statistics
 */
export class StatsDisplay extends BaseComponent<StatsDisplayProps> {
  constructor(props: StatsDisplayProps) {
    super(props, {
      className: 'stats-display',
      attributes: {
        'role': 'region',
        'aria-label': 'Show statistics'
      }
    });
  }

  /**
   * Render the stats display HTML
   */
  render(): string {
    const { showDetailed = false, animated = true } = this.props;

    return `
      <div class="stats-display-content ${animated ? 'animated' : ''}">
        <div class="stats-header">
          <h3 class="stats-title">Show Statistics</h3>
          <div class="stats-toggle">
            <button 
              class="btn btn-sm ${showDetailed ? 'btn-outline' : 'btn-primary'}" 
              data-view="summary"
            >
              Summary
            </button>
            <button 
              class="btn btn-sm ${showDetailed ? 'btn-primary' : 'btn-outline'}" 
              data-view="detailed"
            >
              Detailed
            </button>
          </div>
        </div>
        
        <div class="stats-body">
          ${showDetailed ? this.renderDetailedStats() : this.renderSummaryStats()}
        </div>
      </div>
    `;
  }

  /**
   * Render summary statistics view
   */
  private renderSummaryStats(): string {
    const { stats } = this.props;

    return `
      <div class="stats-summary">
        <div class="stats-grid">
          ${this.renderStatCard('Total Shows', stats.total, 'total', '📺')}
          ${this.renderStatCard('Watching', stats.watching, 'watching', '👀')}
          ${this.renderStatCard('Completed', stats.completed, 'completed', '✅')}
          ${this.renderStatCard('Favorites', stats.favoriteCount, 'favorites', '⭐')}
        </div>
        
        <div class="progress-overview">
          <div class="overall-progress">
            <div class="progress-label">Overall Progress</div>
            <div class="progress-bar large">
              <div 
                class="progress-fill" 
                style="width: ${stats.averageProgress}%"
                data-percentage="${stats.averageProgress}"
              ></div>
            </div>
            <div class="progress-text">
              ${stats.watchedEpisodes} / ${stats.totalEpisodes} episodes (${stats.averageProgress}%)
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render detailed statistics view
   */
  private renderDetailedStats(): string {
    const { stats } = this.props;

    return `
      <div class="stats-detailed">
        <div class="stats-section">
          <h4 class="section-title">Status Breakdown</h4>
          <div class="status-chart">
            ${this.renderStatusChart()}
          </div>
          <div class="status-list">
            ${this.renderStatusItem('Watching', stats.watching, 'watching')}
            ${this.renderStatusItem('Completed', stats.completed, 'completed')}
            ${this.renderStatusItem('On Hold', stats.onHold, 'on-hold')}
            ${this.renderStatusItem('Plan to Watch', stats.planToWatch, 'plan-to-watch')}
            ${this.renderStatusItem('Dropped', stats.dropped, 'dropped')}
          </div>
        </div>

        <div class="stats-section">
          <h4 class="section-title">Platform Distribution</h4>
          <div class="breakdown-list">
            ${Object.entries(stats.platformBreakdown)
              .map(([platform, count]) => this.renderBreakdownItem(platform, count))
              .join('')}
          </div>
        </div>

        <div class="stats-section">
          <h4 class="section-title">Network Distribution</h4>
          <div class="breakdown-list">
            ${Object.entries(stats.networkBreakdown)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 5) // Show top 5 networks
              .map(([network, count]) => this.renderBreakdownItem(network, count))
              .join('')}
          </div>
        </div>

        <div class="stats-section">
          <h4 class="section-title">Episode Statistics</h4>
          <div class="episode-stats">
            <div class="stat-row">
              <span class="stat-label">Total Episodes:</span>
              <span class="stat-value">${stats.totalEpisodes.toLocaleString()}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">Watched Episodes:</span>
              <span class="stat-value">${stats.watchedEpisodes.toLocaleString()}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">Remaining Episodes:</span>
              <span class="stat-value">${(stats.totalEpisodes - stats.watchedEpisodes).toLocaleString()}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">Average Progress:</span>
              <span class="stat-value">${stats.averageProgress}%</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render individual stat card
   */
  private renderStatCard(label: string, value: number, type: string, icon: string): string {
    return `
      <div class="stat-card stat-${type}">
        <div class="stat-icon">${icon}</div>
        <div class="stat-content">
          <div class="stat-value" data-count="${value}">${value}</div>
          <div class="stat-label">${label}</div>
        </div>
      </div>
    `;
  }

  /**
   * Render status chart (simple bar visualization)
   */
  private renderStatusChart(): string {
    const { stats } = this.props;
    const total = stats.total || 1; // Avoid division by zero

    const statuses = [
      { label: 'Watching', value: stats.watching, class: 'watching' },
      { label: 'Completed', value: stats.completed, class: 'completed' },
      { label: 'On Hold', value: stats.onHold, class: 'on-hold' },
      { label: 'Plan to Watch', value: stats.planToWatch, class: 'plan-to-watch' },
      { label: 'Dropped', value: stats.dropped, class: 'dropped' }
    ];

    return `
      <div class="chart-bars">
        ${statuses.map(status => {
          const percentage = Math.round((status.value / total) * 100);
          return `
            <div class="chart-bar">
              <div 
                class="bar-fill bar-${status.class}" 
                style="width: ${percentage}%"
                data-percentage="${percentage}"
                title="${status.label}: ${status.value} (${percentage}%)"
              ></div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  /**
   * Render status list item
   */
  private renderStatusItem(label: string, value: number, type: string): string {
    const { stats } = this.props;
    const percentage = stats.total > 0 ? Math.round((value / stats.total) * 100) : 0;

    return `
      <div class="status-item status-${type}">
        <div class="status-info">
          <span class="status-label">${label}</span>
          <span class="status-count">${value} (${percentage}%)</span>
        </div>
        <div class="status-bar">
          <div class="status-fill" style="width: ${percentage}%"></div>
        </div>
      </div>
    `;
  }

  /**
   * Render breakdown item (platform/network)
   */
  private renderBreakdownItem(label: string, count: number): string {
    const { stats } = this.props;
    const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;

    return `
      <div class="breakdown-item">
        <div class="breakdown-info">
          <span class="breakdown-label">${this.capitalizeFirst(label)}</span>
          <span class="breakdown-count">${count} (${percentage}%)</span>
        </div>
        <div class="breakdown-bar">
          <div class="breakdown-fill" style="width: ${percentage}%"></div>
        </div>
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
   * Set up event listeners for stats interactions
   */
  protected override setupEventListeners(): void {
    // View toggle buttons
    this.addEventListener('[data-view]', 'click', (event: Event) => {
      const target = event.target as HTMLButtonElement;
      const view = target.getAttribute('data-view') as 'summary' | 'detailed';
      this.handleViewChange(view);
    });

    // Animate counters on mount
    this.addEventListener('self', 'animationend', () => {
      this.animateCounters();
    });
  }

  /**
   * Handle view change between summary and detailed
   */
  private handleViewChange(view: 'summary' | 'detailed'): void {
    const { onViewChange } = this.props;

    if (onViewChange) {
      onViewChange(view);
    }

    // Update component
    this.update({ showDetailed: view === 'detailed' });

    // Emit view change event
    this.emit('stats-view-change', { view });
  }

  /**
   * Animate number counters
   */
  private animateCounters(): void {
    const counters = this.querySelectorAll('[data-count]');
    
    counters.forEach((counter: HTMLElement) => {
      const target = parseInt(counter.getAttribute('data-count') || '0');
      const duration = 1500; // Animation duration in ms
      const increment = target / (duration / 16); // 60fps
      let current = 0;

      const animate = (): void => {
        current += increment;
        if (current >= target) {
          counter.textContent = target.toString();
        } else {
          counter.textContent = Math.floor(current).toString();
          requestAnimationFrame(animate);
        }
      };

      if (this.props.animated !== false) {
        requestAnimationFrame(animate);
      } else {
        counter.textContent = target.toString();
      }
    });
  }

  /**
   * Update stats data
   */
  updateStats(stats: ShowStats): void {
    this.update({ stats });
    
    // Re-animate counters after update
    setTimeout(() => this.animateCounters(), 100);
  }

  /**
   * Toggle between summary and detailed views
   */
  toggleView(): void {
    const currentView = this.props.showDetailed ? 'detailed' : 'summary';
    const newView = currentView === 'summary' ? 'detailed' : 'summary';
    this.handleViewChange(newView);
  }

  /**
   * Get current view mode
   */
  getCurrentView(): 'summary' | 'detailed' {
    return this.props.showDetailed ? 'detailed' : 'summary';
  }

  /**
   * Get current stats data
   */
  getStats(): ShowStats {
    return { ...this.props.stats };
  }
}