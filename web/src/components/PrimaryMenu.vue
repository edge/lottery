<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <nav class="primary-menu">
    <RouterLink to="/releases">Past Releases</RouterLink>
    <RouterLink to="/releases/new">New Release</RouterLink>
  </nav>
</template>
