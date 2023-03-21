import { defineStore } from 'pinia'
import { get as getConfig, type Config } from '@/api/config'
import { ref } from 'vue'

export const useConfig = defineStore('config', () => {
  const config = ref<Config>()

  async function fetch() {
    if (config.value === undefined) config.value = await getConfig()
  }

  return { config, fetch }
})
