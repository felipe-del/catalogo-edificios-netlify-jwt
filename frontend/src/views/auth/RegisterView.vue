<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { auth } from '../../services/auth.js';
import { http } from '../../services/http.js';

const router = useRouter();
const nombre = ref('');
const correo = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

async function submit() {
  error.value = '';
  loading.value = true;
  try {
    const r = await http('/api/auth/register', {
      method: 'POST',
      body: { nombre: nombre.value, correo: correo.value, password: password.value },
    });
    auth.setSession(r.token, r.user);
    router.push('/');
  } catch (e) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <section class="auth-box">
    <h1>Crear cuenta</h1>
    <form @submit.prevent="submit">
      <label>Nombre <input v-model="nombre" required /></label>
      <label>Correo <input v-model="correo" type="email" required autocomplete="email" /></label>
      <label>Contraseña (mín. 8 caracteres)
        <input v-model="password" type="password" minlength="8" required autocomplete="new-password" />
      </label>
      <p v-if="error" class="auth-error">{{ error }}</p>
      <button type="submit" :disabled="loading">{{ loading ? 'Creando…' : 'Registrarme' }}</button>
    </form>
    <p>¿Ya tienes cuenta? <router-link to="/login">Inicia sesión</router-link></p>
  </section>
</template>

<style scoped>
.auth-box { max-width: 420px; margin: 3rem auto; padding: 0 1rem; }
form { display: grid; gap: 1rem; }
label { display: grid; gap: .35rem; }
input { padding: .6rem; font: inherit; }
button { padding: .7rem; font: inherit; cursor: pointer; }
.auth-error { color: #ff6b6b; }
</style>
