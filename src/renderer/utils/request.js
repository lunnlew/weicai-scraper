import axios from 'axios'

const service = axios.create({
  baseURL: 'http://localhost:6877',
  timeout: 1000 * 60 * 5,
  withCredentials: true
})
service.interceptors.request.use(config => {
  return config
}, error => {
  Promise.reject(error)
})

service.interceptors.response.use(
  response => {
    return Promise.resolve(response.data)
  },
  error => {
    return Promise.reject(error)
  })

export default service
