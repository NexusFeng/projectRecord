const express = require('express');
const Mock = require('mockjs');

const app = express();

function generatorList(num, page = 1) {
  return Mock.mock({
    [`list|${num}`]: [
      {
        'id|+1': 1,
        title: '@ctitle(15,25)',
        image: '@natural(0,15)',
        reads: '@natural(0,99999)',
        from: '@ctitle(3,7)',
        date: '@date(yyyy-MM-dd)',
      },
    ],
  });
}

app.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.get('/data', function (req, res) {
  const { num } = req.query;
  return res.send(generatorList(num));
});

const val = app.listen(4000, function () {
  console.log(
    '本地mock服务启动，接口地址为：http://localhost:4000/data?num=10'
  );
});
