import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import { AppContext } from '../../../context/AppContext';
import { createMockAppContext } from '../../../test-utils/createMockAppContext';
import LoginPage from '../LoginPage';
import type { AuthUser } from '../../../types';

const loginMock = vi.fn();

describe('LoginPage', () => {
  beforeEach(() => {
    loginMock.mockReset();
  });

  it('renders field validation errors when submitted empty', async () => {
    render(
      <AppContext.Provider value={createMockAppContext({ login: loginMock })}>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </AppContext.Provider>
    );

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/please enter your username/i)).toBeInTheDocument();
      expect(screen.getByText(/please enter your password/i)).toBeInTheDocument();
    });
  });

  it('calls login when form is submitted with values', async () => {
    loginMock.mockResolvedValue({
      id: 'user-driver',
      username: 'driver',
      name: 'Anurag',
      role: 'driver'
    } as AuthUser);

    render(
      <AppContext.Provider value={createMockAppContext({ login: loginMock })}>
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<div>Home</div>} />
            <Route path="/admin" element={<div>Admin</div>} />
          </Routes>
        </MemoryRouter>
      </AppContext.Provider>
    );

    fireEvent.change(screen.getByPlaceholderText(/e.g. admin or driver/i), { target: { value: 'driver' } });
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), { target: { value: 'driver123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => expect(loginMock).toHaveBeenCalledWith('driver', 'driver123'));
  });

  it('redirects authenticated users away from login', () => {
    render(
      <AppContext.Provider
        value={createMockAppContext({
          user: { id: 'user-admin', username: 'admin', name: 'Fleet Admin', role: 'admin' },
          isAuthenticated: true
        })}
      >
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<div>Home</div>} />
          </Routes>
        </MemoryRouter>
      </AppContext.Provider>
    );

    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  it('shows auth errors from context', () => {
    render(
      <AppContext.Provider value={createMockAppContext({ authError: 'Invalid username or password' })}>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </AppContext.Provider>
    );

    expect(screen.getByRole('alert')).toHaveTextContent(/invalid username or password/i);
  });
});
