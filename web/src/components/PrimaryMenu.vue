<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <nav class="primary-menu">
    <RouterLink to="/draws">Past Draws</RouterLink>
    <RouterLink to="/draws/new">New Draw</RouterLink>
  </nav>
</template>
