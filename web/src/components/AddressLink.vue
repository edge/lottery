<script setup lang="ts">
import { useBuild } from '@/stores/build';
import { computed } from 'vue'

const build = useBuild()

type Props = {
  address: string
  length?: number
}

const props = withDefaults(defineProps<Props>(), { length: 7 })

const href = computed(() => `${build.explorer.host}/wallet/${props.address}`)
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
