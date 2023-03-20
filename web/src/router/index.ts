import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import NewReleaseView from '../views/NewReleaseView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Dashboard',
      component: DashboardView
    },
    {
      path: '/releases/new',
      name: 'New Release',
      component: NewReleaseView
    }
  ]
})

export default router
