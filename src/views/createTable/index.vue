<template>
  <div class="table">
    <table border="1" align="center" class="mainTable">
      <colgroup>
        <col v-for="(width, index) in widths" :key="index" :width="width" />
      </colgroup>
      <thead>
        <tr>
          <th ref="colRefs" v-for="(item, index) in headerData" :key="index">
            {{ item.title }}
          </th>
        </tr>
      </thead>
    </table>
    <table border="1" align="center" class="mainTable">
      <colgroup>
        <col v-for="(width, index) in widths" :key="index" :width="width" />
      </colgroup>
      <tbody align="center">
        <template v-for="(item, index) in bodyData">
          <tr v-for="(item1, index1) in numArr[index]" :key="item.id + item1">
            <td v-for="(item2, index2) in rowData[index][index1]" :rowspan="item2.maxRow" :key="index2">
              {{ item2.content }}
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue';
import data from "./mock1.json";
const headerData = reactive<HeaderData[]>(data.headerData)
const bodyData = reactive(data.bodyData)
const numArr = reactive<number[][]>([])
const rowData = reactive<Array<TreeNode[][]>>([])
const widths = reactive<(string | number)[]>([])
let idSets = new Set()
const colRefs = ref([])
interface HeaderData {
  id: string,
  title: string,
  type: number,
  width?: string | number
}
interface TreeNode {
  id: string,
  content: string,
  contentValue: null,
  maxRow: number,
  children: TreeNode[],
  isTraverse?: boolean
}
const getRowData = (data: TreeNode[]) => {
  //遍历树的所有路径
  const getAllPath = (tree: TreeNode[]):TreeNode[][] => {
    const paths = []; //记录路径的arr
    for (let i = 0; i < tree.length; i++) {
      //遍历同层次所有节点
      if (tree[i].children && tree[i].children.length) {
        //如果有子节点便继续深入，直到到达叶子节点
        const res = getAllPath(tree[i].children); 
        for (let j = 0; j < res.length; j++) {
          if (!tree[i].isTraverse && !idSets.has(tree[i].id)) {
            // 添加过的加标识 子节点返回后将其返回的路径与自身拼接
            idSets.add(tree[i].id)
            paths.push([tree[i], ...res[j]]);
            tree[i].isTraverse = true;
          } else {
            paths.push([...res[j]]);
          }
        }
      } else {
        if (!tree[i].isTraverse) {
          paths.push([tree[i]]); //没有子节点的话，直接将自身拼接到paths中
          tree[i].isTraverse = true;
        }
      }
    }
    return paths;
  };
  // 遍历每个大项下边的所有路径
  for (let item of data) {
    let arr = [item];
    rowData.push(getAllPath(arr));
    console.log(rowData, 'rowData')
  }
}
const createTable = (data:TreeNode[]) => {
  // 得到每条数据行数组- 该数组也可做计算行序号用
  let k = 0;
  while (k < data.length) {
    let arr1 = [];
    let i = 1;
    if (data[k].maxRow) {
      for (let j = 0; j < data[k].maxRow; j++) {
        arr1.push(i);
        i++;
      }
    } else {
      arr1.push(1);
    }
    k++;
    numArr.push(arr1);
  }
  getRowData(data);
}
createTable(bodyData)
onMounted(() => {
    //得到表头每列的宽度-如果没有自定义宽度就取元素宽度
    colRefs.value.forEach((item:HTMLElement, index) => {
      const width = headerData[index].width
      if (width) {
        widths.push(width);
      } else {
        widths.push(item.offsetWidth);
      }
    });
})
</script>
<style lang="scss" scoped>
.table {
  margin: 30px 30px 0 30px;
}
.mainTable {
  width: 100%;
  border-collapse: collapse;
}

table tr {
  line-height: 50px;
}

table th {
  font-size: 16px;
}
</style>
