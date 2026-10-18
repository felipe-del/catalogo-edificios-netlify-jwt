import { http } from './http.js'

function crudFor(resource) {
  return {
    listar: () => http(`/api/${resource}`),
    obtener: (id) => http(`/api/${resource}/${id}`),
    crear: (payload) =>
      http(`/api/${resource}`, { method: 'POST', body: payload }),
    actualizar: (id, payload) =>
      http(`/api/${resource}/${id}`, { method: 'PUT', body: payload }),
    eliminar: (id) => http(`/api/${resource}/${id}`, { method: 'DELETE' }),
  }
}

export const ciudadesApi = crudFor('ciudades')
export const arquitectosApi = crudFor('arquitectos')
export const edificiosApi = crudFor('edificios')
