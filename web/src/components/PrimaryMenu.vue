<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <nav class="primary-menu">
    <RouterLink to="/releases/new">New Release</RouterLink>
    <RouterLink to="/releases">Past Releases</RouterLink>
  </nav>
</template>
