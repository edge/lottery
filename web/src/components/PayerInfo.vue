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
      <AddressLink :address="payer.address"/>
    </span>
    <span class="balance">
      <XEAmount :mxe="payer.balance"/>
    </span>
  </div>
</template>
