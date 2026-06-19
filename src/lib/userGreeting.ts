import type { AuthUser } from '../types';

export const formatUserGreeting = (user: AuthUser) => `Hi! ${user.name}`;
