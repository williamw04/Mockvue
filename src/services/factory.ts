/**
 * Service Factory
 * Creates the appropriate service implementations based on the platform
 */


import type { IAppServices } from './interfaces';

// Electron services
import {
  ElectronNotificationService,
  ElectronAgentService,
  ElectronVoiceInterviewService,
  ElectronUserService,
  ElectronDocumentService,
} from './electron';

/**
 * Creates and returns the appropriate services for the current platform
 * Note: Returns Electron services.
 */
export function createServices(): IAppServices {
  return {
    notifications: new ElectronNotificationService(),
    agent: new ElectronAgentService(),
    voiceInterview: new ElectronVoiceInterviewService(),
    user: new ElectronUserService(),
    documents: new ElectronDocumentService(),
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
