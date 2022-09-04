import request from '../../utils/request'

// 上传切片
export const upload = (formData: FormData) => {
  return request({
    url: 'http://localhost: 3000',
    method: 'post',
    data: formData
  }) 
}

// 合并
export const merge = (name:string) => {
  return request({
    url: 'http://localhost: 3000/merge',
    method: 'post',
    headers: {
      'content-type': 'application/json'
    },
    data: name
  }) 
}