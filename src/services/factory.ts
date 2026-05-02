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
  ElectronPrepSheetService,
  ElectronCoachingService,
  ElectronPDFService,
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
    prepSheets: new ElectronPrepSheetService(),
    coaching: new ElectronCoachingService(),
    pdf: new ElectronPDFService(),
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
