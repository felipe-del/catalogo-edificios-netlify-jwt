<script setup>
import { ref, onMounted, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { edificiosApi } from '../services/api.js'

const edificios = ref([])
const cargando = ref(true)
const error = ref('')

const maxAltura = computed(() => {
  if (!edificios.value.length) return 1
  return Math.max(...edificios.value.map((e) => e.altura_metros))
})

// Marcas de la regla cada 100m hasta el máximo redondeado hacia arriba
const marcas = computed(() => {
  const tope = Math.ceil(maxAltura.value / 100) * 100
  const resultado = []
  for (let m = 0; m <= tope; m += 100) resultado.push(m)
  return resultado
})

onMounted(async () => {
  try {
    edificios.value = await edificiosApi.listar()
  } catch (e) {
    error.value = e.message
  } finally {
    cargando.value = false
  }
})
</script>

<template>
  <section class="hero">
    <p class="eyebrow">Proyecto 2 · Sistemas Distribuidos · UNA</p>
    <h1 class="hero-title">Catálogo de los edificios<br />más altos del mundo</h1>
    <p class="hero-sub">
      Servicio REST desplegado como función (FaaS) en Cloudflare Workers, con base de datos D1,
      que documenta rascacielos, las ciudades que los alojan y los arquitectos que los diseñaron.
    </p>
    <div class="btn-row">
      <RouterLink class="btn btn-primary" to="/edificios">Ver edificios</RouterLink>
      <RouterLink class="btn" to="/ciudades">Ver ciudades</RouterLink>
      <RouterLink class="btn" to="/arquitectos">Ver arquitectos</RouterLink>
    </div>
  </section>

  <section class="skyline-section">
    <h2>Comparativa de altura</h2>
    <p class="section-sub mono">Regla de referencia en metros · orden descendente por altura</p>

    <div v-if="cargando" class="loading">Cargando datos desde la API…</div>
    <div v-else-if="error" class="error-box">{{ error }}</div>
    <div v-else class="ruler-wrap">
      <div class="ruler-ticks mono">
        <span v-for="m in marcas" :key="m" class="tick" :style="{ left: (m / maxAltura) * 100 + '%' }">
          {{ m }}
        </span>
      </div>
      <ol class="ruler-list">
        <li v-for="(e, i) in edificios" :key="e.id" class="ruler-row">
          <span class="rank mono">{{ String(i + 1).padStart(2, '0') }}</span>
          <RouterLink :to="`/edificios/${e.id}`" class="ruler-name">{{ e.nombre }}</RouterLink>
          <div class="bar-track">
            <div class="bar-fill" :style="{ width: (e.altura_metros / maxAltura) * 100 + '%' }"></div>
          </div>
          <span class="ruler-value mono">{{ e.altura_metros }} m</span>
        </li>
      </ol>
    </div>
  </section>
</template>

<style scoped>
.hero {
  padding: 40px 0 56px;
  border-bottom: 1px solid var(--grid-line);
  margin-bottom: 48px;
}

.hero-title {
  font-size: clamp(2rem, 5vw, 3.2rem);
  line-height: 1.05;
  margin: 12px 0 16px;
}

.hero-sub {
  max-width: 620px;
  color: var(--text-muted);
  font-size: 1.02rem;
  line-height: 1.6;
  margin-bottom: 28px;
}

.skyline-section h2 {
  margin-bottom: 4px;
}

.section-sub {
  color: var(--text-muted);
  font-size: 0.8rem;
  margin-bottom: 28px;
}

.ruler-wrap {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 32px 24px 20px;
  overflow-x: auto;
}

.ruler-ticks {
  position: relative;
  height: 20px;
  margin-left: 200px;
  margin-bottom: 8px;
  min-width: 320px;
}

.tick {
  position: absolute;
  transform: translateX(-50%);
  font-size: 0.68rem;
  color: var(--text-muted);
}

.ruler-list {
  list-style: none;
  margin: 0;
  padding: 0;
  border-top: 1px dashed var(--grid-line);
}

.ruler-row {
  display: grid;
  grid-template-columns: 32px 168px 1fr 72px;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px dashed var(--grid-line);
  min-width: 500px;
}

.rank {
  color: var(--accent);
  font-size: 0.78rem;
}

.ruler-name {
  color: var(--text);
  font-size: 0.9rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bar-track {
  position: relative;
  height: 10px;
  background: var(--bg);
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, var(--accent), var(--cyan));
  border-radius: 4px;
}

.ruler-value {
  text-align: right;
  font-size: 0.82rem;
  color: var(--text-muted);
}
</style>
