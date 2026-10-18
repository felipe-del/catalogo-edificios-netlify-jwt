<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { arquitectosApi } from '../../services/api.js'
import { auth } from '../../services/auth.js'
import { handleImageError, normalizeImageUrl } from '../../utils/image.js'

const arquitectos = ref([])
const cargando = ref(true)
const error = ref('')

async function cargar() {
  cargando.value = true
  try {
    arquitectos.value = await arquitectosApi.listar()
  } catch (e) {
    error.value = e.message
  } finally {
    cargando.value = false
  }
}

async function eliminar(id) {
  if (!confirm('¿Eliminar este arquitecto?')) return
  try {
    await arquitectosApi.eliminar(id)
    await cargar()
  } catch (e) {
    error.value = e.message
  }
}

onMounted(cargar)
</script>

<template>
  <div>
    <div class="page-head">
      <div>
        <p class="eyebrow">Entidad secundaria</p>
        <h1>Arquitectos</h1>
      </div>
      <RouterLink v-if="auth.isAuthenticated" class="btn btn-primary" to="/arquitectos/nuevo">+ Nuevo arquitecto</RouterLink>
    </div>

    <div v-if="error" class="error-box">{{ error }}</div>
    <div v-if="cargando" class="loading">Cargando…</div>
    <div v-else-if="!arquitectos.length" class="empty-state">Aún no hay arquitectos registrados.</div>

    <div v-else class="grid">
      <div v-for="a in arquitectos" :key="a.id" class="card build-card">
        <img
          v-if="a.imagen_url"
          :src="normalizeImageUrl(a.imagen_url)"
          :alt="a.nombre"
          class="build-img"
          @error="handleImageError"
        />
        <div class="build-body">
          <h3><RouterLink :to="`/arquitectos/${a.id}`">{{ a.nombre }}</RouterLink></h3>
          <p class="mono build-height">{{ a.nacionalidad }}<span v-if="a.anio_nacimiento"> · n. {{ a.anio_nacimiento }}</span></p>
          <div v-if="auth.isAuthenticated" class="btn-row">
            <RouterLink class="btn" :to="`/arquitectos/${a.id}/editar`">Editar</RouterLink>
            <button v-if="auth.isAdmin" class="btn btn-danger" @click="eliminar(a.id)">Eliminar</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  margin-bottom: 28px;
  flex-wrap: wrap;
}

.build-card {
  padding: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.build-img {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-bottom: 1px solid var(--border);
  background: var(--panel-alt);
}

.build-body {
  padding: 16px;
}

.build-body h3 {
  margin-bottom: 4px;
  font-size: 1.05rem;
}

.build-height {
  color: var(--accent);
  font-size: 0.85rem;
  margin: 0 0 14px;
}
</style>
