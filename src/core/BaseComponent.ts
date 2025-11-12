import { logger } from '../utils/logger.js';

/**
 * Event handler type for component events
 */
export type EventHandler<T = unknown> = (data: T) => void;

/**
 * Component method type
 */
export type ComponentMethod = (...args: unknown[]) => unknown;

/**
 * Component lifecycle hooks
 */
export interface ComponentLifecycle {
  beforeMount?(): void;
  onMounted?(): void;
  beforeUpdate?(): void;
  onUpdated?(): void;
  beforeUnmount?(): void;
  onUnmounted?(): void;
}

/**
 * Component configuration options
 */
export interface ComponentOptions {
  selector?: string;
  template?: string;
  className?: string;
  attributes?: Record<string, string>;
}

/**
 * Default props interface
 */
export interface DefaultProps {
  [key: string]: unknown;
}

/**
 * Base component class providing common functionality for UI components
 */
export abstract class BaseComponent<TProps = DefaultProps> {
  protected element: HTMLElement | null = null;
  protected props: TProps;
  private isMountedState = false;
  private eventListeners: Map<string, EventHandler<unknown>[]> = new Map();
  private boundMethods: Map<string, ComponentMethod> = new Map();

  constructor(props: TProps, protected options: ComponentOptions = {}) {
    this.props = { ...props };
    this.bindMethods();
  }

  /**
   * Lifecycle hooks (can be overridden by subclasses)
   */
  beforeMount?(): void;
  onMounted?(): void;
  beforeUpdate?(): void;
  onUpdated?(): void;
  beforeUnmount?(): void;
  onUnmounted?(): void;

  /**
   * Bind all methods to maintain correct 'this' context
   */
  private bindMethods(): void {
    const prototype = Object.getPrototypeOf(this);
    const propertyNames = Object.getOwnPropertyNames(prototype);

    propertyNames.forEach(name => {
      const descriptor = Object.getOwnPropertyDescriptor(prototype, name);
      if (descriptor && typeof descriptor.value === 'function' && name !== 'constructor') {
        if (!this.boundMethods.has(name)) {
          this.boundMethods.set(name, descriptor.value.bind(this) as ComponentMethod);
        }
      }
    });
  }

  /**
   * Get bound method to ensure correct 'this' context
   */
  protected getBoundMethod(methodName: string): ComponentMethod {
    return this.boundMethods.get(methodName) || (this[methodName as keyof this] as ComponentMethod);
  }

  /**
   * Abstract method to render component HTML
   */
  abstract render(): string;

  /**
   * Mount component to DOM element or selector
   */
  mount(target: string | HTMLElement): this {
    try {
      this.beforeMount?.();

      // Find target element
      const targetElement = typeof target === 'string' 
        ? document.querySelector(target) as HTMLElement
        : target;

      if (!targetElement) {
        throw new Error(`Mount target not found: ${target}`);
      }

      // Create component element
      this.createElement();

      if (this.element) {
        // Add to DOM
        targetElement.appendChild(this.element);
        
        // Set up event listeners
        this.setupEventListeners();
        
        this.isMountedState = true;
        this.onMounted?.();
        
        logger.info(`Component mounted: ${this.constructor.name}`);
      }

      return this;
    } catch (error) {
      logger.error(`Failed to mount component: ${this.constructor.name}`, error);
      throw error;
    }
  }

  /**
   * Unmount component from DOM
   */
  unmount(): this {
    try {
      this.beforeUnmount?.();

      if (this.element && this.element.parentNode) {
        this.removeEventListeners();
        this.element.parentNode.removeChild(this.element);
        this.element = null;
        this.isMountedState = false;
        
        this.onUnmounted?.();
        logger.info(`Component unmounted: ${this.constructor.name}`);
      }

      return this;
    } catch (error) {
      logger.error(`Failed to unmount component: ${this.constructor.name}`, error);
      throw error;
    }
  }

  /**
   * Update component with new props
   */
  update(newProps: Partial<TProps>): this {
    try {
      this.beforeUpdate?.();

      this.props = { ...this.props, ...newProps };

      if (this.isMountedState && this.element) {
        this.element.innerHTML = this.render();
        this.setupEventListeners();
      }

      this.onUpdated?.();
      logger.info(`Component updated: ${this.constructor.name}`);

      return this;
    } catch (error) {
      logger.error(`Failed to update component: ${this.constructor.name}`, error);
      throw error;
    }
  }

  /**
   * Create DOM element for component
   */
  protected createElement(): void {
    const tagName = this.options.selector?.replace(/[#.].*/, '') || 'div';
    this.element = document.createElement(tagName);

    if (this.options.className) {
      this.element.className = this.options.className;
    }

    if (this.options.attributes) {
      Object.entries(this.options.attributes).forEach(([key, value]) => {
        this.element?.setAttribute(key, value);
      });
    }

    this.element.innerHTML = this.render();
  }

  /**
   * Set up event listeners (override in subclasses)
   */
  protected setupEventListeners(): void {
    // Override in subclasses
  }

  /**
   * Remove event listeners
   */
  protected removeEventListeners(): void {
    // Clear all registered event listeners
    this.eventListeners.clear();
  }

  /**
   * Add event listener to component
   */
  protected addEventListener(
    selector: string, 
    event: string, 
    handler: EventHandler<Event>,
    options?: AddEventListenerOptions
  ): void {
    if (!this.element) {
      return;
    }

    const elements = selector === 'self' 
      ? [this.element]
      : Array.from(this.element.querySelectorAll(selector));

    elements.forEach(el => {
      const boundHandler = handler.bind(this);
      el.addEventListener(event, boundHandler, options);

      // Store for cleanup
      const key = `${selector}:${event}`;
      if (!this.eventListeners.has(key)) {
        this.eventListeners.set(key, []);
      }
      this.eventListeners.get(key)!.push(boundHandler as EventHandler<unknown>);
    });
  }

  /**
   * Emit custom event
   */
  protected emit(eventName: string, data?: unknown): void {
    if (this.element) {
      const event = new CustomEvent(eventName, { 
        detail: data,
        bubbles: true,
        cancelable: true
      });
      this.element.dispatchEvent(event);
    }
  }

  /**
   * Find element within component
   */
  protected querySelector(selector: string): HTMLElement | null {
    return this.element?.querySelector(selector) || null;
  }

  /**
   * Find all elements within component
   */
  protected querySelectorAll(selector: string): NodeListOf<HTMLElement> {
    return this.element?.querySelectorAll(selector) || document.querySelectorAll('');
  }

  /**
   * Get current props
   */
  getProps(): TProps {
    return { ...this.props };
  }

  /**
   * Check if component is mounted
   */
  isMounted(): boolean {
    return this.isMountedState;
  }

  /**
   * Get component element
   */
  getElement(): HTMLElement | null {
    return this.element;
  }
}