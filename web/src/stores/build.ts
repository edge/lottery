import { type App, inject } from 'vue'

export const build = {
  api: {
    host: import.meta.env.VITE_API_HOST || '/api'
  },
  explorer: {
    host: import.meta.env.VITE_EXPLORER_HOST || 'https://test.network'
  }
}

export const initBuild = (app: App) => {
  app.use((a) => {
    a.provide('build', build)
  })
}

export const useBuild = () => inject('build') as typeof build
