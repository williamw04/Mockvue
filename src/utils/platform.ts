/**
 * Platform detection and feature checking utilities
 */

export type Platform = 'electron' | 'web';

/**
 * Detects the current platform
 * Note: Hardcoded to 'electron' as web support has been removed.
 */
export const getPlatform = (): Platform => {
  return 'electron';
};

/**
 * Checks if the app is running in Electron
 */
export const isElectron = (): boolean => {
  return true;
};

/**
 * Checks if the app is running in a web browser
 */
export const isWeb = (): boolean => {
  return false;
};

/**
 * Feature detection for various capabilities
 */
export const hasFeature = (feature: string): boolean => {
  // All features are now determined by the Electron platform
  const features: Record<string, boolean> = {
    // File system access
    'file-system': true,
    'native-dialogs': true,

    // Storage
    'offline-first': true,
    'indexeddb': false, // We use file system in Electron
    'localstorage': true,

    // System features
    'notifications': true,
    'auto-update': true,
    'system-tray': true,

    // Performance
    'native-performance': true,
  };

  return features[feature] ?? false;
};

/**
 * Gets platform-specific information
 */
export const getPlatformInfo = () => {
  const platform = getPlatform();

  return {
    platform,
    isElectron: platform === 'electron',
    isWeb: platform === 'web',
    os: platform === 'electron' ? window.electronAPI?.platform : navigator.platform,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
  };
};

