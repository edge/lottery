import { get as getConfig, type Config } from '@/api/config'
import { inject, ref, type App } from 'vue'
import { defineStore } from 'pinia'
import { build } from './build'

export const initConfig = async (app: App) => {
  const config = await getConfig(build.api.host)
  app.use(a => {
    a.provide('config', config)
  })
}

export const useConfig = defineStore('config', () => {
  const rootConfig = inject('config') as Config
  const config = ref<Config>(rootConfig)

  const reload = async () => {
    const freshConfig = await getConfig(build.api.host)
    config.value = freshConfig
  }

  return { config: config.value, reload }
})

