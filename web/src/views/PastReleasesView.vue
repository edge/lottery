<script setup lang="ts">
import type { Release } from '@/api/releases'
import XEAmount from '@/components/XEAmount.vue'
import { formatTimestamp } from '@/lib'
import { list as listReleases } from '@/api/releases'
import { reactive } from 'vue'
import { useBuild } from '@/stores/build'

const build = useBuild()

const releases = reactive<Release[]>([])

function reset() {
  while (releases.length > 0) releases.pop()
}

async function init() {
  reset()
  const res = await listReleases(build.api.host)
  releases.push(...res.results)
}

function totalAmount(release: Release) {
  return release.winners.reduce((tot, w) => tot + w.amount, 0)
}

init()
</script>

<template>
  <main>
    <header class="title">
      <h2>Past Releases</h2>
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
        <tr v-for="release in releases" v-bind:key="release._key">
          <td class="timestamp">
            <RouterLink :to="`/releases/${release._key}`">{{
              formatTimestamp(release.timestamp)
            }}</RouterLink>
          </td>
          <td class="numWinners">
            {{ release.winners.length }}
          </td>
          <td class="amount">
            <XEAmount :mxe="totalAmount(release)" />
          </td>
        </tr>
      </tbody>
    </table>
  </main>
</template>
