export const mockData = [{
  name: '根节点',
  num: '001',
  id: 'node1',
  process: 75,
  isPass: false,
  img: '',
  infoType: 1,
  children:[
    {
      id: 'node2',
      name: 'node2',
      infoType: 2,
      children: [
        {
          name: 'node2-1',
          id: 'node2-1',
          infoType: 3,
          children: [
            {
              name:'node2-1-1',
              id: 'node2-1-1',
              infoType: 4,
              children:[
                {
                  name:'node2-1-11',
                  id: 'node2-1-11',
                  infoType: 4,
                  children:[]
                },
                {
                  name:'node2-1-1-2',
                  id: 'node2-1-1-2',
                  infoType: 4,
                  children:[]
                }
              ]
            },
            {
              name:'node2-1-2',
              id: 'node2-1-2',
              infoType: 4,
              children:[]
            }
          ]
        },
        {
          name: 'node2-2',
          id: 'node2-2',
          infoType: 3,
          children: []
        }
      ]
    },
    {
      id: 'node3',
      name: 'node3',
      infoType: 2,
      children: [
        {
          name: 'node3-1',
          id: 'node3-1',
          infoType: 3,
          children: [
            {
              name:'node3-1-1',
              id: 'node3-1-1',
              infoType: 4,
              children:[
                {
                  name:'node3-1-11',
                  id: 'node3-1-11',
                  infoType: 4,
                  children:[]
                },
                {
                  name:'node3-1-1-2',
                  id: 'node3-1-1-2',
                  infoType: 4,
                  children:[]
                }
              ]
            },
            {
              name:'node3-1-2',
              id: 'node3-1-2',
              infoType: 4,
              children:[]
            },
            {
              name:'node3-1-3',
              id: 'node3-1-3',
              infoType: 4,
              children:[]
            }
          ]
        },
        {
          name: 'node3-2',
          id: 'node3-2',
          infoType: 3,
          children: []
        },
        {
          name: 'node3-3',
          id: 'node3-3',
          infoType: 3,
          children: []
        }
      ]
    }
  ]
}]