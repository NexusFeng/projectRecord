export const mockData = [{
  name: '张高测',
  num: 'L001',
  id: 'node1',
  process: 75,
  isPass: false,
  img: '',
  infoType: 1,
  children:[
    {
      id: 'node2',
      name: '必修',
      infoType: 2,
      children: [
        {
          name: '产业链认知',
          id: 'node2-1',
          infoType: 3,
          children: [
            {
              name:'光产业发展与应用',
              id: 'node2-1-1',
              infoType: 4,
              children:[
                {
                  name:'光产业发展与应用1',
                  id: 'node2-1-11',
                  infoType: 4,
                  children:[]
                },
                {
                  name:'光产业发展与应用2',
                  id: 'node2-1-1-2',
                  infoType: 4,
                  children:[]
                }
              ]
            },
            {
              name:'光产业发展与应用',
              id: 'node2-1-2',
              infoType: 4,
              children:[]
            }
          ]
        },
        {
          name: '异常处理',
          id: 'node2-2',
          infoType: 3,
          children: []
        }
      ]
    },
    {
      id: 'node3',
      name: '辅修',
      infoType: 2,
      children: [
        {
          name: '特殊技能',
          id: 'node3-1',
          infoType: 3,
          children: [
            {
              name:'光产业发展与应用',
              id: 'node3-1-1',
              infoType: 4,
              children:[
                {
                  name:'光产业发展与应用1',
                  id: 'node3-1-11',
                  infoType: 4,
                  children:[]
                },
                {
                  name:'光产业发展与应用2',
                  id: 'node3-1-1-2',
                  infoType: 4,
                  children:[]
                }
              ]
            },
            {
              name:'光产业发展与应用',
              id: 'node3-1-2',
              infoType: 4,
              children:[]
            },
            {
              name:'光产业发展与应用',
              id: 'node3-1-3',
              infoType: 4,
              children:[]
            }
          ]
        },
        {
          name: '进阶提升',
          id: 'node3-2',
          infoType: 3,
          children: []
        },
        {
          name: '进阶提升',
          id: 'node3-3',
          infoType: 3,
          children: []
        }
      ]
    }
  ]
}]