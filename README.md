# Proyecto 2 — Catálogo de edificios más altos (Netlify + MongoDB + JWT)

**Estudiante:** Isaac Brenes
**Cédula:** 119040860
**Tema asignado:** 6. Catálogo de edificios más altos
**Curso:** Sistemas Distribuidos — Universidad Nacional de Costa Rica (UNA)

**Sistema publicado en Netlify:** `https://catalogo-edificios.netlify.app/`
**API:** `https://catalogo-edificios.netlify.app/`

---

## 1. Qué cambió respecto al Proyecto 1

| Tema | Proyecto 1 | Proyecto 2 |
|---|---|---|
| FaaS | Cloudflare Workers + Hono | **Netlify Functions** (`netlify/functions/api.mjs`) |
| Base de datos | Cloudflare D1 (SQLite) | **MongoDB Atlas** (colecciones `ciudades`, `arquitectos`, `edificios`, `usuarios`) |
| Relaciones | `INTEGER` + FOREIGN KEY | **ObjectId** (`ciudad_id`, `arquitecto_id`) |
| Seguridad | Ninguna | **JWT** (registro, login, rutas protegidas, roles) |
| Frontend | Vue 3 | Vue 3 + pantallas de login/registro, token, logout, manejo de 401 |

Las rutas REST son las mismas: `/api/ciudades`, `/api/arquitectos`, `/api/edificios` (+ `/:id`).

### Diseño de seguridad

| Operación | Acceso |
|---|---|
| `GET` listar / detalle | Público |
| `POST`, `PUT` | Usuario autenticado (cualquier rol) |
| `DELETE` | Solo rol `admin` (si no → **403**) |
| Sin token / token inválido o vencido | **401** |

Los usuarios se registran con rol `user`. El administrador se crea con el script de semilla.

---

## 2. Estructura del proyecto

```
proyecto2-edificios/
├── README.md
├── netlify.toml                 # build, carpeta de funciones, redirect SPA, netlify dev
├── package.json                 # dependencias de las funciones (mongodb, bcryptjs, jsonwebtoken)
├── .env.example                 # plantilla de variables (el .env real NO se entrega)
├── .gitignore
├── seed.sql                     # datos del Proyecto 1 (fuente de la migración)
├── scripts/seed.mjs             # migra seed.sql -> MongoDB + crea admin
├── netlify/functions/
│   ├── api.mjs                  # router REST + auth (/api/*)
│   └── lib/ db.mjs · auth.mjs · http.mjs
└── frontend/                    # el frontend del Proyecto 1 + cambios de la sección 5
    └── src/
        ├── services/ auth.js · http.js          (NUEVOS)
        └── views/auth/ LoginView.vue · RegisterView.vue   (NUEVOS)
```

---

## 3. Variables de entorno

| Variable | Descripción |
|---|---|
| `MONGODB_URI` | Cadena de conexión de MongoDB Atlas |
| `MONGODB_DB` | Nombre de la base (por defecto `edificios`) |
| `JWT_SECRET` | Clave de firma del JWT (cadena larga y aleatoria) |
| `JWT_EXPIRES_IN` | Opcional. Vigencia del token (por defecto `2h`) |

Generar una clave JWT segura:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Solo para el script de semilla (local, no van a Netlify): `ADMIN_CORREO`, `ADMIN_PASSWORD`.

**Nunca** subas `.env` a git ni lo incluyas en el zip. En Netlify se configuran en
*Site configuration → Environment variables* (o con `netlify env:set`).

---

## 4. PASO A PASO

### Paso 1 — Preparar la carpeta

1. Crea una carpeta nueva `proyecto2-edificios` (o copia esta).
2. Copia tu carpeta `frontend/` del Proyecto 1 dentro de ella **sin** `node_modules`, `dist`, `.env` ni `.wrangler`.
   Los archivos nuevos de `frontend/src/` de este paquete se mezclan con los tuyos.
3. **No copies** `backend/` (Cloudflare Worker): ya no se usa. Puedes conservarlo en otra carpeta como respaldo.
4. En `frontend/package.json` borra la dependencia `wrangler` y el script `deploy` (Netlify construye el sitio).

### Paso 2 — MongoDB Atlas

1. Crea cuenta en <https://www.mongodb.com/atlas> y un clúster gratuito **M0**.
2. **Database Access → Add New Database User**: usuario y contraseña (guárdalos; si la contraseña tiene caracteres especiales, codifícala para la URL).
3. **Network Access → Add IP Address → `0.0.0.0/0` (Allow access from anywhere)**.
   Es obligatorio: Netlify usa IPs dinámicas y el enunciado exige que el clúster permita el acceso desde Netlify.
4. **Connect → Drivers** y copia la cadena `mongodb+srv://...`, reemplazando usuario y contraseña.

### Paso 3 — Variables locales y semilla

```bash
cd proyecto2-edificios
npm install
cp .env.example .env          # en Windows: copy .env.example .env
# edita .env con tu MONGODB_URI, JWT_SECRET, ADMIN_CORREO y ADMIN_PASSWORD
npm run seed                  # requiere Node 20.6+
```

Debe imprimir `Insertados: 8 ciudades, 6 arquitectos, 12 edificios` y `Admin listo: ...`.
Verifícalo en Atlas → Browse Collections.

### Paso 4 — Probar el backend en local

```bash
npm install -g netlify-cli
netlify login
netlify dev                   # http://localhost:8888
```

En otra terminal:
```bash
# 1. Público
curl http://localhost:8888/api/edificios

# 2. Sin token -> 401
curl -i -X POST http://localhost:8888/api/ciudades -H "Content-Type: application/json" -d "{}"

# 3. Registro y login
curl -X POST http://localhost:8888/api/auth/register -H "Content-Type: application/json" \
  -d '{"nombre":"Prueba","correo":"prueba@test.com","password":"12345678"}'
curl -X POST http://localhost:8888/api/auth/login -H "Content-Type: application/json" \
  -d '{"correo":"prueba@test.com","password":"12345678"}'

# 4. Crear con token (usa el token devuelto)
curl -X POST http://localhost:8888/api/ciudades -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"nombre":"Prueba","pais":"CR","continente":"América Central","poblacion":1000}'

# 5. Borrar con usuario normal -> 403 ; con el token del admin -> 200
curl -i -X DELETE http://localhost:8888/api/ciudades/ID -H "Authorization: Bearer TOKEN"
```

### Paso 5 — Adaptar el frontend

> Sin acceso al código de tus vistas, aquí van los cambios exactos a aplicar.

**5.1 `frontend/.env`**: `VITE_API_URL=` (vacío) cuando uses `netlify dev`: el frontend y la API comparten origen (`http://localhost:8888`). Si ejecutas Vite por separado (`npm --prefix frontend run dev`), configura `VITE_API_URL=http://localhost:8888` para que las llamadas lleguen a Netlify.

**5.2 `frontend/src/services/api.js`**: las llamadas CRUD deben usar el wrapper `http` de `services/http.js`, que añade el token de autenticación y centraliza el manejo de errores. No fijes la API a `127.0.0.1:8787`; ese puerto no es el servidor de este proyecto.

```js
import { http } from './http.js';

// ejemplo; conserva los nombres de tus funciones actuales
export const edificios = {
  list:   ()         => http('/api/edificios'),
  get:    (id)       => http(`/api/edificios/${id}`),
  create: (data)     => http('/api/edificios', { method: 'POST', body: data }),
  update: (id, data) => http(`/api/edificios/${id}`, { method: 'PUT', body: data }),
  remove: (id)       => http(`/api/edificios/${id}`, { method: 'DELETE' }),
};
// idem para ciudades y arquitectos
```
`http` adjunta `Authorization: Bearer <token>` automáticamente.

**5.3 `frontend/src/main.js`**: redirigir al login cuando el token expire (401):

```js
import router from './router';
// ... después de crear la app:
window.addEventListener('auth:expired', () => {
  router.push({ path: '/login', query: { expired: '1', redirect: router.currentRoute.value.fullPath } });
});
```

**5.4 `frontend/src/router/index.js`**: agrega rutas y guard:

```js
import { auth } from '../services/auth.js';
import LoginView from '../views/auth/LoginView.vue';
import RegisterView from '../views/auth/RegisterView.vue';

// dentro del arreglo routes:
{ path: '/login', name: 'login', component: LoginView },
{ path: '/registro', name: 'registro', component: RegisterView },
// marca las rutas de formulario (crear/editar) con meta:
// { path: '/edificios/nuevo', component: EdificioForm, meta: { requiresAuth: true } }, etc.

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { path: '/login', query: { redirect: to.fullPath } };
  }
});
```

**5.5 `NavBar.vue`**: botones según sesión.

```vue
<script setup>
import { auth } from '../services/auth.js';
import { useRouter } from 'vue-router';
const router = useRouter();
function salir() { auth.logout(); router.push('/login'); }
</script>

<!-- en el template -->
<template v-if="auth.isAuthenticated">
  <span>{{ auth.user?.nombre }} ({{ auth.user?.rol }})</span>
  <button @click="salir">Cerrar sesión</button>
</template>
<template v-else>
  <router-link to="/login">Iniciar sesión</router-link>
  <router-link to="/registro">Registrarse</router-link>
</template>
```

**5.6 Listas y detalles (9 vistas)**: oculta acciones según sesión/rol.

```vue
<router-link v-if="auth.isAuthenticated" to="/edificios/nuevo">Nuevo</router-link>
<router-link v-if="auth.isAuthenticated" :to="`/edificios/${e.id}/editar`">Editar</router-link>
<button v-if="auth.isAdmin" @click="eliminar(e.id)">Eliminar</button>
```
(importa `auth` en cada `<script setup>`).

**5.7 IDs ahora son texto** (ObjectId de 24 caracteres): busca y elimina `Number(...)`, `parseInt(...)` o `+id` aplicados a ids (`route.params.id`, `ciudad_id`, `arquitecto_id`).
En los formularios, los `<select>` de ciudad/arquitecto deben guardar el `id` tal cual.
En los formularios y al eliminar, muestra el mensaje de error del servidor (`e.message`) para que se vea el 403/409.

### Paso 6 — Probar el frontend en local

`netlify dev` y abre `http://localhost:8888`. Prueba: registro → login → crear → editar → (usuario normal no ve "Eliminar") → login admin → eliminar → logout → esperar/forzar token vencido → redirige a login.

### Paso 7 — Subir a GitHub

```bash
git init            # si partes de carpeta nueva
git add .
git status          # CONFIRMA que NO aparecen .env ni node_modules
git commit -m "Proyecto 2: Netlify + MongoDB + JWT"
git remote add origin <tu-repo>
git push -u origin main
```
Si en el Proyecto 1 ya subiste `frontend/.env` al repositorio, quítalo: `git rm --cached frontend/.env`.

### Paso 8 — Desplegar en Netlify

**Opción A (repositorio):** Netlify → *Add new site → Import from Git*. Netlify lee `netlify.toml` (build, publish y functions ya están configurados).
**Opción B (CLI):**
```bash
netlify init                  # o: netlify link
netlify env:set MONGODB_URI "mongodb+srv://..."
netlify env:set MONGODB_DB edificios
netlify env:set JWT_SECRET "tu-clave-larga"
netlify deploy --prod --build
```
En la opción A, crea las 3 variables en *Site configuration → Environment variables* y haz *Trigger deploy*.

### Paso 9 — Verificar en producción

```bash
curl https://TU-SITIO.netlify.app/api/edificios
```
Repite las pruebas del Paso 4 con la URL real (401, 403, CRUD, login). Luego pon la URL real en este README (parte superior).

### Paso 10 — Armar el zip de entrega

Incluir: `README.md`, `netlify.toml`, `package.json`, `.env.example`, `.gitignore`, `seed.sql`, `scripts/`, `netlify/`, `frontend/` (código).
**Excluir:** `node_modules/`, `dist/`, `.env`, `.git/`, `.wrangler/`, `.netlify/` y cualquier archivo con cadenas de conexión o claves.

PowerShell:
```powershell
Compress-Archive -Path README.md,netlify.toml,package.json,.env.example,.gitignore,seed.sql,scripts,netlify,frontend -DestinationPath proyecto2-isaac-brenes.zip
```
(antes de comprimir, borra `frontend/node_modules`, `frontend/dist` y `frontend/.env`).

---

## 5. Checklist para el 100

**Servicio REST / Netlify**
- [ ] Funciones en Netlify con las mismas rutas del Proyecto 1 (`/api/*`)
- [ ] CRUD completo de las 3 entidades (listar, detalle, crear, editar, borrar)
- [ ] Frontend + funciones publicados juntos en Netlify
- [ ] Variables sensibles solo en variables de entorno de Netlify

**MongoDB**
- [ ] 3 colecciones + `usuarios`; ≥ 12 edificios y ≥ 6 ciudades/arquitectos con imágenes (`npm run seed`)
- [ ] Relaciones por ObjectId y navegación entre entidades funcionando
- [ ] Conexión reutilizada (`lib/db.mjs`) y acceso de red abierto en Atlas

**JWT**
- [ ] Contraseñas con hash (bcrypt), nunca en texto plano
- [ ] Registro y login; token con identidad (`sub`) y `exp`, firmado con `JWT_SECRET`
- [ ] Crear/editar/borrar exigen `Authorization: Bearer`; **401** sin token/inválido/vencido; **403** sin permiso (borrar = admin)

**Frontend**
- [ ] Pantallas de registro y login
- [ ] Token guardado y adjuntado automáticamente (`http.js`)
- [ ] Botones crear/editar/borrar ocultos si no hay sesión
- [ ] Logout elimina el token
- [ ] 401 → redirección a login

**Entrega**
- [ ] Zip sin `node_modules` ni secretos
- [ ] README con nombre, enlace publicado y variables de entorno
- [ ] URL de Netlify funcionando el día de la revisión

---

## 6. Problemas frecuentes

| Síntoma | Causa / solución |
|---|---|
| `/api/...` devuelve HTML en vez de JSON | La función no se desplegó: verifica `functions = "netlify/functions"` en `netlify.toml` y que `package.json` esté en la raíz |
| 500 "Error interno" al consultar `/api/...` | La función no puede conectarse a MongoDB. En local, reemplaza en `.env` el host de ejemplo `CLUSTER.mongodb.net` por la URI real de Atlas y reinicia `netlify dev`. En producción, configura `MONGODB_URI` en Netlify y vuelve a desplegar. Revisa *Netlify → Logs → Functions* para el error detallado. |
| `ECONNREFUSED querySrv` o `MongoServerSelectionError` | Verifica que `MONGODB_URI` tenga el hostname real del clúster Atlas y que Network Access permita la IP de origen. |
| `Authentication failed` | Usuario/contraseña de Atlas incorrectos o sin codificar caracteres especiales |
| Editar/ver detalle falla con "ID inválido" | El frontend aún convierte ids con `Number()`/`parseInt()` (Paso 5.7) |
| Después de cambiar variables en Netlify nada cambia | Hay que volver a desplegar |
