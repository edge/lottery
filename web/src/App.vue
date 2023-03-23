<script setup lang="ts">
import PrimaryMenu from '@/components/PrimaryMenu.vue'
import { RouterView } from 'vue-router'
</script>

<template>
  <header>
    <div class="wrapper">
      <PrimaryMenu/>
    </div>
  </header>

  <RouterView />
</template>
