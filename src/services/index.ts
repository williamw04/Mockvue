/**
 * Services Module Export
 * Central export point for all service-related functionality
 */

// Interfaces
export type {
  INotificationService,
  IAppServices,
  IAgentService,
  IUserService,
} from './interfaces';

// Factory
export { createServices, getServices, resetServices } from './factory';

// Context and hooks
export {
  ServicesProvider,
  useServices,
  useNotifications,
  useAgent,
  useUser,
} from './context';

// Individual service implementations (for advanced usage)
export {
  ElectronNotificationService,
  ElectronAgentService,
  ElectronUserService,
} from './electron';

export {
  WebNotificationService,
  WebAgentService,
  WebUserService,
} from './web';

