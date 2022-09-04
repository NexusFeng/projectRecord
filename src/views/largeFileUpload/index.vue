<template>
  <div>
    <input type="file" @change="handleFileChange"/>
    <el-button @click="handleUpload">upload</el-button>
  </div>
</template>

<script lang="ts" setup>
import { reactive } from 'vue';
import { upload, merge } from '../../api/largeFileUpload/index'

const SIZE = 10 * 1024 * 1024
interface ContainerType{
  file: File | null
}
const container = reactive<ContainerType>({
  file:null
})
let data = reactive<{chunk:Blob,hash:string}[]>([])

// 上传方法
const handleFileChange = (e:Event) => {
  const target = e.target as HTMLInputElement
  const [file] = (target.files as FileList)
  if(!file) return
  container.file = file
}

// 上传按钮方法
const handleUpload = async() => {
  if(!container.file) return
  const fileChunkList = createFileChunk(container.file)
  data = fileChunkList.map(({file}, index) => ({
    chunk: file,
    // 文件名 + 数组下标
    hash: container.file?.name + '-' + index
  }))
  await uploadChunks()
}

// 生成文件切片
const createFileChunk = (file:File, size = SIZE) => {
  const fileChunkList = []
  let cur = 0
  while(cur < file.size){
    fileChunkList.push({file: file.slice(cur, cur + size)})
    cur += size
  }
  return fileChunkList
}
// 上传切片
const uploadChunks = async() => {
  const requestList = data.map(({chunk, hash}) => {
    const formData = new FormData()
    formData.append('chunk', chunk)
    formData.append('hash', hash)
    if(container.file) formData.append('filename', container.file.name)
    return {formData}
  }).map(({formData}) => {
    upload(formData)
  })
  await Promise.all(requestList)
  // 合并切片
  await mergeRequest()
}
const mergeRequest = async() => {
  if(!container.file) return
  await merge(container.file.name)
}
</script>

<style lang="scss">
</style>