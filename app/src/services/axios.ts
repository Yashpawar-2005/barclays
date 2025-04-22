// barclays/app/src/services/axios.ts
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:4000/api/v1', // matches your .env PORT=4000
  withCredentials: true,
  timeout:      600_000,
  headers: {
    'Content-Type': 'application/json',
    Accept:         'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers!['Authorization'] = token
    }
    return config
  },
  (error) => Promise.reject(error)
)

export { api }
