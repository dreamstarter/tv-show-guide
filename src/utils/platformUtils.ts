/**
 * Platform utility functions for the TV Show Guide application
 */

import { Platform } from '../types/index.js';

/**
 * Gets the currently selected platforms from checkboxes
 */
export const getSelectedPlatforms = (): Set<Platform> => {
  const platforms = new Set<Platform>();
  const platformList: Platform[] = ['hulu', 'peacock', 'paramount'];
  
  platformList.forEach((platform: Platform) => {
    const checkbox = document.getElementById(`pf-${platform}`) as HTMLInputElement | null;
    if (checkbox?.checked) {
      platforms.add(platform);
    }
  });
  
  return platforms;
};