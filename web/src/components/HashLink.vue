<script setup lang="ts">
import { computed } from 'vue'
import { useBuild } from '@/stores/build'

const build = useBuild()

type Props = {
  hash: string
  length?: number
}

const props = withDefaults(defineProps<Props>(), { length: 8 })

const href = computed(() => `${build.explorer.host}/transaction/${props.hash}`)
</script>

<template>
  <a class="hash-link" target="_blank" :href="href" :title="hash">
    <span>{{ hash.slice(0, length) }}</span>
  </a>
</template>
