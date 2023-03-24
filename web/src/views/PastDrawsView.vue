<script setup lang="ts">
import type { Draw } from '@/api/draws'
import XEAmount from '@/components/XEAmount.vue'
import { formatTimestamp } from '@/lib'
import { list as listDraws } from '@/api/draws'
import { reactive } from 'vue'
import { useBuild } from '@/stores/build'

const build = useBuild()

const draws = reactive<Draw[]>([])

function reset() {
  while (draws.length > 0) draws.pop()
}

async function init() {
  reset()
  const res = await listDraws(build.api.host)
  draws.push(...res.results)
}

function totalAmount(draw: Draw) {
  return draw.winners.reduce((tot, w) => tot + w.amount, 0)
}

init()
</script>

<template>
  <main>
    <header class="title">
      <h2>Past Draws</h2>
    </header>
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>No. of Winners</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="draw in draws" v-bind:key="draw._key">
          <td class="timestamp">
            <RouterLink :to="`/draws/${draw._key}`">{{
              formatTimestamp(draw.timestamp)
            }}</RouterLink>
          </td>
          <td class="numWinners">
            {{ draw.winners.length }}
          </td>
          <td class="amount">
            <XEAmount :mxe="totalAmount(draw)" />
          </td>
        </tr>
      </tbody>
    </table>
  </main>
</template>
