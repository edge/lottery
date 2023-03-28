<!--
// Copyright (C) 2023 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.
-->

<script setup lang="ts">
import { computed } from 'vue'

type Props = {
  xe?: number
  mxe?: number
}

const props = defineProps<Props>()

const xeAmount = computed(() => (props.mxe !== undefined ? props.mxe / 1e6 : props.xe))
</script>

<template>
  <span>{{ xeAmount }} XE</span>
</template>
