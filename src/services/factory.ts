/**
 * Service Factory
 * Creates the appropriate service implementations based on the platform
 */

import { getPlatform } from '../utils/platform';
import type { IAppServices } from './interfaces';

// Electron services
import {
  ElectronStorageService,
  ElectronFileService,
  ElectronNotificationService,
  ElectronAgenticService,
} from './electron';

// Web services
import {
  WebStorageService,
  WebFileService,
  WebNotificationService,
  WebAgenticService,
} from './web';

/**
 * Creates and returns the appropriate services for the current platform
 */
export function createServices(): IAppServices {
  const platform = getPlatform();

  if (platform === 'electron') {
    return {
      storage: new ElectronStorageService(),
      files: new ElectronFileService(),
      notifications: new ElectronNotificationService(),
      agentic: new ElectronAgenticService(),
    };
  }

  // Web platform
  return {
    storage: new WebStorageService(),
    files: new WebFileService(),
    notifications: new WebNotificationService(),
    agentic: new WebAgenticService(),
  };
}

/**
 * Singleton instance of services
 * Initialized on first access
 */
let servicesInstance: IAppServices | null = null;

/**
 * Get the singleton instance of services
 */
export function getServices(): IAppServices {
  if (!servicesInstance) {
    servicesInstance = createServices();
  }
  return servicesInstance;
}

/**
 * Reset the services instance (useful for testing)
 */
export function resetServices(): void {
  servicesInstance = null;
}

