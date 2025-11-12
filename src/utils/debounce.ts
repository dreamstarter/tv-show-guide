/**
 * Debounce utility function for performance optimization
 */

/**
 * Creates a debounced function that delays invoking func until after delay milliseconds
 * have elapsed since the last time the debounced function was invoked
 */
export const debounce = <T extends unknown[]>(
  func: (...args: T) => void, 
  delay: number
): ((...args: T) => void) & { cancel: () => void } => {
  let timeoutId: number | undefined;
  
  const debouncedFunction = (...args: T): void => {
    clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => func(...args), delay);
  };
  
  debouncedFunction.cancel = (): void => {
    clearTimeout(timeoutId);
  };
  
  return debouncedFunction;
};