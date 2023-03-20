<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <nav class="primary-menu">
    <RouterLink to="/">Dashboard</RouterLink>
    <RouterLink to="/releases/new">New Release</RouterLink>
    <RouterLink to="/releases">Past Releases</RouterLink>
    <RouterLink to="/payouts">Payouts</RouterLink>
  </nav>
</template>
