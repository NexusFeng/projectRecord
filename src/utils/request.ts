import axios, { AxiosRequestConfig } from 'axios'


// request 不支持泛型
// request.get post put支持响应数据泛型
const request = axios.create({})

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
  // 正常情况

  if(!status || status === 200) {
    return response
  }
  // 错误情况


  // 其他错误情况
    return Promise.reject(response.data)

  // 统一处理接口响应错误,如token过期、服务端异常
  // if(response.data.status && response.data.status !== 200) {
  //   ElMessage.error(response.data.msg || '请求失败')
  //   return Promise.reject(response.data)
  // }
}, function (error) {
  // 对响应错误做点什么
  return Promise.reject(error);
});

// export default <T = any>(config:AxiosRequestConfig) => {
//   return request(config).then(res => {
//     return res.data.data as T
//   })
// }
export default request