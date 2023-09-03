<template>
  <div class="container" >
    <div v-if="data.infoType == 1" class="info">
      <div >
          父节点Node
      </div>
    </div>
    <div v-else-if="data.infoType == 2">
      <div class="courseType">
        {{ data.id }}
      </div>
    </div>
    <div v-else-if="data.infoType == 3">
      <div class="course">
        {{ data.id }}
      </div>
    </div>
    <div v-else>
      <div class="course">
        {{ data.id }}
      </div>
    </div>
  </div>
  
</template>

<script >

export default {
  name: 'Info',
  inject: ['getNode'],
  data() {
    return {
      data: {
        'infoType': 1
      }
    }
  },
  mounted(){
    const node = this.getNode()
    this.data = node.data
  }
}
</script>s
<style lang="scss" scoped>
.info{
  background: #fff;
  width: 200px;
  height: 130px;
  line-height: 130px;
  text-align: center;
}
.courseType{
  text-align: center;
  line-height: 30px;
  width: 200px;
  height: 30px;
  background-color: #fff;
}
.course{
  text-align: center;
  line-height: 50px;
  width: 200px;
  height: 50px;
  background-color: #fff;
}
</style>
