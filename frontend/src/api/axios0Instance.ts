import axios from 'axios';

let tokenGetter: (() => Promise<string | null>) | null = null;

export function configureAuth(getter: () => Promise<string | null>) {
  tokenGetter = getter;
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080',
});

api.interceptors.request.use((config) => {
  if (tokenGetter) {
    const token = tokenGetter();
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});