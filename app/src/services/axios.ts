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



export { api };
