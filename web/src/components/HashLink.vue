<!--
// Copyright (C) 2023 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.
-->

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
