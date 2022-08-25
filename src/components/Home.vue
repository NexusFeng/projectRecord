<template>
  <div class="hello">
    <img alt="Vue logo" src="../assets/logo.png">
    <h1>Welcome to Your Vue.js + TypeScript Project</h1>
  </div>
  <div class="component-items">
    <div v-for="(item,index) in items" :key="index"></div>
  </div>
</template>

<script lang="ts">
import { reactive } from 'vue';
const items = reactive(['home'])
</script>

<style scoped>
h3 {
  margin: 40px 0 0;
}

</style>
