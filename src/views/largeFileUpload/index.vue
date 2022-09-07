<template>
  <div>
    <input type="file" @change="handleFileChange" />
    <el-button @click="handleUpload">上传</el-button>
    <el-button @click="resumeUpload" v-if="status === Status.pause">恢复上传</el-button>
    <el-button @click="pauseUpload" v-else :disabled="status !== Status.uploading || !container.hash">暂停上传</el-button>
  </div>
  <div>
    <div>
      <div>calculate chunk hash</div>
      <el-progress :percentage="hashPercentage"></el-progress>
    </div>
    <div>
      <div>percentage</div>
      <el-progress :percentage="fakeUploadPercentage"></el-progress>
    </div>
  </div>
  <el-table :data="data">
    <el-table-column prop="hash" label="chunk hash" align="center"></el-table-column>
    <el-table-column label="size(KB)" align="center" width="120">
      <template v-slot="{ row }">
        {{ row.size }}
      </template>
    </el-table-column>
    <el-table-column label="percentage" align="center">
      <template v-slot="{ row }">
        <el-progress :percentage="row.percentage" status="success"></el-progress>
      </template>
    </el-table-column>
  </el-table>
</template>

<script lang="ts" setup>
import { computed } from '@vue/reactivity';
import { reactive, ref, watch } from 'vue';
import { upload, merge, verify } from '../../api/largeFileUpload'
import { ElMessage } from 'element-plus'
import { resolve } from 'path';
// 10MB
// const SIZE = 10 * 1024 * 1024
const SIZE = 1 * 1024 * 1024
const Status = {
  wait: 'wait',
  pause: 'pause',
  uploading: 'uploading'
}

interface ContainerType {
  file: File | null,
  hash: string,
  worker?: Worker
}
const container = reactive<ContainerType>({
  file: null,
  hash: ''
})
let data = reactive<{ chunk: Blob, hash: string, index: number, percentage: number, size: number }[]>([])
const fakeUploadPercentage = ref(0)
const hashPercentage = ref(0)
let requestLists: AbortController[] = []
const status = ref(Status.wait)

// 上传方法
const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const [file] = (target.files as FileList)
  if (!file) return
  container.file = file
}
// 生成文件 hash(web-worker)
const calculateHash = (fileChunkList: { file: Blob; }[]): Promise<string> => {
  return new Promise(resolve => {
    // 添加 worker属性
    container.worker = new Worker('/hash.js')
    container.worker.postMessage({ fileChunkList })
    container.worker.onmessage = e => {
      const { percentage, hash } = e.data
      hashPercentage.value = percentage
      if (hash) resolve(hash)
    }
  })
}


// 验证hash
const verifyUpload = async(filename: string, fileHash: string) => {
  const {data} = await verify(filename, fileHash)
  return data
}

// 上传按钮方法
const handleUpload = async () => {
  if (!container.file) return
  const fileChunkList = createFileChunk(container.file)
  container.hash = await calculateHash(fileChunkList)
  const { shouldUpload, uploadedList } = await verifyUpload(container.file.name, container.hash)
  if (!shouldUpload) {
    ElMessage.success('文件上传成功')
  }
  let fileData = fileChunkList.map(({ file }, index) => ({
    chunk: file,
    index,
    fileHash: container.hash,
    size: file.size,
    // 文件名 + 数组下标
    hash: container.hash + '-' + index,
    percentage: uploadedList.includes(index)?100:0
  }))
  data.push(...fileData)
  await uploadChunks(uploadedList)
}
const resetData = () => {
  requestLists.forEach(request => {
    request.abort()
  })
  requestLists.splice(0)
  if (container.worker) container.worker.onmessage = null
}
// 暂停上传
const pauseUpload = () => {
  status.value = Status.pause
  resetData()
}
// 恢复上传
const resumeUpload = async() => {
  if(!container.file) return
  const { uploadedList } = await verifyUpload(container.file.name, container.hash)
  await uploadChunks(uploadedList)
}

// 生成文件切片
const createFileChunk = (file: File, size = SIZE) => {
  const fileChunkList = []
  let cur = 0
  while (cur < file.size) {
    fileChunkList.push({ file: file.slice(cur, cur + size) })
    cur += size
  }
  return fileChunkList
}
// 上传进度
const createProcessHandle = (item: { percentage: number }) => {
  return (e: ProgressEvent) => {
    item.percentage = parseInt(String((e.loaded / e.total) * 100))
  }
}
// 总进度条
const uploadPercentage = computed(() => {
  if (!container.file || !data.length) return 0
  const loaded = data.map(item => item.size * item.percentage).reduce((acc, cur) => acc + cur)
  return parseInt((loaded / container.file.size).toFixed(2))
})
watch(uploadPercentage, (val) => {
  if (val > fakeUploadPercentage.value) fakeUploadPercentage.value = val
})
// 上传切片
const uploadChunks = async(uploadedList:{}[] = []) => {
  const requestList = data.filter(({hash}) => !uploadedList.includes(hash))
  .map(({ chunk, hash, index }) => {
    const formData = new FormData()
    formData.append('chunk', chunk)
    formData.append('hash', hash)
    if (container.file) formData.append('filename', container.file.name)
    formData.append('fileHash', container.hash)
    return { formData, index }
  }).map(({ formData, index }) => {
    upload(formData, createProcessHandle(data[index]), requestLists)
  })
  await Promise.all(requestList)
  // 合并切片 之前上传的切片数量 + 本次上传的切片数量 === 所有切片数量时合并
  if(uploadedList.length + requestLists.length === data.length) {
    await mergeRequest()
  }
}
const mergeRequest = async () => {
  if (!container.file) return
  const data = {
    size: SIZE,
    fileHash: container.hash,
    filename: container.file.name
  }
  await merge(data)
}
</script>

<style lang="scss">
</style>