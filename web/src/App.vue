<script setup lang="ts">
import { RouterView } from 'vue-router'
import PrimaryMenu from '@/components/PrimaryMenu.vue'
</script>

<template>
  <header>
    <div class="wrapper">
      <PrimaryMenu/>
    </div>
  </header>

  <RouterView />
</template>
