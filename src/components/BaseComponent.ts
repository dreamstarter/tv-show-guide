/**
 * BaseComponent - Abstract base class for all UI components
 * 
 * Provides:
 * - Lifecycle management (mount, unmount, update)
 * - Event listener tracking and cleanup
 * - Props handling
 * - Automatic DOM element creation
 * 
 * @example
 * class MyComponent extends BaseComponent<MyProps> {
 *   protected render(): string {
 *     return `<div>Hello ${this.props.name}</div>`;
 *   }
 * }
 */

import { logger } from '../utils/logger.js';

/**
 * Base properties that all components receive
 */
export interface BaseProps {
  className?: string;
  id?: string;
}

/**
 * Event listener registration for cleanup tracking
 */
interface EventListenerEntry {
  element: Element | Window | Document;
  event: string;
  handler: EventListener;
  options: boolean | AddEventListenerOptions | undefined;
}

/**
 * Abstract base component class
 */
export abstract class BaseComponent<TProps extends BaseProps = BaseProps> {
  protected props: TProps;
  protected element: HTMLElement | null = null;
  protected mounted: boolean = false;
  private eventListeners: EventListenerEntry[] = [];
  private unsubscribers: Array<() => void> = [];

  /**
   * Create a new component instance
   * @param props - Component properties
   */
  constructor(props: TProps) {
    this.props = props;
  }

  /**
   * Render the component's HTML template
   * Must be implemented by subclasses
   * @returns HTML string for the component
   */
  protected abstract render(): string;

  /**
   * Get the component's root element tag name
   * Override to use a different tag (default: 'div')
   */
  protected getTagName(): string {
    return 'div';
  }

  /**
   * Get the component's CSS class name
   * Override to customize (default: lowercase class name without 'Component' suffix)
   */
  protected getClassName(): string {
    const className = this.constructor.name
      .replace(/Component$/, '')
      .replace(/([A-Z])/g, '-$1')
      .toLowerCase()
      .replace(/^-/, '');
    
    return this.props.className 
      ? `${className} ${this.props.className}`
      : className;
  }

  /**
   * Called after the component is mounted to the DOM
   * Override to add custom initialization logic
   */
  protected onMount(): void {
    // Override in subclasses
  }

  /**
   * Called before the component is unmounted from the DOM
   * Override to add custom cleanup logic
   */
  protected onUnmount(): void {
    // Override in subclasses
  }

  /**
   * Called after props are updated
   * Override to react to prop changes
   */
  protected onUpdate(_prevProps: TProps): void {
    // Override in subclasses
  }

  /**
   * Create the component's DOM element
   * @returns The created HTML element
   */
  protected createElement(): HTMLElement {
    const element = document.createElement(this.getTagName());
    element.className = this.getClassName();
    
    if (this.props.id) {
      element.id = this.props.id;
    }
    
    const html = this.render();
    element.innerHTML = html;
    
    return element;
  }

  /**
   * Mount the component to a parent element
   * @param parent - Parent element or selector
   */
  mount(parent: HTMLElement | string): void {
    if (this.mounted) {
      logger.warn(`Component ${this.constructor.name} is already mounted`);
      return;
    }

    const parentElement = typeof parent === 'string' 
      ? document.querySelector(parent) as HTMLElement
      : parent;

    if (!parentElement) {
      throw new Error(`Cannot mount ${this.constructor.name}: parent element not found`);
    }

    // Create and append element
    this.element = this.createElement();
    parentElement.appendChild(this.element);
    
    this.mounted = true;
    
    // Call lifecycle hook
    this.onMount();
    
    logger.debug(`Component ${this.constructor.name} mounted`);
  }

  /**
   * Unmount the component from the DOM
   */
  unmount(): void {
    if (!this.mounted || !this.element) {
      logger.warn(`Component ${this.constructor.name} is not mounted`);
      return;
    }

    // Call lifecycle hook
    this.onUnmount();
    
    // Remove from DOM
    this.element.remove();
    this.element = null;
    this.mounted = false;
    
    logger.debug(`Component ${this.constructor.name} unmounted`);
  }

  /**
   * Update the component with new props
   * @param newProps - New properties to merge with existing props
   */
  update(newProps: Partial<TProps>): void {
    if (!this.mounted || !this.element) {
      logger.warn(`Cannot update unmounted component ${this.constructor.name}`);
      return;
    }

    const prevProps = { ...this.props };
    this.props = { ...this.props, ...newProps };

    // Re-render
    const html = this.render();
    this.element.innerHTML = html;

    // Update classes if className changed
    if (newProps.className !== undefined) {
      this.element.className = this.getClassName();
    }

    // Update id if changed
    if (newProps.id !== undefined) {
      this.element.id = newProps.id || '';
    }

    // Call lifecycle hook
    this.onUpdate(prevProps);
    
    logger.debug(`Component ${this.constructor.name} updated`);
  }

  /**
   * Add an event listener and track it for cleanup
   * @param element - Element to attach listener to
   * @param event - Event name
   * @param handler - Event handler function
   * @param options - Event listener options
   */
  protected addEventListener(
    element: Element | Window | Document,
    event: string,
    handler: EventListener,
    options?: boolean | AddEventListenerOptions
  ): void {
    element.addEventListener(event, handler, options);
    
    this.eventListeners.push({
      element,
      event,
      handler,
      options
    });
  }

  /**
   * Add a subscription that will be cleaned up on destroy
   * @param unsubscribe - Unsubscribe function returned from a subscription
   */
  protected addSubscription(unsubscribe: () => void): void {
    this.unsubscribers.push(unsubscribe);
  }

  /**
   * Query a child element within the component
   * @param selector - CSS selector
   * @returns The found element or null
   */
  protected query<T extends HTMLElement = HTMLElement>(selector: string): T | null {
    if (!this.element) {
      return null;
    }
    return this.element.querySelector(selector) as T | null;
  }

  /**
   * Query all child elements matching selector within the component
   * @param selector - CSS selector
   * @returns NodeList of found elements
   */
  protected queryAll<T extends HTMLElement = HTMLElement>(selector: string): NodeListOf<T> {
    if (!this.element) {
      return document.querySelectorAll<T>('__no_match__');
    }
    return this.element.querySelectorAll<T>(selector);
  }

  /**
   * Check if the component is currently mounted
   */
  isMounted(): boolean {
    return this.mounted;
  }

  /**
   * Get the component's root element
   */
  getElement(): HTMLElement | null {
    return this.element;
  }

  /**
   * Destroy the component and clean up all resources
   * This will unmount the component and remove all event listeners
   */
  destroy(): void {
    // Unmount if still mounted
    if (this.mounted) {
      this.unmount();
    }

    // Remove all event listeners
    this.eventListeners.forEach(({ element, event, handler, options }) => {
      element.removeEventListener(event, handler, options);
    });
    this.eventListeners = [];

    // Call all unsubscribe functions
    this.unsubscribers.forEach(unsubscribe => unsubscribe());
    this.unsubscribers = [];

    logger.debug(`Component ${this.constructor.name} destroyed`);
  }

  /**
   * Escape HTML special characters to prevent XSS
   * @param unsafe - Unsafe string that may contain HTML
   * @returns Escaped safe string
   */
  protected escapeHtml(unsafe: string): string {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
