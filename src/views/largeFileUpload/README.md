## 启动服务端
`node service/server/largeFileUpload/index.js`

## 核心
`Blob.prototype.slice`方法,文件的`slice`可以返回**源文件的某个切片**
## 思路
先定义好单个切片大小,将文件分为一个个切片,由于http的并发,同时可上传多个切片。从一个大文件分为多个切片上传,减少了上传时间,由于是并发,上传的顺序不能保证,需要给每个切片记录顺序
