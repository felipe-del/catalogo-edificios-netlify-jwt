<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { arquitectosApi } from '../../services/api.js'

const props = defineProps({ id: String })
const router = useRouter()
const esEdicion = computed(() => !!props.id)

const cargando = ref(esEdicion.value)
const guardando = ref(false)
const error = ref('')

const form = ref({ nombre: '', nacionalidad: '', anio_nacimiento: '', biografia: '', imagen_url: '' })

onMounted(async () => {
  if (!esEdicion.value) return
  try {
    const a = await arquitectosApi.obtener(props.id)
    form.value = {
      nombre: a.nombre,
      nacionalidad: a.nacionalidad,
      anio_nacimiento: a.anio_nacimiento || '',
      biografia: a.biografia || '',
      imagen_url: a.imagen_url || '',
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
  const payload = {
    ...form.value,
    anio_nacimiento: form.value.anio_nacimiento ? Number(form.value.anio_nacimiento) : null,
  }
  try {
    if (esEdicion.value) {
      await arquitectosApi.actualizar(props.id, payload)
      router.push(`/arquitectos/${props.id}`)
    } else {
      const nuevo = await arquitectosApi.crear(payload)
      router.push(`/arquitectos/${nuevo.id}`)
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
    <RouterLink to="/arquitectos" class="back-link mono">← Volver a arquitectos</RouterLink>

    <p class="eyebrow">{{ esEdicion ? 'Editar' : 'Nuevo' }} arquitecto</p>
    <h1>{{ esEdicion ? form.nombre : 'Agregar arquitecto' }}</h1>

    <div v-if="error" class="error-box">{{ error }}</div>

    <form v-if="!cargando" class="card form-card" @submit.prevent="guardar">
      <div class="field">
        <label for="nombre">Nombre</label>
        <input id="nombre" v-model="form.nombre" required placeholder="Ej. Adrian Smith" />
      </div>

      <div class="field-row">
        <div class="field">
          <label for="nacionalidad">Nacionalidad</label>
          <input id="nacionalidad" v-model="form.nacionalidad" required />
        </div>
        <div class="field">
          <label for="anio">Año de nacimiento</label>
          <input id="anio" v-model="form.anio_nacimiento" type="number" min="1800" />
        </div>
      </div>

      <div class="field">
        <label for="imagen">URL de imagen</label>
        <input id="imagen" v-model="form.imagen_url" placeholder="https://…" />
      </div>

      <div class="field">
        <label for="bio">Biografía</label>
        <textarea id="bio" v-model="form.biografia" rows="4"></textarea>
      </div>

      <div class="btn-row">
        <button class="btn btn-primary" type="submit" :disabled="guardando">
          {{ guardando ? 'Guardando…' : esEdicion ? 'Guardar cambios' : 'Crear arquitecto' }}
        </button>
        <RouterLink class="btn" to="/arquitectos">Cancelar</RouterLink>
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
