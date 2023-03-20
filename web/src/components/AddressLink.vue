<script setup lang="ts">
import config from '@/config'
import { computed } from 'vue'

type Props = {
  address: string
  length?: number
}

const props = withDefaults(defineProps<Props>(), { length: 7 })

const href = computed(() => `${config.explorer.host}/wallet/${props.address}`)
</script>

<template>
  <a
    class="address-link"
    target="_blank"
    :href="href"
    :title="address"
  >
    <span>{{ address.slice(0, length) }}</span>
  </a>
</template>
