<template>
  <div ref="base" style="height: 100%; width: 100%;">
    <div id="container"></div>
  </div>
</template>
<script>
import { ref, onMounted } from 'vue'; // 引入 Vue 3 相关的模块
import { register } from '@antv/x6-vue-shape';
import { mockData } from './mock';
import { configSttrData, configData } from './config';
import CreateGraph from './Graph';
import Info from './info';

register({
  shape: 'custom-vue-node',
  component: Info,
});

export default {
  setup() {
    const base = ref(null); 

    onMounted(() => {

      const clientWidth = base.value.clientWidth;
      new CreateGraph({
        elementId: 'container',
        graphData: mockData,
        typeConfigData: configSttrData,
        typeTemplateData: configData,
        clientWidth,
      });
    });

    return { base }
  },
};
</script>

<style lang="scss" scoped>
</style>
