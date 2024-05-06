import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import EditView from '@/views/EditView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/new',
    name: 'new',
    component: () => import('../views/NewView.vue')
  },
  {
    path: '/edit/:id',
    name: 'edit',
    component: EditView
  },
  {
    path: '/about',
    name: 'about',
    component: () => import( '../views/AboutView.vue')
  },
  {
    path: '/about-trackpad',
    name: 'about-trackpad',
    component: () => import( '../views/About-trackpad.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
