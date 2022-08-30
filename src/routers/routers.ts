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
]

export default routers
