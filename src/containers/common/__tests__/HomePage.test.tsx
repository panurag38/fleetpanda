import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppContext } from '../../../context/AppContext';
import { createMockAppContext } from '../../../test-utils/createMockAppContext';
import HomePage from '../HomePage';

const renderHomePage = (user: ReturnType<typeof createMockAppContext>['user']) =>
  render(
    <AppContext.Provider value={createMockAppContext({ user, isAuthenticated: Boolean(user) })}>
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    </AppContext.Provider>
  );

describe('HomePage', () => {
  it('redirects guests away from the homepage', () => {
    renderHomePage(null);
    expect(screen.queryByText(/fleet operations at a glance/i)).not.toBeInTheDocument();
  });

  it('shows admin workspace for admin users', () => {
    renderHomePage({
      id: 'user-admin',
      username: 'admin',
      name: 'Fleet Admin',
      role: 'admin'
    });

    expect(screen.getByText(/hi! fleet admin/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /admin dashboard/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /driver console/i })).not.toBeInTheDocument();
  });

  it('shows driver workspace for driver users', () => {
    renderHomePage({
      id: 'user-driver',
      username: 'driver',
      name: 'Anurag',
      role: 'driver'
    });

    expect(screen.getByRole('link', { name: /driver console/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /admin dashboard/i })).not.toBeInTheDocument();
  });
});
