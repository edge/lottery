<!--
// Copyright (C) 2023 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.
-->

<script setup lang="ts">
import AddressLink from './AddressLink.vue'
import XEAmount from './XEAmount.vue'
import { storeToRefs } from 'pinia'
import { usePayer } from '@/stores/payer'

const { payer } = storeToRefs(usePayer())
</script>

<template>
  <div class="payer" v-if="payer !== undefined">
    <span class="address">
      Payer:
      <AddressLink :address="payer.address" />
    </span>
    <span class="balance">
      <XEAmount :mxe="payer.balance" />
    </span>
  </div>
</template>
