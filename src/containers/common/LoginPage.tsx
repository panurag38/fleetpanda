import { useActionState, useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { findAllowedPath } from '../../lib/authRedirect';
import type { AuthUser } from '../../types';
import { Button } from './ui/Button';
import { IconInput } from './ui/IconInput';
import { LockIcon, LogInIcon, UserIcon } from './ui/icons';
import './LoginPage.css';

interface FieldErrors {
  username?: string;
  password?: string;
}

interface LoginFormState {
  fieldErrors: FieldErrors;
  formError: string | null;
  user?: AuthUser;
}

const initialLoginState: LoginFormState = {
  fieldErrors: {},
  formError: null
};

const LoginPage = () => {
  const { login, authError, user, isAuthenticated } = useAppContext();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from ?? '/';
  const redirectTo = user?.role ? findAllowedPath(from, user.role) : '/';

  const loginAction = async (_prevState: LoginFormState, formData: FormData): Promise<LoginFormState> => {
    const nextUsername = String(formData.get('username') ?? '').trim();
    const nextPassword = String(formData.get('password') ?? '');
    const nextErrors: FieldErrors = {};

    if (!nextUsername) {
      nextErrors.username = 'Please enter your username.';
    }

    if (!nextPassword) {
      nextErrors.password = 'Please enter your password.';
    }

    if (Object.keys(nextErrors).length > 0) {
      return { fieldErrors: nextErrors, formError: null };
    }

    const result = await login(nextUsername, nextPassword);

    if (result) {
      return { fieldErrors: {}, formError: null, user: result };
    }

    return {
      fieldErrors: {},
      formError: 'Invalid username or password'
    };
  };

  const [state, formAction, isPending] = useActionState(loginAction, initialLoginState);

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(findAllowedPath(from, user.role), { replace: true });
    }
  }, [from, isAuthenticated, navigate, user]);

  useEffect(() => {
    if (state.user) {
      navigate(findAllowedPath(from, state.user.role), { replace: true });
    }
  }, [from, navigate, state.user]);

  if (user && isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  const formError = state.formError ?? authError;

  return (
    <div className="login-page" data-theme="light">
      <div className="login-card">
        <div className="login-card__header">
          <span className="login-card__badge" aria-hidden="true">
            <LogInIcon />
          </span>
          <div>
            <h1>Welcome back</h1>
            <p className="login-note">Sign in to access your FleetPanda workspace.</p>
          </div>
        </div>

        <form action={formAction} className="login-form" noValidate>
          <IconInput
            label="Username"
            name="username"
            icon={<UserIcon />}
            value={username}
            onChange={(event) => {
              setUsername(event.target.value);
              if (state.fieldErrors.username) {
                // field errors clear on next submit via useActionState
              }
            }}
            placeholder="e.g. admin or driver"
            autoComplete="username"
            hint="Demo accounts: admin / admin123 or driver / driver123"
            error={state.fieldErrors.username}
          />
          <IconInput
            label="Password"
            name="password"
            icon={<LockIcon />}
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            autoComplete="current-password"
            error={state.fieldErrors.password}
          />
          <div className="login-actions">
            <Button type="submit" disabled={isPending} className="login-submit">
              {isPending ? (
                'Signing in…'
              ) : (
                <>
                  <LogInIcon className="login-submit__icon" />
                  Sign in
                </>
              )}
            </Button>
          </div>
          {formError ? (
            <div className="login-error" role="alert">
              {formError}
            </div>
          ) : null}
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
