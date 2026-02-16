import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { ServicesProvider } from '../services/context';
import { IAppServices } from '../services/interfaces';
import { createMockServices } from './mock-services';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  services?: IAppServices;
  initialRoute?: string;
}

export function renderWithProviders(
  ui: ReactElement,
  options: CustomRenderOptions = {},
) {
  const {
    services = createMockServices(),
    initialRoute = '/',
    ...renderOptions
  } = options;

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <MemoryRouter initialEntries={[initialRoute]}>
        <ServicesProvider services={services}>{children}</ServicesProvider>
      </MemoryRouter>
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    services,
  };
}

export { createMockServices } from './mock-services';
export { default as userEvent } from '@testing-library/user-event';
