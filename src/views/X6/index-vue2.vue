<template>
  <div ref="base" style="height: 100%;width: 100%;">
    <div id="container"></div>
  </div>
</template>

<script>
import { register } from '@antv/x6-vue-shape'
import { mockData} from './mock'
import { configSttrData, configData } from './config'
import CreateGraph from './Graph'

import Info from './info'
register({
  shape: 'custom-vue-node',
  component: Info,
})

export default {
  data(){
    return {
    }
  },
  mounted(){
    const clientWidth = this.$refs.base.clientWidth
    new CreateGraph({
      elementId: 'container',
      graphData: mockData,
      typeConfigData: configSttrData,
      typeTemplateData: configData,
      clientWidth
    })
  }

}
</script>
<style lang="scss" scoped>

</style>
