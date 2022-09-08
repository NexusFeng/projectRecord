import request from '../utils/request'

// 上传切片
export const upload = (formData: FormData, onUploadProgress: (e:ProgressEvent) =>void,requestLists:AbortController[]) => {
  const controller = new AbortController()
  requestLists.push(controller)
  return request({
    url: 'http://localhost:3000',
    method: 'post',
    data: formData,
    onUploadProgress,
    signal: controller.signal
  }).then(() => {
    // 上传成功后,将该请求从列表删除
    const index = requestLists.findIndex(item => item === controller)
    requestLists.splice(index,1)
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
// 验证hash
export const verify = (filename:string, fileHash:string) => {
  return request({
    url: 'http://localhost:3000/verify',
    method: 'post',
    headers: {
      'content-type': 'application/json'
    },
    data: JSON.stringify({filename,fileHash})
  }) 
}

// 删除
export const remove = () => {
  return request({
    url: 'http://localhost:3000/delete',
    method: 'post'
  }) 
}