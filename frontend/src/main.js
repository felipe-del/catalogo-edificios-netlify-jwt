import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'

// Si el servidor responde 401 (token vencido), http.js cierra la sesión y avisa aquí
window.addEventListener('auth:expired', () => {
  router.push({
    path: '/login',
    query: { expired: '1', redirect: router.currentRoute.value.fullPath },
  })
})

createApp(App).use(router).mount('#app')