<template>
  <div style="height: 20px;"></div>
  <input type="file" @change="handleFileChange" />
  <div style="margin: 20px;">
    <el-button @click="handleUpload" type="primary" :icon="Upload">上传</el-button>
    <el-button @click="resumeUpload" v-if="status === 'pause'" type="warning">恢复上传</el-button>
    <el-button @click="pauseUpload" v-else :disabled="status !=='uploading' || !container.hash" type="warning">暂停上传</el-button>
    <el-button @click="handleDelete" type="danger" :icon="CircleClose">删除文件</el-button>
    <el-button @click="handleDownload" type="primary" :icon="Download" >下载文件</el-button>
    <el-icon color="#E6A23C"><Warning /></el-icon><span style="fontSize:10px;">默认下载初始上传的文件</span>
  </div>
  <div>
    <div>
      <div>文件hash值计算进度</div>
      <el-progress :percentage="hashPercentage" :stroke-width="12"></el-progress>
    </div>
    <div>
      <div>上传总进度</div>
      <el-progress :percentage="fakeUploadPercentage" :stroke-width="12"></el-progress>
    </div>
  </div>
  <el-table :data="data">
    <el-table-column prop="hash" label="切片hash名称" align="center"></el-table-column>
    <el-table-column label="大小(KB)" align="center" width="120">
      <template v-slot="{ row }">
        {{ row.size }}
      </template>
    </el-table-column>
    <el-table-column label="切片上传进度" align="center">
      <template v-slot="{ row }">
        <el-progress :percentage="row.percentage" :status="row.percentage==100?'success':''"></el-progress>
      </template>
    </el-table-column>
  </el-table>
</template>

<script lang="ts" setup>
import { Upload, Download, CircleClose, Warning } from '@element-plus/icons-vue'
import { computed } from '@vue/reactivity';
import { reactive, ref, watch } from 'vue';
import { upload, merge, verify, remove, download, getSizes } from '../../api/largeFileUpload';
import { ElMessage } from 'element-plus'
// 10MB
// const SIZE = 10 * 1024 * 1024
// 默认1MB
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
let status = ref(Status.wait)

// 删除方法
const handleDelete = (flag:boolean = true) => {
  remove().then(() => {
    flag && ElMessage.success('删除成功')
    fakeUploadPercentage.value = 0
    hashPercentage.value = 0
    data.splice(0)
  })
}

// input上传文件
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

// 上传方法
const handleUpload = async () => {
  status.value = Status.uploading;
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
    // 文件hash + 数组下标
    hash: container.hash + '-' + index,
    percentage: uploadedList.includes(index)?100:0
  }))
  data.push(...fileData)
  await uploadChunks(uploadedList)
}
// 取消所有切片请求
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
  uploadChunks(uploadedList)
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
// 总上传进度
const uploadPercentage = computed(() => {
  if (!container.file || !data.length) return 0
  const loaded = data.map(item => item.size * item.percentage).reduce((acc, cur) => acc + cur)
  return parseInt((loaded / container.file.size).toFixed(2))
})
// 总文件上传进度条
watch(uploadPercentage, (val) => {
  if (val > fakeUploadPercentage.value) fakeUploadPercentage.value = val
})
// 上传切片
const uploadChunks = (uploadedList:{}[] = []) => {
  const requestList = data.filter(({hash}) => !uploadedList.includes(hash))
  .map(({ chunk, hash, index }) => {
    const formData = new FormData()
    formData.append('chunk', chunk)
    formData.append('hash', hash)
    if (container.file) formData.append('filename', container.file.name)
    formData.append('fileHash', container.hash)
    return { formData, index }
  }).map(({ formData, index }) => {
    return upload(formData, createProcessHandle(data[index]), requestLists)
  })
  Promise.all(requestList).then(() => {
    mergeRequest()
  })

}
// 合并切片请求
const mergeRequest = () => {
  if (!container.file) return
  const data = {
    size: SIZE,
    fileHash: container.hash,
    filename: container.file.name
  }
  merge(data).then(() => {
    ElMessage.success('文件上传成功')
    status.value = Status.wait
  })
}

// 获取文件大小
const check = () => {
  return new Promise((resolve, reject) => {
    getSizes().then((res)=> {
      if(res.data.code == 404) {
        ElMessage.warning('无上传文件,请上传后下载')
        reject()
      }
      resolve(res.data.size)
    })
  })
}

// 合并切片
const mergeArrayBuffers = (arrays:ArrayBuffer[]) => {
  let totalLen = 0
  for(let arr of arrays) {
    totalLen += arr.byteLength
  }
  let res = new Uint8Array(totalLen)
  let offset = 0
  for(let arr of arrays) {
    let unit8Arr = new Uint8Array(arr)
    res.set(unit8Arr, offset)
    offset += unit8Arr.byteLength
  }
  return res.buffer
}

//并发下载
const concurrencyDownload = async(size: number, slicing: number) => {
  let chunkNum = Math.ceil(size / slicing)

  const downloadTask = []
  for(let i = 1; i <= chunkNum; i++) {
    const rangeStart = slicing * (i - 1)
    const rangeEnd = i == chunkNum?size - 1:slicing * i - 1
    downloadTask.push(download(rangeStart, rangeEnd))
  }
  const arrayBuffers = await Promise.all(downloadTask.map(task => {
    return task.then(res => res.data)
  }))
  return mergeArrayBuffers(arrayBuffers)
}

// 下载
const handleDownload = async () => {
  try {
    let size = await check()
    const res = await concurrencyDownload(size as number,SIZE)
    const blob = new Blob([res]);
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = 'downloaded_file';
    downloadLink.click();
  } catch (error) {
    console.log(error)
  }
  
  
}


</script>

<style lang="scss">
</style>