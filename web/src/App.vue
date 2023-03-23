<script setup lang="ts">
import PrimaryMenu from '@/components/PrimaryMenu.vue'
import { RouterView } from 'vue-router'
</script>

<template>
  <header class="top">
    <h1 class="appname">Edge Lottery</h1>
    <PrimaryMenu/>
  </header>

  <RouterView />
</template>
