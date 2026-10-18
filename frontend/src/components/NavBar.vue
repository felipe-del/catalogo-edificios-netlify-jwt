<script setup>
import { RouterLink, useRouter } from 'vue-router'
import { auth } from '../services/auth.js'

const router = useRouter()

function salir() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <header class="navbar">
    <div class="container navbar-inner">
      <RouterLink to="/" class="brand">
        <span class="brand-mark">▲</span>
        <span class="brand-text">SKYLINE<span class="mono brand-sub">/catálogo</span></span>
      </RouterLink>
      <nav class="nav-links">
        <RouterLink to="/edificios">Edificios</RouterLink>
        <RouterLink to="/ciudades">Ciudades</RouterLink>
        <RouterLink to="/arquitectos">Arquitectos</RouterLink>
        <template v-if="auth.isAuthenticated">
          <span class="mono nav-user">{{ auth.user?.nombre }} · {{ auth.user?.rol }}</span>
          <a href="#" @click.prevent="salir">Cerrar sesión</a>
        </template>
        <template v-else>
          <RouterLink to="/login">Iniciar sesión</RouterLink>
          <RouterLink to="/registro">Registrarse</RouterLink>
        </template>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.navbar {
  border-bottom: 1px solid var(--border);
  background: rgba(11, 18, 32, 0.85);
  backdrop-filter: blur(6px);
  position: sticky;
  top: 0;
  z-index: 10;
}

.navbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
}

.brand {
  display: flex;
  align-items: baseline;
  gap: 8px;
  color: var(--text);
  text-decoration: none;
  font-family: var(--font-display);
}

.brand:hover {
  text-decoration: none;
}

.brand-mark {
  color: var(--accent);
}

.brand-text {
  font-weight: 700;
  letter-spacing: 0.02em;
  font-size: 1.1rem;
}

.brand-sub {
  color: var(--text-muted);
  font-weight: 400;
  font-size: 0.8rem;
}

.nav-links {
  display: flex;
  gap: 24px;
}

.nav-links a {
  color: var(--text-muted);
  font-weight: 500;
  font-size: 0.92rem;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  color: var(--accent);
  text-decoration: none;
}

.nav-user {
  color: var(--accent);
  font-size: 0.8rem;
  align-self: center;
}

@media (max-width: 560px) {
  .navbar-inner {
    flex-direction: column;
    gap: 12px;
  }
}
</style>
