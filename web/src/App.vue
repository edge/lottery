<!--
// Copyright (C) 2023 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.
-->

<script setup lang="ts">
import PayerInfo from './components/PayerInfo.vue'
import PrimaryMenu from '@/components/PrimaryMenu.vue'
import { RouterView } from 'vue-router'
</script>

<template>
  <header class="top">
    <h1 class="appname">Edge Lottery</h1>
    <PrimaryMenu />
  </header>

  <RouterView />

  <footer class="bottom">
    <PayerInfo />
  </footer>
</template>
