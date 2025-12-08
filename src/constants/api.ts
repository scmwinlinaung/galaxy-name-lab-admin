export const API_HOST = 'http://18.139.99.95/name-lab/api'

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_HOST}/auth/login`,
    // Add other auth endpoints here as needed
  },
  PACKAGES: {
    GET_ALL: `${API_HOST}/packages`,
    CREATE: `${API_HOST}/packages`,
    GET_BY_ID: (id: string) => `${API_HOST}/packages/${id}`,
    UPDATE: (id: string) => `${API_HOST}/packages/${id}`,
    DELETE: (id: string) => `${API_HOST}/packages/${id}`,
  },
  // Add other API endpoints here as needed
}