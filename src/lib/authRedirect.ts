import { APP_ROUTES } from '../routes';
import type { UserRole } from '../types';

const matchesRoute = (targetPath: string, navPath: string, routePath: string) => {
  if (navPath === '/') {
    return targetPath === '/';
  }

  return targetPath === navPath || targetPath.startsWith(`${navPath}/`) || targetPath === routePath;
};

export const findAllowedPath = (targetPath: string, role: UserRole) => {
  if (!targetPath || targetPath === '/login') {
    return '/';
  }

  const route = APP_ROUTES.find((routeConfig) =>
    matchesRoute(targetPath, routeConfig.navPath, routeConfig.path.replace('/*', ''))
  );

  if (!route) {
    return '/';
  }

  if (!route.roles || route.roles.includes(role)) {
    return targetPath;
  }

  return '/';
};
