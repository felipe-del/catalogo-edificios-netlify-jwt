<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { ciudadesApi } from '../../services/api.js'
import { auth } from '../../services/auth.js'
import { handleImageError, normalizeImageUrl } from '../../utils/image.js'

const props = defineProps({ id: String })
const router = useRouter()

const ciudad = ref(null)
const cargando = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    ciudad.value = await ciudadesApi.obtener(props.id)
  } catch (e) {
    error.value = e.message
  } finally {
    cargando.value = false
  }
})

async function eliminar() {
  if (!confirm('¿Eliminar esta ciudad?')) return
  try {
    await ciudadesApi.eliminar(props.id)
    router.push('/ciudades')
  } catch (e) {
    error.value = e.message
  }
}
</script>

<template>
  <div>
    <RouterLink to="/ciudades" class="back-link mono">← Volver a ciudades</RouterLink>

    <div v-if="cargando" class="loading">Cargando…</div>
    <div v-else-if="error" class="error-box">{{ error }}</div>

    <div v-else-if="ciudad" class="detail-layout">
      <img
        v-if="ciudad.imagen_url"
        :src="normalizeImageUrl(ciudad.imagen_url)"
        :alt="ciudad.nombre"
        class="detail-img"
        @error="handleImageError"
      />

      <div>
        <p class="eyebrow">Ciudad</p>
        <h1>{{ ciudad.nombre }}</h1>
        <p class="mono" style="color: var(--text-muted)">{{ ciudad.pais }} · {{ ciudad.continente }}</p>

        <div class="stat-row mono">
          <div class="stat">
            <span class="stat-value">{{ ciudad.poblacion.toLocaleString('es-CR') }}</span>
            <span class="stat-label">Población</span>
          </div>
          <div class="stat">
            <span class="stat-value">{{ ciudad.edificios.length }}</span>
            <span class="stat-label">Edificios en catálogo</span>
          </div>
        </div>

        <div v-if="ciudad.edificios.length" class="related-list">
          <p class="eyebrow">Edificios en esta ciudad</p>
          <RouterLink v-for="e in ciudad.edificios" :key="e.id" class="related-item" :to="`/edificios/${e.id}`">
            <span>{{ e.nombre }}</span>
            <span class="mono">{{ e.altura_metros }} m</span>
          </RouterLink>
        </div>

        <div v-if="auth.isAuthenticated" class="btn-row" style="margin-top: 28px">
          <RouterLink class="btn" :to="`/ciudades/${ciudad.id}/editar`">Editar</RouterLink>
          <button v-if="auth.isAdmin" class="btn btn-danger" @click="eliminar">Eliminar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.back-link {
  display: inline-block;
  margin-bottom: 24px;
  color: var(--text-muted);
  font-size: 0.85rem;
}

.detail-layout {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 32px;
}

.detail-img {
  width: 100%;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  object-fit: cover;
  max-height: 360px;
}

.stat-row {
  display: flex;
  gap: 28px;
  margin: 20px 0;
}

.stat {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.3rem;
  color: var(--accent);
  font-weight: 700;
}

.stat-label {
  font-size: 0.7rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.related-list {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.related-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 14px;
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text);
  font-size: 0.9rem;
}

.related-item:hover {
  border-color: var(--accent);
  text-decoration: none;
}

@media (max-width: 680px) {
  .detail-layout {
    grid-template-columns: 1fr;
  }
}
</style>
