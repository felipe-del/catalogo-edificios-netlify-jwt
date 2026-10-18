import { auth } from './auth.js';

// Con Netlify el frontend y la API comparten dominio: VITE_API_URL queda vacío.
const BASE = import.meta.env.VITE_API_URL || '';

// Wrapper de fetch: adjunta el JWT automáticamente y maneja la expiración (401).
export async function http(path, { method = 'GET', body } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth.token) headers.Authorization = `Bearer ${auth.token}`;

  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // Token vencido/ inválido en una ruta protegida -> cerrar sesión y avisar a main.js
  if (res.status === 401 && auth.token && !path.startsWith('/api/auth/')) {
    auth.logout();
    window.dispatchEvent(new Event('auth:expired'));
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw Object.assign(new Error(data?.error || `Error ${res.status}`), { status: res.status });
  }
  return data;
}
