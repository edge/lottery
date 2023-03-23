import NewReleaseView from '@/views/NewReleaseView.vue'
import PastReleasesView from '@/views/PastReleasesView.vue'
import ReleaseView from '@/views/ReleaseView.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Dashboard',
      component: PastReleasesView
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
