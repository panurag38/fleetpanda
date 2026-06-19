import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AppContext } from '../../../context/AppContext';
import { createMockAppContext } from '../../../test-utils/createMockAppContext';
import { ProtectedRoute } from '../ProtectedRoute';
import type { AuthUser } from '../../../types';

const renderProtectedRoute = (user: AuthUser | null, initialPath = '/admin') =>
  render(
    <AppContext.Provider value={createMockAppContext({ user, isAuthenticated: Boolean(user) })}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <div>Admin content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login page</div>} />
        </Routes>
      </MemoryRouter>
    </AppContext.Provider>
  );

describe('ProtectedRoute', () => {
  it('redirects unauthenticated users to login', () => {
    renderProtectedRoute(null);
    expect(screen.getByText('Login page')).toBeInTheDocument();
  });

  it('blocks users without the required role', () => {
    renderProtectedRoute({
      id: 'user-driver',
      username: 'driver',
      name: 'Anurag',
      role: 'driver'
    });

    expect(screen.queryByText('Admin content')).not.toBeInTheDocument();
  });

  it('renders protected content for authorized users', () => {
    renderProtectedRoute({
      id: 'user-admin',
      username: 'admin',
      name: 'Fleet Admin',
      role: 'admin'
    });

    expect(screen.getByText('Admin content')).toBeInTheDocument();
  });
});
