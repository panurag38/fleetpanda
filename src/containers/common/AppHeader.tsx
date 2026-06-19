import { NavLink, useLocation } from 'react-router-dom';
import type { AuthUser } from '../../types';
import type { NavLinkItem } from '../../routes';
import { useTheme } from '../../context/ThemeContext';
import { formatUserGreeting } from '../../lib/userGreeting';
import { LogInIcon, LogOutIcon } from './ui/icons';
import './AppHeader.css';

interface AppHeaderProps {
  brand: string;
  tagline?: string;
  user: AuthUser | null;
  items: NavLinkItem[];
  onLogout: () => void;
  compact?: boolean;
}

const isNavItemActive = (pathname: string, path: string) => {
  if (path === '/') {
    return pathname === '/';
  }

  return pathname === path || pathname.startsWith(`${path}/`);
};

export const AppHeader = ({ brand, tagline, user, items, onLogout, compact = false }: AppHeaderProps) => {
  const location = useLocation();
  const { resolvedTheme, toggleTheme } = useTheme();
  const role = user?.role ?? 'guest';

  const workspaceItems = compact
    ? []
    : items.filter((item) => !item.roles || item.roles.includes(role));

  return (
    <header className={`app-header ${compact ? 'app-header--compact' : ''}`}>
      <div className="app-header__brand">
        <p className="app-header__title">{brand}</p>
        {tagline && !compact ? <p className="app-tagline">{tagline}</p> : null}
      </div>

      <div className="header-controls">
        {!compact && workspaceItems.length > 0 ? (
          <nav className="workspace-toggle" aria-label="Workspace navigation">
            {workspaceItems.map((item) => {
              const isActive = isNavItemActive(location.pathname, item.path);

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={`workspace-toggle__option${isActive ? ' workspace-toggle__option--active' : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        ) : null}

        {!compact || user ? (
          <div className="auth-actions">
            <button
              type="button"
              className="auth-button auth-button--theme"
              onClick={toggleTheme}
              aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
              title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {resolvedTheme === 'dark' ? '☀️' : '🌙'}
            </button>
            {user ? (
              <>
                <span className="user-greeting">{formatUserGreeting(user)}</span>
                <button type="button" onClick={onLogout} className="auth-button auth-button--logout">
                  <LogOutIcon className="auth-button__icon" />
                  Logout
                </button>
              </>
            ) : (
              <NavLink to="/login" className="auth-button auth-button--login">
                <LogInIcon className="auth-button__icon" />
                Login
              </NavLink>
            )}
          </div>
        ) : null}
      </div>
    </header>
  );
};
