import './assets/main.scss'
import App from './App.vue'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { initBuild } from './stores/build'
import { initConfig } from './stores/config'
import router from './router'

async function init() {
  const app = createApp(App)

  app.use(createPinia())
  app.use(router)

  initBuild(app)
  await initConfig(app)

  app.mount('#app')
}

init().catch((err) => console.error(err))
