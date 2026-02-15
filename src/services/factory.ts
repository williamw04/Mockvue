/**
 * Service Factory
 * Creates the appropriate service implementations based on the platform
 */

import { getPlatform } from '../utils/platform';
import type { IAppServices } from './interfaces';

// Electron services
import {
  ElectronNotificationService,
  ElectronAgentService,
  ElectronUserService,
  ElectronDocumentService,
} from './electron';

// Web services
import {
  WebNotificationService,
  WebAgentService,
  WebUserService,
  WebDocumentService,
} from './web';

/**
 * Creates and returns the appropriate services for the current platform
 */
export function createServices(): IAppServices {
  const platform = getPlatform();

  if (platform === 'electron') {
    return {
      notifications: new ElectronNotificationService(),
      agent: new ElectronAgentService(),
      user: new ElectronUserService(),
      documents: new ElectronDocumentService(),
    };
  }

  // Web platform
  return {
    notifications: new WebNotificationService(),
    agent: new WebAgentService(),
    user: new WebUserService(),
    documents: new WebDocumentService(),
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

