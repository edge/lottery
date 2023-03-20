<script setup lang="ts">
import { computed } from 'vue'

type Props = {
  xe?: number
  mxe?: number
}

const props = defineProps<Props>()

const xeAmount = computed(() => props.mxe !== undefined ? props.mxe / 1e6 : props.xe)
</script>

<template>
  <span>{{ xeAmount }} XE</span>
</template>
