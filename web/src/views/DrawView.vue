<!--
// Copyright (C) 2023 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.
-->

<script setup lang="ts">
import AddressLink from '@/components/AddressLink.vue'
import HashLink from '@/components/HashLink.vue'
import type { Payout } from '@/api/payouts'
import XEAmount from '@/components/XEAmount.vue'
import { formatTimestamp } from '@/lib'
import { get as getDraw } from '@/api/draws'
import { useBuild } from '@/stores/build'
import { useRoute } from 'vue-router'
import type { Draw, Winner } from '@/api/draws'
import { reactive, ref } from 'vue'

const build = useBuild()
const route = useRoute()

const draw = ref<Draw>()
const payouts = reactive<Record<string, Payout>>({})

async function load() {
  const res = await getDraw(build.api.host, route.params.key as string)
  draw.value = res.draw
  for (const hash in payouts) delete payouts[hash]
  for (const refHash in res.payouts) payouts[refHash] = res.payouts[refHash]
}

function getPayout(winner: Winner): Payout {
  return payouts[winner.hash]
}

load()
</script>

<template>
  <main>
    <header class="title">
      <h2>Draw {{ draw && formatTimestamp(draw.timestamp) }} (#{{ draw?._key }})</h2>
    </header>
    <table>
      <thead>
        <tr>
          <th>Winning Hash</th>
          <th>Recipient</th>
          <th>Amount</th>
          <th>Payout Hash</th>
          <th>Payout Status</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="winner in draw?.winners" v-bind:key="winner.hash">
          <td class="winningHash">
            <HashLink :hash="winner.hash" />
          </td>
          <td class="recipient">
            <AddressLink :address="winner.recipient" />
          </td>
          <td class="amount">
            <XEAmount :mxe="winner.amount" />
          </td>
          <td class="payoutHash" v-if="getPayout(winner).tx.hash">
            <HashLink :hash="(getPayout(winner).tx.hash as string)" />
          </td>
          <td class="payoutHash" v-else>TBC</td>
          <td class="payoutStatus">
            {{ getPayout(winner).status }}
          </td>
        </tr>
      </tbody>
    </table>
    <div class="actions">
      <button type="button" @click="load">Reload</button>
    </div>
  </main>
</template>
