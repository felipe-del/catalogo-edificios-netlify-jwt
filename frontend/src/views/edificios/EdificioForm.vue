<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { edificiosApi, ciudadesApi, arquitectosApi } from '../../services/api.js'

const props = defineProps({ id: String })
const router = useRouter()
const esEdicion = computed(() => !!props.id)

const ciudades = ref([])
const arquitectos = ref([])
const cargandoRelaciones = ref(true)
const guardando = ref(false)
const error = ref('')

const form = ref({
  nombre: '',
  altura_metros: '',
  pisos: '',
  anio_finalizacion: '',
  descripcion: '',
  imagen_url: '',
  ciudad_id: '',
  arquitecto_id: '',
})

onMounted(async () => {
  try {
    const [listaCiudades, listaArquitectos] = await Promise.all([
      ciudadesApi.listar(),
      arquitectosApi.listar(),
    ])
    ciudades.value = listaCiudades
    arquitectos.value = listaArquitectos

    if (esEdicion.value) {
      const e = await edificiosApi.obtener(props.id)
      form.value = {
        nombre: e.nombre,
        altura_metros: e.altura_metros,
        pisos: e.pisos,
        anio_finalizacion: e.anio_finalizacion,
        descripcion: e.descripcion || '',
        imagen_url: e.imagen_url || '',
        ciudad_id: e.ciudad_id,
        arquitecto_id: e.arquitecto_id,
      }
    }
  } catch (e) {
    error.value = e.message
  } finally {
    cargandoRelaciones.value = false
  }
})

async function guardar() {
  guardando.value = true
  error.value = ''
  const payload = {
    ...form.value,
    altura_metros: Number(form.value.altura_metros),
    pisos: Number(form.value.pisos),
    anio_finalizacion: Number(form.value.anio_finalizacion),
  }
  try {
    if (esEdicion.value) {
      await edificiosApi.actualizar(props.id, payload)
      router.push(`/edificios/${props.id}`)
    } else {
      const nuevo = await edificiosApi.crear(payload)
      router.push(`/edificios/${nuevo.id}`)
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
    <RouterLink to="/edificios" class="back-link mono">← Volver a edificios</RouterLink>

    <p class="eyebrow">{{ esEdicion ? 'Editar' : 'Nuevo' }} edificio</p>
    <h1>{{ esEdicion ? form.nombre : 'Agregar edificio' }}</h1>

    <div v-if="error" class="error-box">{{ error }}</div>

    <form v-if="!cargandoRelaciones" class="card form-card" @submit.prevent="guardar">
      <div class="field">
        <label for="nombre">Nombre</label>
        <input id="nombre" v-model="form.nombre" required placeholder="Ej. Burj Khalifa" />
      </div>

      <div class="field-row">
        <div class="field">
          <label for="altura">Altura (metros)</label>
          <input id="altura" v-model="form.altura_metros" type="number" step="0.1" min="0" required />
        </div>
        <div class="field">
          <label for="pisos">Pisos</label>
          <input id="pisos" v-model="form.pisos" type="number" min="1" required />
        </div>
        <div class="field">
          <label for="anio">Año de finalización</label>
          <input id="anio" v-model="form.anio_finalizacion" type="number" min="1800" required />
        </div>
      </div>

      <div class="field-row">
        <div class="field">
          <label for="ciudad">Ciudad</label>
          <select id="ciudad" v-model="form.ciudad_id" required>
            <option disabled value="">Selecciona una ciudad</option>
            <option v-for="c in ciudades" :key="c.id" :value="c.id">{{ c.nombre }}, {{ c.pais }}</option>
          </select>
        </div>
        <div class="field">
          <label for="arquitecto">Arquitecto</label>
          <select id="arquitecto" v-model="form.arquitecto_id" required>
            <option disabled value="">Selecciona un arquitecto</option>
            <option v-for="a in arquitectos" :key="a.id" :value="a.id">{{ a.nombre }}</option>
          </select>
        </div>
      </div>

      <div class="field">
        <label for="imagen">URL de imagen</label>
        <input id="imagen" v-model="form.imagen_url" placeholder="https://…" />
      </div>

      <div class="field">
        <label for="descripcion">Descripción</label>
        <textarea id="descripcion" v-model="form.descripcion" rows="4"></textarea>
      </div>

      <div class="btn-row">
        <button class="btn btn-primary" type="submit" :disabled="guardando">
          {{ guardando ? 'Guardando…' : esEdicion ? 'Guardar cambios' : 'Crear edificio' }}
        </button>
        <RouterLink class="btn" to="/edificios">Cancelar</RouterLink>
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
