/**
 * Services Module Export
 * Central export point for all service-related functionality
 */

// Interfaces
export type {
  INotificationService,
  IAppServices,
  IAgentService,
  IVoiceInterviewService,
  IUserService,
  IDocumentService,
  ICoachingService,
} from './interfaces';

// Factory
export { createServices, getServices, resetServices } from './factory';

// Context and hooks
export {
  ServicesProvider,
  useServices,
  useNotifications,
  useAgent,
  useVoiceInterview,
  useUser,
  useDocuments,
  useCoaching,
} from './context';

// Individual service implementations (for advanced usage)
export {
  ElectronNotificationService,
  ElectronAgentService,
  ElectronVoiceInterviewService,
  ElectronUserService,
  ElectronDocumentService,
  ElectronCoachingService,
} from './electron';


