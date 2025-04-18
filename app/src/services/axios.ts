import axios from 'axios';
const api = axios.create({
  baseURL: 'http://localhost:4000/api/v1', 
  withCredentials: true, 
  timeout: 600000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    // console.log(token)
    if (token) {
      config.headers['Authorization'] = `${token}`; 
    }
    return config; 
  },
  (error) => {
    return Promise.reject(error);
  }
);


export { api };
