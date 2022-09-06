import request from '../utils/request'

// 上传切片
export const upload = (formData: FormData, onUploadProgress: (e:ProgressEvent) =>void) => {
  return request({
    url: 'http://localhost:3000',
    method: 'post',
    data: formData,
    onUploadProgress
  }) 
}

interface FileData{
  size: number,
  fileHash: string,
  filename: string
}
// 合并
export const merge = (data:FileData) => {
  return request({
    url: 'http://localhost:3000/merge',
    method: 'post',
    headers: {
      'content-type': 'application/json'
    },
    data: JSON.stringify(data)
  }) 
}