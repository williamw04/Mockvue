/**
 * Platform detection and feature checking utilities
 */

export type Platform = 'electron' | 'web';

/**
 * Detects the current platform
 */
export const getPlatform = (): Platform => {
  if (typeof window !== 'undefined' && window.electronAPI) {
    return 'electron';
  }
  return 'web';
};

/**
 * Checks if the app is running in Electron
 */
export const isElectron = (): boolean => {
  return getPlatform() === 'electron';
};

/**
 * Checks if the app is running in a web browser
 */
export const isWeb = (): boolean => {
  return getPlatform() === 'web';
};

/**
 * Feature detection for various capabilities
 */
export const hasFeature = (feature: string): boolean => {
  const platform = getPlatform();
  
  const features: Record<string, boolean> = {
    // File system access
    'file-system': platform === 'electron' || 'showOpenFilePicker' in window,
    'native-dialogs': platform === 'electron',
    
    // Storage
    'offline-first': platform === 'electron',
    'indexeddb': 'indexedDB' in window,
    'localstorage': 'localStorage' in window,
    
    // System features
    'notifications': 'Notification' in window || platform === 'electron',
    'auto-update': platform === 'electron',
    'system-tray': platform === 'electron',
    
    // Performance
    'native-performance': platform === 'electron',
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

