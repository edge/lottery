<!--
// Copyright (C) 2023 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.
-->

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <nav class="primary-menu">
    <RouterLink to="/draws">Past Draws</RouterLink>
    <RouterLink to="/draws/new">New Draw</RouterLink>
  </nav>
</template>
