<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { auth } from '../../services/auth.js';
import { http } from '../../services/http.js';

const route = useRoute();
const router = useRouter();
const correo = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);
const expired = route.query.expired === '1';

async function submit() {
  error.value = '';
  loading.value = true;
  try {
    const r = await http('/api/auth/login', { method: 'POST', body: { correo: correo.value, password: password.value } });
    auth.setSession(r.token, r.user);
    router.push(route.query.redirect || '/');
  } catch (e) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <section class="auth-box">
    <h1>Iniciar sesión</h1>
    <p v-if="expired" class="auth-msg">Tu sesión expiró. Inicia sesión de nuevo.</p>
    <form @submit.prevent="submit">
      <label>Correo <input v-model="correo" type="email" required autocomplete="email" /></label>
      <label>Contraseña <input v-model="password" type="password" required autocomplete="current-password" /></label>
      <p v-if="error" class="auth-error">{{ error }}</p>
      <button type="submit" :disabled="loading">{{ loading ? 'Entrando…' : 'Entrar' }}</button>
    </form>
    <p>¿No tienes cuenta? <router-link to="/registro">Regístrate</router-link></p>
  </section>
</template>

<style scoped>
.auth-box { max-width: 420px; margin: 3rem auto; padding: 0 1rem; }
form { display: grid; gap: 1rem; }
label { display: grid; gap: .35rem; }
input { padding: .6rem; font: inherit; }
button { padding: .7rem; font: inherit; cursor: pointer; }
.auth-error { color: #ff6b6b; }
.auth-msg { color: #f5b942; }
</style>
