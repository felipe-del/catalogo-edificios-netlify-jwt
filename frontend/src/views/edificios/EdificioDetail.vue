<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { edificiosApi } from '../../services/api.js'
import { auth } from '../../services/auth.js'
import { handleImageError, normalizeImageUrl } from '../../utils/image.js'

const props = defineProps({ id: String })
const router = useRouter()

const edificio = ref(null)
const cargando = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    edificio.value = await edificiosApi.obtener(props.id)
  } catch (e) {
    error.value = e.message
  } finally {
    cargando.value = false
  }
})

async function eliminar() {
  if (!confirm('¿Eliminar este edificio del catálogo?')) return
  try {
    await edificiosApi.eliminar(props.id)
    router.push('/edificios')
  } catch (e) {
    error.value = e.message
  }
}
</script>

<template>
  <div>
    <RouterLink to="/edificios" class="back-link mono">← Volver a edificios</RouterLink>

    <div v-if="cargando" class="loading">Cargando…</div>
    <div v-else-if="error" class="error-box">{{ error }}</div>

    <div v-else-if="edificio" class="detail-layout">
      <img
        v-if="edificio.imagen_url"
        :src="normalizeImageUrl(edificio.imagen_url)"
        :alt="edificio.nombre"
        class="detail-img"
        @error="handleImageError"
      />

      <div>
        <p class="eyebrow">Edificio</p>
        <h1>{{ edificio.nombre }}</h1>

        <div class="stat-row mono">
          <div class="stat"><span class="stat-value">{{ edificio.altura_metros }} m</span><span class="stat-label">Altura</span></div>
          <div class="stat"><span class="stat-value">{{ edificio.pisos }}</span><span class="stat-label">Pisos</span></div>
          <div class="stat"><span class="stat-value">{{ edificio.anio_finalizacion }}</span><span class="stat-label">Finalizado</span></div>
        </div>

        <p v-if="edificio.descripcion" class="detail-desc">{{ edificio.descripcion }}</p>

        <div class="relations">
          <RouterLink class="tag" :to="`/ciudades/${edificio.ciudad_id}`">📍 {{ edificio.ciudad_nombre }}, {{ edificio.ciudad_pais }}</RouterLink>
          <RouterLink class="tag" :to="`/arquitectos/${edificio.arquitecto_id}`">✎ {{ edificio.arquitecto_nombre }}</RouterLink>
        </div>

        <div v-if="auth.isAuthenticated" class="btn-row" style="margin-top: 28px">
          <RouterLink class="btn" :to="`/edificios/${edificio.id}/editar`">Editar</RouterLink>
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

.detail-desc {
  color: var(--text-muted);
  line-height: 1.6;
  max-width: 60ch;
}

.relations {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 16px;
}

@media (max-width: 680px) {
  .detail-layout {
    grid-template-columns: 1fr;
  }
}
</style>
