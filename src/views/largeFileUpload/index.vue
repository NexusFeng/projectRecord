<template>
  <div>
    <input type="file" @change="handleFileChange"/>
    <el-button @click="handleUpload">upload</el-button>
  </div>
  <div>
      <div>
        <div>percentage</div>
        <el-progress :percentage="fakeUploadPercentage"></el-progress>
      </div>
    </div>
    <el-table :data="data">
      <el-table-column
        prop="hash"
        label="chunk hash"
        align="center"
      ></el-table-column>
      <el-table-column label="size(KB)" align="center" width="120">
        <template v-slot="{ row }">
          {{ row.size }}
        </template>
      </el-table-column>
      <el-table-column label="percentage" align="center">
        <template v-slot="{ row }">
          <el-progress
            :percentage="row.percentage"
            color="#909399"
          ></el-progress>
        </template>
      </el-table-column>
    </el-table>
</template>

<script lang="ts" setup>
import { computed } from '@vue/reactivity';
import { reactive, ref, watch } from 'vue';
import { upload, merge } from '../../api/largeFileUpload'

// 10MB
// const SIZE = 10 * 1024 * 1024
const SIZE = 1 * 1024 * 1024
interface ContainerType{
  file: File | null
}
const container = reactive<ContainerType>({
  file:null
})
let data = reactive<{chunk:Blob,hash:string,index:number,percentage:number,size:number}[]>([])
const fakeUploadPercentage = ref(0)

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
    index,
    size: file.size,
    // 文件名 + 数组下标
    hash: container.file?.name + '-' + index,
    percentage:0
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
// 上传进度
const createProcessHandle = (item:{percentage:number}) => {
  return (e:ProgressEvent) => {
    item.percentage = parseInt(String((e.loaded / e.total) * 100))
  }
}
// 总进度条
const uploadPercentage = computed(() => {
  if(!container.file || !data.length) return 0
  const loaded = data.map(item => item.size * item.percentage).reduce((acc,cur) => acc + cur)
  return parseInt((loaded / container.file.size).toFixed(2))
})
watch(uploadPercentage, (val) => {
  if(val > fakeUploadPercentage.value) fakeUploadPercentage.value = val
})
// 上传切片
const uploadChunks = async() => {
  const requestList = data.map(({chunk, hash, index}) => {
    const formData = new FormData()
    formData.append('chunk', chunk)
    formData.append('hash', hash)
    if(container.file) formData.append('filename', container.file.name)
    return {formData, index}
  }).map(({formData, index}) => {
    upload(formData,createProcessHandle(data[index]))
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