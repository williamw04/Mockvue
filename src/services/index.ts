/**
 * Services Module Export
 * Central export point for all service-related functionality
 */

// Interfaces
export type {
  IStorageService,
  IFileService,
  INotificationService,
  IAgenticService,
  IAppServices,
} from './interfaces';

// Factory
export { createServices, getServices, resetServices } from './factory';

// Context and hooks
export {
  ServicesProvider,
  useServices,
  useStorage,
  useFiles,
  useNotifications,
  useAgentic,
} from './context';

// Individual service implementations (for advanced usage)
export {
  ElectronStorageService,
  ElectronFileService,
  ElectronNotificationService,
  ElectronAgenticService,
} from './electron';

export {
  WebStorageService,
  WebFileService,
  WebNotificationService,
  WebAgenticService,
} from './web';

