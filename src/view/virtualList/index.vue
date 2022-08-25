<template>
  <div class="outer"></div>
</template>

<script setup>
// 1.定义静态数据，数据高、设备高、视口最大显示数据条数

// 2.定义动态数据
// 2.1开始和结束下标

// 2.2全部数据和可视数据

// 2.3padding边距对象

// 3.请求出所有数据
/* function getData(num = 20) {
  fetch('http://localhost:4000/data?num=' + num)
    .then(res => res.json())
    .then(data => {
      console.log(data);
      lst.push(...data.list);
    });
}
getData(20); */

// 4.给outer绑定滚动事件，事件中进行下计算
</script>

<style lang="less" scoped>
.outer {
  /* height: 100vh; */
  height: 50vh;
  width: 300px;
  border: 1px solid #00aacc;
  overflow: scroll;
}
.item {
  height: 100px;
  border-bottom: 1px solid black;
  padding: 0 10px;
}
.item:fisrt {
}
</style>
