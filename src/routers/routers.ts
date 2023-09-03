const routers = [
  {
    path: '/',
    name: 'home',
    component: () => import('../components/Home.vue')
  },
  {
    path: '/virtualList',
    name: 'virtualList',
    component: () => import('../views/virtualList/index.vue')
  },
  {
    path: '/createTable',
    name: 'virtualList',
    component: () => import('../views/createTable/index.vue')
  },
  {
    path: '/LargeFileUpload',
    name: 'largeFileUpload',
    component: () => import('../views/largeFileUpload/index.vue')
  },
  {
    path: '/X6',
    name: 'X6',
    component: () => import('../views/X6/index.vue')
  },
]

export default routers
