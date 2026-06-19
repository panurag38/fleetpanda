import { Suspense, useMemo } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AppHeader } from './containers/common/AppHeader';
import { ErrorBoundary } from './containers/common/ErrorBoundary';
import { ProtectedRoute } from './containers/common/ProtectedRoute';
import { APP_ROUTES, HEADER_LINKS } from './routes';
import LoginPage from './containers/common/LoginPage';
import NotFoundPage from './containers/common/NotFoundPage';
import { CardSkeleton } from './containers/common/ui';

const AppContent = () => {
  const { user, logout } = useAppContext();
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const routeScopeKey = useMemo(() => {
    const [segment] = location.pathname.split('/').filter(Boolean);
    return segment ?? 'home';
  }, [location.pathname]);

  return (
    <div className={`app-shell ${isLoginPage ? 'app-shell--auth' : ''}`}>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <AppHeader
        brand="FleetPanda"
        tagline="Fleet tracking dashboard"
        user={user}
        items={HEADER_LINKS}
        onLogout={logout}
        compact={isLoginPage}
      />

      <main id="main-content" tabIndex={-1}>
        <Suspense fallback={<CardSkeleton />}>
          <div key={routeScopeKey} className="route-fade">
            <Routes location={location}>
            {APP_ROUTES.map(({ path, component: Screen, roles }) => (
              <Route
                key={path}
                path={path}
                element={
                  roles ? (
                    <ProtectedRoute allowedRoles={roles}>
                      <Screen />
                    </ProtectedRoute>
                  ) : (
                    <Screen />
                  )
                }
              />
            ))}
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          </div>
        </Suspense>
      </main>
    </div>
  );
};

const App = () => (
  <ThemeProvider>
    <AppProvider>
      <ToastProvider>
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
      </ToastProvider>
    </AppProvider>
  </ThemeProvider>
);

export default App;
