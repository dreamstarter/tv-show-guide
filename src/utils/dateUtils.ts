/**
 * Date utility functions for the TV Show Guide application
 */

/**
 * Pads a number with leading zero if less than 10
 */
export const pad = (n: number): string => (n < 10 ? '0' : '') + n;

/**
 * Formats a date in a human-readable format (e.g., "Jan 15, 2025")
 */
export const formatDate = (d: Date): string => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
};

/**
 * Returns the start of the week (Sunday) for a given date
 */
export const startOfWeek = (d: Date): Date => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  const dow = x.getDay();
  x.setDate(x.getDate() - dow);
  return x;
};