<script setup lang="ts">
import * as earnings from '@/api/earnings'
import * as releases from '@/api/releases'
import AddressLink from '@/components/AddressLink.vue'
import HashLink from '@/components/HashLink.vue'
import type { Payment } from '@/api/earnings'
import XEAmount from '@/components/XEAmount.vue'
import { useBuild } from '@/stores/build'
import { useConfig } from '@/stores/config'
import { computed, reactive, ref } from 'vue'
import { formatTimestamp } from '@/lib'

const build = useBuild()
const { config, reload: reloadConfig } = useConfig()

const maxChecked = computed(() => config.funds.distribution.length || 0)

const checked = reactive<Record<string, Payment>>({})
const payments = reactive<Payment[]>([])

const limit = 10
const skip = computed(() => Object.keys(payments).length)
const totalCount = ref(0)

const canCheckMore = computed(() => Object.keys(checked).length < maxChecked.value)
const canLoadMore = computed(() => skip.value < totalCount.value)
const lastReleaseDate = computed(() => formatTimestamp(config.nextRelease.since))

function reset() {
  for (const hash in checked) delete checked[hash]
  while (payments.length > 0) payments.pop()
  totalCount.value = 0
}

async function init() {
  reset()
  const res = await earnings.listHighestPayments(build.api.host, { limit: maxChecked.value })
  totalCount.value = res.metadata.totalCount
  payments.push(...res.results)
  res.results.forEach(payment => {
    checked[payment.hash] = payment
  })
}

function isChecked(payment: Payment) {
  return checked[payment.hash] !== undefined
}

async function loadMore() {
  const res = await earnings.listHighestPayments(build.api.host, { limit, skip: skip.value })
  payments.push(...res.results)
}

function toggle(e: Event, payment: Payment) {
  const inputChecked = (e.target as HTMLInputElement).checked
  if (inputChecked) {
    if (canCheckMore.value) {
      checked[payment.hash] = payment
    }
  }
  else delete checked[payment.hash]
}

async function submit() {
  const winners = Object.values(checked).map((tx, i) => {
    const amount = config.funds.distribution[i] as number
    return {
      amount,
      hash: tx.hash,
      recipient: tx.recipient
    }
  })
  const res = await releases.create(build.api.host, { release: { winners } })
  console.log(res)
  reloadConfig()
}

init()
</script>

<template>
  <main>
    <header>
      <h2>New Release</h2>
    </header>
    <p>Showing highest earnings transactions since {{ lastReleaseDate }}</p>
    <form @submit.prevent="submit">
      <table>
        <thead>
          <tr>
            <th></th>
            <th>Hash</th>
            <th>Recipient</th>
            <th>Amount</th>
            <th>Memo</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(payment, i) in payments" v-bind:key="payment.hash">
            <td class="i">{{ 1 + i }}</td>
            <td class="checked">
              <input
                type="checkbox"
                :checked="isChecked(payment)"
                :disabled="!isChecked(payment) && !canCheckMore"
                @change.prevent="e => toggle(e, payment)"
              />
            </td>
            <td class="hash">
              <HashLink :hash="payment.hash"/>
            </td>
            <td class="recipient">
              <AddressLink :address="payment.recipient"/>
            </td>
            <td class="amount">
              <XEAmount :mxe="payment.amount"/>
            </td>
            <td class="memo">
              {{ payment.data.memo }}
            </td>
          </tr>
        </tbody>
      </table>
      <button type="button" :disabled="!canLoadMore" @click="loadMore">Load more</button>
      <button type="submit" :disabled="canCheckMore">Ready</button>
    </form>
  </main>
</template>
