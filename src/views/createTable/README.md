## 前置知识
- 利用`colgroup`中`col`的`width`属性,就可以对每列进行宽度控制,该属性虽已废弃,但是在浏览器中还有较好的支持
- `table`的跨行规则,例如,有两行数据,总共五列,第一列跨两行,则第一行的数据为5,第二行的数据为4,因为有一个跨行
## 难点
将后台返回的树形结构处理成适用于`table`跨行规则的数据结构,支持自定义列宽度
## 核心
- 树的全路径遍历算法
- 算出一共有多少行,以便做跨行(循环遍历将children数量相加,此处用maxRow代表该行的最大跨行数量,也就是行数)
## 实现
结构
- 将表格分为表头和表体,用两个`table`渲染,也可用一个表格,两个方便扩展属性,两个`table`的列宽度用`col`的`width`属性控制
- 表体渲染以每条数据为准(为一个循环),每条数据的所有行数为一个循环,每行的列数为一个循环
![table](/src/assets/table.png)
数据
- 计算每条数据(data1、data2)的最大跨行数(每条数据的行总数)
- 利用最大行数,将每条数据的行数用数组表示
- 利用树的全路径遍历将树的所有路径遍历出来,在遍历过程中标记遍历过的数据
![tree](/src/assets/tree.png)
### 树的全路径遍历算法
```js
const getAllPath = (tree) => {
  const paths = []
  for(let i = 0; i < tree.length; i++) {
    if(tree[i].children && tree[i].children.length) {
      const res = getAllPath(tree[i].children)
      for(let j = 0; j < res.length; j++) {
        paths.push([tree[i], ...res])
      }
    } else {
      paths.push([tree[i]])
    }
  }
  return paths
}
```