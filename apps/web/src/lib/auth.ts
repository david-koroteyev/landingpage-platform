import { api, setToken, clearToken } from './api';
import type { User, Session } from '@lp/shared';

export async function login(email: string, password: string): Promise<Session> {
  const session = await api.post<Session>('/auth/login', { email, password });
  setToken(session.token);
  return session;
}

export async function register(
  email: string,
  password: string,
  name: string
): Promise<Session> {
  const session = await api.post<Session>('/auth/register', { email, password, name });
  setToken(session.token);
  return session;
}

export async function getMe(): Promise<User> {
  return api.get<User>('/auth/me');
}

export function logout() {
  clearToken();
  window.location.href = '/login';
}
