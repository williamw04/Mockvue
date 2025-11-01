/**
 * Services Module Export
 * Central export point for all service-related functionality
 */

// Interfaces
export type {
  IStorageService,
  IFileService,
  INotificationService,
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
} from './context';

// Individual service implementations (for advanced usage)
export {
  ElectronStorageService,
  ElectronFileService,
  ElectronNotificationService,
} from './electron';

export {
  WebStorageService,
  WebFileService,
  WebNotificationService,
} from './web';

