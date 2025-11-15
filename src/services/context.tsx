/**
 * Services Context
 * Provides services to React components via Context API
 */

import { createContext, useContext, ReactNode, useMemo } from 'react';
import type { IAppServices } from './interfaces';
import { createServices } from './factory';

/**
 * Services context
 */
const ServicesContext = createContext<IAppServices | null>(null);

/**
 * Services provider props
 */
interface ServicesProviderProps {
  children: ReactNode;
  services?: IAppServices; // Optional for testing
}

/**
 * Services provider component
 * Wraps the app and provides services to all child components
 */
export function ServicesProvider({ children, services }: ServicesProviderProps) {
  const servicesInstance = useMemo(() => {
    return services || createServices();
  }, [services]);

  return (
    <ServicesContext.Provider value={servicesInstance}>
      {children}
    </ServicesContext.Provider>
  );
}

/**
 * Hook to access services in components
 * @throws Error if used outside of ServicesProvider
 */
export function useServices(): IAppServices {
  const context = useContext(ServicesContext);
  
  if (!context) {
    throw new Error('useServices must be used within a ServicesProvider');
  }
  
  return context;
}

/**
 * Hook to access storage service
 */
export function useStorage() {
  const { storage } = useServices();
  return storage;
}

/**
 * Hook to access file service
 */
export function useFiles() {
  const { files } = useServices();
  return files;
}

/**
 * Hook to access notification service
 */
export function useNotifications() {
  const { notifications } = useServices();
  return notifications;
}

/**
 * Hook to access agentic service
 */
export function useAgentic() {
  const { agentic } = useServices();
  return agentic;
}

