<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { ciudadesApi } from '../../services/api.js'

const props = defineProps({ id: String })
const router = useRouter()
const esEdicion = computed(() => !!props.id)

const cargando = ref(esEdicion.value)
const guardando = ref(false)
const error = ref('')

const form = ref({ nombre: '', pais: '', continente: '', poblacion: '', imagen_url: '' })

onMounted(async () => {
  if (!esEdicion.value) return
  try {
    const c = await ciudadesApi.obtener(props.id)
    form.value = {
      nombre: c.nombre,
      pais: c.pais,
      continente: c.continente,
      poblacion: c.poblacion,
      imagen_url: c.imagen_url || '',
    }
  } catch (e) {
    error.value = e.message
  } finally {
    cargando.value = false
  }
})

async function guardar() {
  guardando.value = true
  error.value = ''
  const payload = { ...form.value, poblacion: Number(form.value.poblacion) }
  try {
    if (esEdicion.value) {
      await ciudadesApi.actualizar(props.id, payload)
      router.push(`/ciudades/${props.id}`)
    } else {
      const nueva = await ciudadesApi.crear(payload)
      router.push(`/ciudades/${nueva.id}`)
    }
  } catch (e) {
    error.value = e.message
  } finally {
    guardando.value = false
  }
}
</script>

<template>
  <div>
    <RouterLink to="/ciudades" class="back-link mono">← Volver a ciudades</RouterLink>

    <p class="eyebrow">{{ esEdicion ? 'Editar' : 'Nueva' }} ciudad</p>
    <h1>{{ esEdicion ? form.nombre : 'Agregar ciudad' }}</h1>

    <div v-if="error" class="error-box">{{ error }}</div>

    <form v-if="!cargando" class="card form-card" @submit.prevent="guardar">
      <div class="field">
        <label for="nombre">Nombre</label>
        <input id="nombre" v-model="form.nombre" required placeholder="Ej. Dubái" />
      </div>

      <div class="field-row">
        <div class="field">
          <label for="pais">País</label>
          <input id="pais" v-model="form.pais" required />
        </div>
        <div class="field">
          <label for="continente">Continente</label>
          <input id="continente" v-model="form.continente" required />
        </div>
        <div class="field">
          <label for="poblacion">Población</label>
          <input id="poblacion" v-model="form.poblacion" type="number" min="0" required />
        </div>
      </div>

      <div class="field">
        <label for="imagen">URL de imagen</label>
        <input id="imagen" v-model="form.imagen_url" placeholder="https://…" />
      </div>

      <div class="btn-row">
        <button class="btn btn-primary" type="submit" :disabled="guardando">
          {{ guardando ? 'Guardando…' : esEdicion ? 'Guardar cambios' : 'Crear ciudad' }}
        </button>
        <RouterLink class="btn" to="/ciudades">Cancelar</RouterLink>
      </div>
    </form>
    <div v-else class="loading">Cargando formulario…</div>
  </div>
</template>

<style scoped>
.back-link {
  display: inline-block;
  margin-bottom: 24px;
  color: var(--text-muted);
  font-size: 0.85rem;
}

.form-card {
  max-width: 640px;
  margin-top: 20px;
}

.field-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 16px;
}
</style>
