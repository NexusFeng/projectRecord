import axios, { AxiosRequestConfig } from 'axios'

// request 不支持泛型
// request.get post put支持响应数据泛型
const request = axios.create({})
request.defaults.baseURL = 'http://localhost:3000';

// 添加请求拦截器
request.interceptors.request.use(function (config) {
  // 在发送请求之前做些什么
  return config;
}, function (error) {
  // 对请求错误做些什么
  return Promise.reject(error);
});

// 添加响应拦截器
request.interceptors.response.use(function (response) {
  const status = response.data.status

  if(!status || status === 200) {
    return response
  }
  return Promise.reject(response.data)

}, function (error) {
  return Promise.reject(error);
});

export default request