<template>
<div class="home">
  <div class="component-items">
    <div v-for="(item,index) in items" :key="index">
      {{item.name}}
    </div>
  </div>
</div>
</template>

<script lang="ts" setup>
import { reactive } from 'vue';
const items = reactive([
  {name: '虚拟列表', router:'virtualList'},
  {name: '大文件上传', router: 'LargeFileUpload'},
  {name: '动态生成table', router: 'createTable'}
])
</script>

<style scoped>
.home{
  background-color: black;
  height: 100vh;
  width: 100vw;
}
h3 {
  margin: 40px 0 0;
}

</style>
