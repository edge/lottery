import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { initBuild } from './stores/build'
import { initConfig } from './stores/config'

import App from './App.vue'
import router from './router'

import './assets/main.scss'

async function init() {
  const app = createApp(App)

  app.use(createPinia())
  app.use(router)

  initBuild(app)
  await initConfig(app)

  app.mount('#app')
}

init().catch(err => console.error(err))
