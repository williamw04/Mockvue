import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { ServicesProvider, useServices, useNotifications, useDocuments, useUser, useAgent } from './context';
import { createMockServices } from '../test/mock-services';

describe('ServicesProvider & hooks', () => {
  const mockServices = createMockServices();

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ServicesProvider services={mockServices}>{children}</ServicesProvider>
  );

  it('useServices returns the injected services', () => {
    const { result } = renderHook(() => useServices(), { wrapper });
    expect(result.current).toBe(mockServices);
  });

  it('useServices throws when used outside provider', () => {
    expect(() => {
      renderHook(() => useServices());
    }).toThrow('useServices must be used within a ServicesProvider');
  });

  it('useNotifications returns the notification service', () => {
    const { result } = renderHook(() => useNotifications(), { wrapper });
    expect(result.current).toBe(mockServices.notifications);
  });

  it('useDocuments returns the document service', () => {
    const { result } = renderHook(() => useDocuments(), { wrapper });
    expect(result.current).toBe(mockServices.documents);
  });

  it('useUser returns the user service', () => {
    const { result } = renderHook(() => useUser(), { wrapper });
    expect(result.current).toBe(mockServices.user);
  });

  it('useAgent returns the agent service', () => {
    const { result } = renderHook(() => useAgent(), { wrapper });
    expect(result.current).toBe(mockServices.agent);
  });
});
