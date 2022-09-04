const http = require('http')
const path = require('path')
const fse = require('fs-extra')
const multiparty = require('multiparty')

const server = http.createServer()
// 大文件储存目录
const UPLOAD_DIR = path.resolve(__dirname, '..', 'target')

server.on('request', async(req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', '*')
  if(req.method === 'OPTIONS') {
    res.status = 200
    res.end()
    return
  }
})

const multipart = new multiparty.Form()

multipart.parse(req, async (err, fields, files) => {
  if(err) return
  const [chunk] = files.chunk
  const [hash] = fields.hash
  const [filename] = fields.filename
  // 创建临时文件夹用于临时储存chunk
  // 添加chunkDir 前缀与文件名做区分
  const chunkDir = path.resolve(UPLOAD_DIR, 'chunkDir' + filename)

  if(!fse.existsSync(chunkDir)) {
    await fse.mkdirs(chunkDir)
  }
  // fs-extra的rename方法 windows平台会有权限问题
  await fse.move(chunk.path, `${chunkDir}/${hash}`)
  res.end('received file chunk')
})

server.listen(3000, () => console.log('listening port 3000'))