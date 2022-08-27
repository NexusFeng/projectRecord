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
]

export default routers
