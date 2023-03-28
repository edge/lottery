// Copyright (C) 2023 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import DrawView from '@/views/DrawView.vue'
import NewDrawView from '@/views/NewDrawView.vue'
import PastDrawsView from '@/views/PastDrawsView.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Dashboard',
      component: PastDrawsView
    },
    {
      path: '/draws/new',
      name: 'New Draw',
      component: NewDrawView
    },
    {
      path: '/draws',
      name: 'Past Draws',
      component: PastDrawsView
    },
    {
      path: '/draws/:key',
      name: 'Draw',
      component: DrawView
    }
  ]
})

export default router
