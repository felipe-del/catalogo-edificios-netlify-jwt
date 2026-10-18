import { createRouter, createWebHistory } from 'vue-router'
import { auth } from '../services/auth.js'

import Home from '../views/Home.vue'

import LoginView from '../views/auth/LoginView.vue'
import RegisterView from '../views/auth/RegisterView.vue'

import EdificiosList from '../views/edificios/EdificiosList.vue'
import EdificioDetail from '../views/edificios/EdificioDetail.vue'
import EdificioForm from '../views/edificios/EdificioForm.vue'

import CiudadesList from '../views/ciudades/CiudadesList.vue'
import CiudadDetail from '../views/ciudades/CiudadDetail.vue'
import CiudadForm from '../views/ciudades/CiudadForm.vue'

import ArquitectosList from '../views/arquitectos/ArquitectosList.vue'
import ArquitectoDetail from '../views/arquitectos/ArquitectoDetail.vue'
import ArquitectoForm from '../views/arquitectos/ArquitectoForm.vue'

const routes = [
  { path: '/', name: 'home', component: Home },

  { path: '/login', name: 'login', component: LoginView },
  { path: '/registro', name: 'registro', component: RegisterView },

  { path: '/edificios', name: 'edificios-list', component: EdificiosList },
  { path: '/edificios/nuevo', name: 'edificios-new', component: EdificioForm, meta: { requiresAuth: true } },
  { path: '/edificios/:id/editar', name: 'edificios-edit', component: EdificioForm, props: true, meta: { requiresAuth: true } },
  { path: '/edificios/:id', name: 'edificios-detail', component: EdificioDetail, props: true },

  { path: '/ciudades', name: 'ciudades-list', component: CiudadesList },
  { path: '/ciudades/nueva', name: 'ciudades-new', component: CiudadForm, meta: { requiresAuth: true } },
  { path: '/ciudades/:id/editar', name: 'ciudades-edit', component: CiudadForm, props: true, meta: { requiresAuth: true } },
  { path: '/ciudades/:id', name: 'ciudades-detail', component: CiudadDetail, props: true },

  { path: '/arquitectos', name: 'arquitectos-list', component: ArquitectosList },
  { path: '/arquitectos/nuevo', name: 'arquitectos-new', component: ArquitectoForm, meta: { requiresAuth: true } },
  { path: '/arquitectos/:id/editar', name: 'arquitectos-edit', component: ArquitectoForm, props: true, meta: { requiresAuth: true } },
  { path: '/arquitectos/:id', name: 'arquitectos-detail', component: ArquitectoDetail, props: true },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

// Las pantallas de crear/editar exigen sesión; si no hay, va al login
router.beforeEach((to) => {
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
})

export default router