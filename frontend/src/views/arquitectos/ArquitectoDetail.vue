<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { arquitectosApi } from '../../services/api.js'
import { auth } from '../../services/auth.js'
import { handleImageError, normalizeImageUrl } from '../../utils/image.js'

const props = defineProps({ id: String })
const router = useRouter()

const arquitecto = ref(null)
const cargando = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    arquitecto.value = await arquitectosApi.obtener(props.id)
  } catch (e) {
    error.value = e.message
  } finally {
    cargando.value = false
  }
})

async function eliminar() {
  if (!confirm('¿Eliminar este arquitecto?')) return
  try {
    await arquitectosApi.eliminar(props.id)
    router.push('/arquitectos')
  } catch (e) {
    error.value = e.message
  }
}
</script>

<template>
  <div>
    <RouterLink to="/arquitectos" class="back-link mono">← Volver a arquitectos</RouterLink>

    <div v-if="cargando" class="loading">Cargando…</div>
    <div v-else-if="error" class="error-box">{{ error }}</div>

    <div v-else-if="arquitecto" class="detail-layout">
      <img
        v-if="arquitecto.imagen_url"
        :src="normalizeImageUrl(arquitecto.imagen_url)"
        :alt="arquitecto.nombre"
        class="detail-img"
        @error="handleImageError"
      />
      <div v-else class="detail-img detail-img-placeholder mono">Sin fotografía</div>

      <div>
        <p class="eyebrow">Arquitecto</p>
        <h1>{{ arquitecto.nombre }}</h1>
        <p class="mono" style="color: var(--text-muted)">
          {{ arquitecto.nacionalidad }}<span v-if="arquitecto.anio_nacimiento"> · n. {{ arquitecto.anio_nacimiento }}</span>
        </p>

        <p v-if="arquitecto.biografia" class="detail-desc">{{ arquitecto.biografia }}</p>

        <div v-if="arquitecto.edificios.length" class="related-list">
          <p class="eyebrow">Edificios diseñados</p>
          <RouterLink v-for="e in arquitecto.edificios" :key="e.id" class="related-item" :to="`/edificios/${e.id}`">
            <span>{{ e.nombre }}</span>
            <span class="mono">{{ e.altura_metros }} m</span>
          </RouterLink>
        </div>

        <div v-if="auth.isAuthenticated" class="btn-row" style="margin-top: 28px">
          <RouterLink class="btn" :to="`/arquitectos/${arquitecto.id}/editar`">Editar</RouterLink>
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

.detail-img-placeholder {
  height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  background: var(--panel);
  font-size: 0.8rem;
}

.detail-desc {
  color: var(--text-muted);
  line-height: 1.6;
  max-width: 60ch;
  margin-top: 16px;
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
