/**
 * DOM manipulation utilities for the TV Show Guide application
 */

/**
 * Creates an HTML element with optional class name and text content
 */
export const createElement = (tagName: string, className?: string, content?: string): HTMLElement => {
  const element = document.createElement(tagName);
  if (className) {
    element.className = className;
  }
  if (content) {
    element.textContent = content;
  }
  return element;
};

/**
 * Creates a span element with text and class name
 */
export const span = (text: string | number, className: string): string => 
  `<span class="${className}">${text}</span>`;