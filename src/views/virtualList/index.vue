<template>
  <div class="other">
    <div>
      <h4>完整渲染-所有数据全部渲染</h4>
      <div class="outer">
        <div v-for="(item, index) in 20" :key="index" class="item">
          {{ item }}
        </div>
      </div>
    </div>
    <div>
      <h4>虚拟列表-只渲染视口数据</h4>
      <div class="outer" ref="outer">
        <div class="padding-box" :style="paddingObj">
          <div v-for="(item, index) in visibleList" :key="index" class="item">
            {{ item }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, computed, reactive } from 'vue'
// 1.定义静态数据，数据高、设备高、视口最大显示数据条数
const itemHeight = 100
let outer = ref()
let deviceHeight: number
let maxContainSize = ref(0)
// 2.定义动态数据
// 2.1开始和结束下标
let startIdx = ref(0) // 10个数,从第5个开始找5个,结束下标是9
let endIdx = computed(() => {
  return startIdx.value + maxContainSize.value - 1
})
// 2.2全部数据和可视数据
let lst: object[] = reactive([])
// 当前视口要渲染的数据
let visibleList = computed(() => {
  return lst.slice(startIdx.value, endIdx.value + 1)
})
// 2.3padding边距对象
let paddingObj = computed(() => {
  return {
    paddingTop: startIdx.value * itemHeight + 'px',
    paddingBottom: (lst.length - 1 - endIdx.value) * itemHeight + 'px',
  }
})
// 3.请求出所有数据
function getData(num = 20) {
  fetch('http://localhost:4000/data?num=' + num)
    .then((res) => res.json())
    .then((data) => {
      lst.push(...data.list)
    })
}
getData(20)

// 4.给outer绑定滚动事件，事件中进行下计算
onMounted(() => {
  const ele = outer.value
  deviceHeight = ele.clientHeight
  maxContainSize.value = ~~(deviceHeight / itemHeight) + 2
  ele.addEventListener('scroll', () => {
    //检测当前顶部数据,并更新为startIdx的值
    startIdx.value = ~~(ele.scrollTop / itemHeight)
  })
})
</script>

<style lang="scss" scoped>
.other {
  display: flex;
  flex-direction: row;
  justify-content: center;
}
.outer {
  flex: 1;
  /* height: 100vh; */
  height: 50vh;
  width: 300px;
  margin: 0 100px;
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
