<template>
  <component :is="currentComponent[current]"></component>
</template>

<script lang="ts" setup>
import { defineAsyncComponent, markRaw, reactive, ref } from 'vue';
const current = ref('home')
const currentComponent= reactive({
  home: markRaw(defineAsyncComponent(() => import('./components/Home.vue')))
})
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
