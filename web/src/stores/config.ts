import { build } from './build'
import { defineStore } from 'pinia'
import { type App, inject, ref } from 'vue'
import { type Config, get as getConfig } from '@/api/config'

export const initConfig = async (app: App) => {
  const config = await getConfig(build.api.host)
  app.use((a) => {
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
