import { reactive } from 'vue';

function readUser() {
  try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
}

// Lee el campo exp (segundos) del payload del JWT para saber si ya expiró.
function expired(token) {
  try {
    const p = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return !p.exp || p.exp * 1000 <= Date.now();
  } catch { return true; }
}

export const auth = reactive({
  token: localStorage.getItem('token') || '',
  user: readUser(),
  get isAuthenticated() { return !!this.token && !expired(this.token); },
  get isAdmin() { return this.isAuthenticated && this.user?.rol === 'admin'; },
  setSession(token, user) {
    this.token = token;
    this.user = user;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },
  logout() {
    this.token = '';
    this.user = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
});
