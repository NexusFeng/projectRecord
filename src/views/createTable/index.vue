<template>
  <div>
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
import { onMounted, reactive, ref, VNodeRef } from 'vue';
import data from "./mock.json";
const headerData = reactive<HeaderData[]>(data.headerData)
const bodyData = reactive(data.bodyData)
const numArr = reactive<number[][]>([])
const rowData = reactive<Array<TreeNode[][]>>([])
const widths = reactive<String[] | Number[]>([])
let sum = ref(0)
const colRefs = ref([])

const itemRefs = []
// const setItemRef = (el) => {
//   if (el) {
//     colRefs.push(el)
//   }
// }
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
          if (!tree[i].isTraverse) {
            // 添加过得加标识 子节点返回后将其返回的路径与自身拼接
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
  for (let item of data) {
    let arr = [item];
    rowData.push(getAllPath(arr));
  }
}
const createTable = (data:TreeNode[]) => {
  //动态计算每大项包含的行总数
  for (let i = 0; i < data.length; i++) {
    sum.value += data[i].maxRow;
  }
  // 得到行数组
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
  console.log(colRefs.value, 'colRefs')
    //得到表头每列的宽度
    colRefs.value.forEach((item:HTMLTableCellElement, index) => {
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
