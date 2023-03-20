<script setup lang="ts">
import config from '@/config'
import { computed } from 'vue';

type Props = {
  hash: string
  length?: number
}

const props = withDefaults(defineProps<Props>(), { length: 8 })

const href = computed(() => `${config.explorer.host}/transaction/${props.hash}`)
</script>

<template>
  <a
    class="hash-link"
    target="_blank"
    :href="href"
    :title="hash"
  >
    <span>{{ hash.slice(0, length) }}</span>
  </a>
</template>
