import { render, screen } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import type { NavLinkItem } from '../../../routes';
import { ThemeProvider } from '../../../context/ThemeContext';
import { AppHeader } from '../AppHeader';

const items: NavLinkItem[] = [
  { path: '/', label: 'Home' },
  { path: '/admin', label: 'Admin', roles: ['admin'] },
  { path: '/driver', label: 'Driver', roles: ['driver'] }
];

const renderHeader = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('AppHeader', () => {
  it('shows login link when there is no user', () => {
    renderHeader(
      <BrowserRouter>
        <AppHeader brand="FleetPanda" items={items} user={null} onLogout={vi.fn()} />
      </BrowserRouter>
    );

    expect(screen.getByText('FleetPanda')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /logout/i })).not.toBeInTheDocument();
  });

  it('renders logout and user name for authenticated users', () => {
    renderHeader(
      <BrowserRouter>
        <AppHeader
          brand="FleetPanda"
          items={items}
          user={{ id: 'user-admin', username: 'admin', name: 'Fleet Admin', role: 'admin' }}
          onLogout={vi.fn()}
        />
      </BrowserRouter>
    );

    expect(screen.getByText('Hi! Fleet Admin')).toBeInTheDocument();
    expect(screen.queryByText('Hi! Admin')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /login/i })).not.toBeInTheDocument();
  });

  it('keeps home and driver visible as a workspace toggle on driver pages', () => {
    renderHeader(
      <MemoryRouter initialEntries={['/driver/shift']}>
        <AppHeader
          brand="FleetPanda"
          items={items}
          user={{ id: 'user-driver', username: 'driver', name: 'Anurag', role: 'driver' }}
          onLogout={vi.fn()}
        />
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: /^home$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^driver$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^driver$/i })).toHaveAttribute('aria-current', 'page');
  });

  it('marks the active workspace in the header toggle', () => {
    renderHeader(
      <MemoryRouter initialEntries={['/admin']}>
        <AppHeader
          brand="FleetPanda"
          items={items}
          user={{ id: 'user-admin', username: 'admin', name: 'Fleet Admin', role: 'admin' }}
          onLogout={vi.fn()}
        />
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: /^home$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^admin$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^admin$/i })).toHaveAttribute('aria-current', 'page');
  });

  it('shows only role-appropriate navigation links', () => {
    renderHeader(
      <BrowserRouter>
        <AppHeader
          brand="FleetPanda"
          items={items}
          user={{ id: 'user-driver', username: 'driver', name: 'Anurag', role: 'driver' }}
          onLogout={vi.fn()}
        />
      </BrowserRouter>
    );

    expect(screen.getByRole('link', { name: /^home$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^driver$/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /^admin$/i })).not.toBeInTheDocument();
  });

  it('hides auth actions in compact mode for guests', () => {
    renderHeader(
      <BrowserRouter>
        <AppHeader brand="FleetPanda" items={items} user={null} onLogout={vi.fn()} compact />
      </BrowserRouter>
    );

    expect(screen.queryByRole('link', { name: /login/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });
});
