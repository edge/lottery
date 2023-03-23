import { type App, inject } from 'vue'

export const build = {
  api: {
    host: 'http://localhost:8777/api'
  },
  explorer: {
    host: 'https://test.network'
  }
}

export const initBuild = (app: App) => {
  app.use(a => {
    a.provide('build', build)
  })
}

export const useBuild = () => inject('build') as typeof build
