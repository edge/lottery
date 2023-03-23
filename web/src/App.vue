<script setup lang="ts">
import PayerInfo from './components/PayerInfo.vue'
import PrimaryMenu from '@/components/PrimaryMenu.vue'
import { RouterView } from 'vue-router'
</script>

<template>
  <header class="top">
    <h1 class="appname">Edge Lottery</h1>
    <PrimaryMenu/>
  </header>

  <RouterView />

  <footer class="bottom">
    <PayerInfo />
  </footer>
</template>
