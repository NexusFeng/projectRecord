import { Graph } from '@antv/x6'
import { cloneDeep } from 'lodash'


class CreateGraph {
  constructor(options) {
    this.graph = new Graph({
      container: document.getElementById(options.elementId),
      background: {
        color: '#fffbe6', 
      },
      anchor: 'center',
      connectionPoint: 'anchor',
      panning: true,
      mousewheel: {
        enabled: true,
        maxScale: 4,
        minScale: 0.2
      },
      interacting: { nodeMovable: false},
      autoResize: true,
      grid: {
        size: 10,      
        visible: true, 
      }
    })
    Object.keys(options).forEach(item => {
      this[item] = options[item]
    })
    this.init()
  }

  init() {
    // 储存所有列
    this.allCols = []
    // 中线
    this.midWidth = Math.floor(this.clientWidth / 2)
    this.graphData[0].children.forEach(item => {
      this.allCols.push(this.getCols(item))
    })
    console.log(this.allCols, 'allCols')
    // 视图的列最大块数
    const maxPieceNum = this.allCols.flat(1).length
    let viewMaxWidth = (maxPieceNum - 2) * this.typeConfigData.type4.width + 2 * this.typeConfigData.type2.width + maxPieceNum * this.typeConfigData.LRSpan
    while(viewMaxWidth >= this.clientWidth){
     this.clientWidth += 100
    }
    // 整个屏幕平分后每块区域大小
    this.pieceSize = Math.floor( this.clientWidth / maxPieceNum)
    // 坐标系查重枚举
    this.posSet = new Set()
    // 用于存储最原始节点的坐标
    this.OriginPosition = {}
    this.graphData.forEach(node => this.dealLevelOneData(node,null))
    setTimeout(() => {
      this.graph.zoomToFit({padding:{left:30,right:30,bottom:30}})
    }, 200)
  }

  getCols(nodes){
    const stack = [[nodes, 0]];
    const colNum = [];
    while (stack.length) {
      const [node, col] = stack.pop()
      if(colNum[col] && node.infoType !== 3) {
        colNum[col]++
      } else if(node.infoType !== 3) {
        colNum[col] = 1
      }
      node.children.forEach(item => stack.push([item, col + 1]));
    }
    return colNum.filter(item => item)
  }

  getMaxRow(node){
    if(!node.children.length) return 1
    let maxRow = 0
    node.children.forEach(item => {
      maxRow += this.getMaxRow(item)
    })
    return maxRow
  }

  getAllAhildLevel(item) {
    console.log(item, 'item')
  }

  // 处理1类型
  dealLevelOneData(node) {
    let nodeObj = cloneDeep(node)
    delete nodeObj.children
    nodeObj = {...this.typeTemplateData[`type${node.infoType}`],id: nodeObj.id, data: nodeObj,size: { height: this.typeConfigData.type1.height,width: this.typeConfigData.type1.width}}
    nodeObj.position.x = this.midWidth - this.typeConfigData.type1.width / 2
    let newNode = this.graph.addNode(nodeObj)
    const data = newNode.getData()
    newNode.setData(data)
    node.children.forEach((item,index) => this.dealLevelTwoData(item, nodeObj, index))
  }

  
  // 处理2类型
  dealLevelTwoData(node, parentNode, index){
    let nodeObj = cloneDeep(node)
    delete nodeObj.children
    nodeObj = {...this.typeTemplateData[`type${node.infoType}`],id: nodeObj.id, data: nodeObj,size: { height: this.typeConfigData.type2.height,width: this.typeConfigData.type2.width}}
    let posX = this.pieceSize  / 2 - this.typeConfigData.type2.width / 2
    let posY = parentNode.position.y + this.typeConfigData[`type${parentNode.data.infoType}`].height +  this.typeConfigData.UBSpan
    let len = this.allCols[index - 1]?this.allCols[index - 1].length:0
    posX = this.pieceSize  * len + this.pieceSize  / 2 - this.typeConfigData.type2.width / 2
    nodeObj.position.x = posX
    nodeObj.position.y = posY
    let newNode = this.graph.addNode(nodeObj)
    if(parentNode) this.graph.addEdge({
      source: parentNode.id,
      target: nodeObj.id,
      router: {
        name: 'er',
        args: {direction: 'V',offset:'center'},
      },
      attrs: {
        line: {
          targetMarker: 'classic',
          stroke: '#f5222d',
        },
      },
    })
    const data = newNode.getData()
    newNode.setData(data)
    node.children.reduce((pre, cur, index) => {
      return this.dealLevelThreeData(cur, pre, index, node.children.length - 1)
    },{...nodeObj, maxRowTotalHeight: 0})
  }

  // 处理3类型
  dealLevelThreeData(node, parentNode,index,parentChildNum,  col = 0) {
    let nodeObj = cloneDeep(node)
    delete nodeObj.children
    nodeObj = {...this.typeTemplateData[`type${node.infoType}`],id: nodeObj.id, data: nodeObj, size: { height: this.typeConfigData.type3.height,width: this.typeConfigData.type3.width}}
    let maxRowTotalHeight = 0
    let row = this.getMaxRow(node)
    let rowHeight = 0
    if(node.children.length){
      maxRowTotalHeight = row * this.typeConfigData.type3.height + row * this.typeConfigData.UBSpan
      rowHeight = this.typeConfigData.type3.height + this.typeConfigData.UBSpan
    }
    nodeObj.maxRowTotalHeight = maxRowTotalHeight
    nodeObj.rowHeight = rowHeight
    let rowNum = node.children.length
    let posX = parentNode.position.x
    // let posY = parentNode.position.y + this.typeConfigData[`type${parentNode.data.infoType}`].height +  this.typeConfigData.UBSpan + maxRowTotalHeight/2 + parentNode.maxRowTotalHeight
    let posY = parentNode.position.y + this.typeConfigData[`type${parentNode.data.infoType}`].height +  this.typeConfigData.UBSpan + maxRowTotalHeight/2 + parentNode.maxRowTotalHeight / 2
    nodeObj.position.x = posX
    nodeObj.position.y = posY
    nodeObj.originalPosY = parentNode.position.y + this.typeConfigData.UBSpan + this.typeConfigData[`type${parentNode.data.infoType}`].height
    nodeObj.originalPosX = parentNode.position.x
    // 如果子节点创建完毕则创建群组
    if(parentChildNum == index) {
      let height = nodeObj.position.y - this.OriginPosition.y  + this.typeConfigData.type3.height + 40
      this.graph.addNode({
        x: this.OriginPosition.x - 10,
        y: this.OriginPosition.y - 10,
        width: this.typeConfigData.type3.width + 20,
        height,
        zIndex: 1,
        // label: 'Parent\n(try to move me)',
        attrs: {
          label: {
            refY: 120,
            fontSize: 12,
          },
          body: {
            fill: '#1890ff1a',
            stroke: '#1890ff',
          },
        },
      })
      this.OriginPosition = {}
    }
    let newNode = this.graph.addNode(nodeObj)
    if(parentNode && index == 0) {
      this.OriginPosition.x = nodeObj.position.x
      this.OriginPosition.y = nodeObj.position.y
      this.graph.addEdge({
        source: parentNode.id,
        target: nodeObj.id,
        router: {
          name: 'er',
          args: {direction: 'V',offset:'center'},
        }
      })
    }
    const data = newNode.getData()
    newNode.setData(data)
    col++
    node.children.forEach( item => {
      this.dealEndNode(item, nodeObj, col, rowNum)
    })
    return nodeObj
  }

  // 处理4类型
  dealEndNode(node, parentNode, col = 0, rowNum) {
    let nodeObj = cloneDeep(node)
    delete nodeObj.children
    let rowHeight = parentNode.maxRowTotalHeight / rowNum
    nodeObj = {...this.typeTemplateData[`type${node.infoType}`],id: nodeObj.id, data: nodeObj, size: { height: this.typeConfigData.type4.height,width: this.typeConfigData.type4.width}}
    let posX = parentNode.originalPosX + this.pieceSize  * col + this.pieceSize  / 2 - this.typeConfigData.type4.width / 2
    let posY = parentNode.originalPosY + rowHeight / 2 - this.typeConfigData.type4.height / 2
    // 子项坐标重叠校验
    let check = `${posX}${posY}`
    while(this.posSet.has(check)) {
      posY += rowHeight
      check = `${posX}${posY}`
    }
    this.posSet.add(check)
    nodeObj.position.x = posX
    nodeObj.position.y = posY
    nodeObj.maxRowTotalHeight = rowHeight
    nodeObj.originalPosY = parentNode.originalPosY
    nodeObj.originalPosX = parentNode.originalPosX
    
    let newNode = this.graph.addNode(nodeObj)
    if(parentNode) this.graph.addEdge({
      source: parentNode.id,
      target: nodeObj.id,
      router: {
        name: 'er',
        args: {direction: 'L',offset:'center'},
      },
      attrs: {
        line: {
          stroke: '#faad14',
          targetMarker: 'classic',
        },
      },
    })

    const data = newNode.getData()
    newNode.setData(data)
    col++
    node.children.forEach( item => this.dealEndNode(item, nodeObj, col, node.children.length))
  }

}

export default CreateGraph