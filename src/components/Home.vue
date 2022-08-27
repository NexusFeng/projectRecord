<template>
<div class="home">
  <ul class="menu-hover-fill flex flex-col items-start leading-none text-2xl uppercase space-y-4">
    <li v-for="(item,index) in items" :key="index">
      <a href="#"  @click.prevent="goToItem(item.path)">{{item.name}}</a>
    </li>
  </ul>
</div>
</template>

<script lang="ts" setup>
import { reactive } from 'vue';
import {useRouter} from 'vue-router';
interface itemType {
  name: string,
  path: string
}
const router = useRouter()
const items = reactive<itemType[]>([
  {name: '虚拟列表', path:'/virtualList'},
  {name: '大文件上传', path: '/LargeFileUpload'},
  {name: '动态生成table', path: '/createTable'}
])
const goToItem = (path:string) => {
  router.push(path)
}
</script>

<style scoped lang="scss">
@import url(../style/home.scss);
.home{
  height: 100vh;
  width: 100vw;
  background-image: linear-gradient(rgba(16, 16, 16, 0.8), rgba(16, 16, 16, 0.8)), url(../assets/new11.jpg);
  background-size: cover;
}
h3 {
  margin: 40px 0 0;
}

</style>
