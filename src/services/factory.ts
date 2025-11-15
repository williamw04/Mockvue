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
  ElectronAgentService,
} from './electron';

// Web services
import {
  WebStorageService,
  WebFileService,
  WebNotificationService,
  WebAgentService,
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
      agent: new ElectronAgentService(),
    };
  }

  // Web platform
  return {
    storage: new WebStorageService(),
    files: new WebFileService(),
    notifications: new WebNotificationService(),
    agent: new WebAgentService(),
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

