<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { edificiosApi } from '../../services/api.js'
import { auth } from '../../services/auth.js'
import { handleImageError, normalizeImageUrl } from '../../utils/image.js'

const edificios = ref([])
const cargando = ref(true)
const error = ref('')

async function cargar() {
  cargando.value = true
  try {
    edificios.value = await edificiosApi.listar()
  } catch (e) {
    error.value = e.message
  } finally {
    cargando.value = false
  }
}

async function eliminar(id) {
  if (!confirm('¿Eliminar este edificio del catálogo?')) return
  try {
    await edificiosApi.eliminar(id)
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
        <p class="eyebrow">Entidad principal</p>
        <h1>Edificios</h1>
      </div>
      <RouterLink v-if="auth.isAuthenticated" class="btn btn-primary" to="/edificios/nuevo">+ Nuevo edificio</RouterLink>
    </div>

    <div v-if="error" class="error-box">{{ error }}</div>
    <div v-if="cargando" class="loading">Cargando…</div>

    <div v-else-if="!edificios.length" class="empty-state">
      Aún no hay edificios registrados. Crea el primero.
    </div>

    <div v-else class="grid">
      <div v-for="e in edificios" :key="e.id" class="card build-card">
        <img
          v-if="e.imagen_url"
          :src="normalizeImageUrl(e.imagen_url)"
          :alt="e.nombre"
          class="build-img"
          @error="handleImageError"
        />
        <div class="build-body">
          <h3><RouterLink :to="`/edificios/${e.id}`">{{ e.nombre }}</RouterLink></h3>
          <p class="mono build-height">{{ e.altura_metros }} m · {{ e.pisos }} pisos</p>
          <p class="build-meta">
            <span class="tag">{{ e.ciudad_nombre }}</span>
            <span class="tag">{{ e.arquitecto_nombre }}</span>
          </p>
          <div v-if="auth.isAuthenticated" class="btn-row">
            <RouterLink class="btn" :to="`/edificios/${e.id}/editar`">Editar</RouterLink>
            <button v-if="auth.isAdmin" class="btn btn-danger" @click="eliminar(e.id)">Eliminar</button>
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
  margin: 0 0 10px;
}

.build-meta {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin: 0 0 14px;
}
</style>
