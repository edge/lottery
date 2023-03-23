import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '@/views/DashboardView.vue'
import NewReleaseView from '@/views/NewReleaseView.vue'
import PastReleasesView from '@/views/PastReleasesView.vue'
import ReleaseView from '@/views/ReleaseView.vue'

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
    },
    {
      path: '/releases',
      name: 'Past Releases',
      component: PastReleasesView
    },
    {
      path: '/releases/:key',
      name: 'Release',
      component: ReleaseView
    }
  ]
})

export default router
