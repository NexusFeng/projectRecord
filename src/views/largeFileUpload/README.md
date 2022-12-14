## 启动服务端
`node service/server/largeFileUpload/index.js`

## 核心
`Blob.prototype.slice`方法,文件的`slice`可以返回**源文件的某个切片**

## 思路
先定义好单个切片大小,将文件分为一个个切片,由于http的并发,同时可上传多个切片。从一个大文件分为多个切片上传,减少了上传时间,由于是并发,上传的顺序不能保证,需要给每个切片记录顺序

## 问题
- 流行的组件库不支持大文件上传(element ui)
- 一些库的API较多,学习成本高(simple-uploader/vue-uploader)

## 上传切片
- 对文件进行切片(`Blob.prototype.slice()`)
> Blob 对象表示一个不可变、原始数据的类文件对象。它的数据可以按文本或二进制的格式进行读取，也可以转换成 ReadableStream 来用于数据操作。
> Blob 表示的不一定是 JavaScript 原生格式的数据。File 接口基于 Blob，继承了 blob 的功能并将其扩展以支持用户系统上的文件(File对象是特殊的Blob)
将文件按照定义的切片大小进行切割
- 将切片传输给服务端
> FormData 接口提供了一种表示表单数据的键值对 key/value 的构造方式，并且可以轻松的将数据通过XMLHttpRequest.send() 方法发送出去，本接口和此方法都相当简单直接。如果送出时的编码类型被设为 "multipart/form-data"，它会使用和表单一样的格式
> multipart/form-data ： 需要在表单中进行文件上传时，就需要使用该格式
> application/json： JSON数据格式，将数据进行序列化的一种方式，后端可以直接使用
> spark-md5中要求传入所有切片并计算出hash值,不能直接放入文件计算
由于要做断点续传功能,所以开启worker线程来计算文件hash值,worker线程接受文件切片,利用fileReader读取每个切片的ArrayBuffer并不断传入spark-md5中,全部完成后将hash传给主线程。  
为每个切片创建FormData对象,将切片上传方法添加到数据里,由`Promise.all`进行并发请求
## 合并
当切片全部发送成功后(`Promise.then()`),发起合并请求。
## 上传进度条
文件的上传进度基于切片的上传进度,axios提供了`onUploadProcess`方法来处理上传进度事件,切片上传时为每个切片请求创建`onUploadProcess`方法,可监听到每个切片的上传进度,储存在切片数组里,利用计算属性对每个切片的上传大小进行监听,得到总文件上传进度。
## 文件秒传
秒传: 在服务器已经存在了上传的资源,用户再次上传时会直接提示上传成功  
在上传前,先计算出文件的hash,并把hash发送给服务端进行验证,由于hash的唯一性,所以一旦服务端能找到相同的hash文件则直接返回上传成功
## 断点续传
利用axios的`AbortController`(支持fetch),在上传请求前，创建一个`AbortController`实例,并存放在一个数组中,当上传成功时，从数组中删除对应的`AbortController`实例,当暂停上传时,调用数组中每项的`AbortController`实例的`abort`方法来取消请求。  

当文件上传后,服务端会储存所有上传的切片,所以每次上传文件前可以调用一个接口,服务端将已上传的切片名称返回,前端在上传时,跳过这些已上传的切片,实现续传效果。

## 进度条改进
由于暂停时会取消请求,所以进度条会出现**倒退**现象  
创建一个假的进度条,基于文件的进度条,但只会停止和增加,基于计算属性,当当前进度小于上传进度条时,进度为上传进度条进度。

## 问题点
- 利用web worker开启线程不会阻塞主线程
- 分片过多造成大量http请求,可通过控制并发
维护一个数组,利用`Promise.race()`,每当数组有一个promise完成，就立即添加,使数组保持最大并发数
### 解决并发
```js
function request(menuIds){
  let requests = []
  let max = 3
  let finish = 0
  const concurrent = async() => {
    // 这里得用for循环，会阻止继续往下执行，示例:
    // async function sum() {
    //   for(let i = 0; i < 10; i++) {
    //     console.log(i)
    //     if(i === 6) await Promise.reject('1')
    //   }
    // }
    // sum()
    for(let i = 0; i < menuIds.length; i++) {
      let task = new Promise(resolve => {
        // ...
        resolve()
      }).then(() => {
        let index = requests.findIndex(t => t === task)
        requests.splice(index, 1)
      }).finally(() => {
        finish++
      })
      requests.push(task)
      if(requests.length === max) {
        await Promise.race(requests)
      }
    }
  }
  concurrent()
  return new Promise(resolve => {
    let timer = setInterval(() => {
      if(menuIds.length == finish) {
        clearInterval(timer)
        resolve(routes)
      }
    },500)
  })
  
}
```