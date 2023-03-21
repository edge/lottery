<script setup lang="ts">
import * as earnings from '@/api/earnings'
import AddressLink from '@/components/AddressLink.vue'
import HashLink from '@/components/HashLink.vue'
import type { Payment } from '@/api/earnings'
import XEAmount from '@/components/XEAmount.vue'
import { reactive, ref } from 'vue'

const MAX_CHECKED = 11

const checked = reactive<Record<string, Payment>>({})
const payments = reactive<Payment[]>([])

const canCheckMore = ref(false)
const canLoadMore = ref(true)
const limit = 10
const page = ref(1)
const totalCount = ref(0)

function reset() {
  for (const hash in checked) delete checked[hash]
  while (payments.length > 0) payments.pop()
  canLoadMore.value = true
  totalCount.value = 0
  page.value = 1
}

async function init() {
  reset()
  const res = await earnings.listPayments({ limit: MAX_CHECKED, page: page.value })
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
  page.value++
  const res = await earnings.listPayments({ limit, page: page.value })
  if (page.value === 2) {
    payments.push(...res.results.slice(1))
  }
  else {
    payments.push(...res.results)
  }
  if (payments.length >= totalCount.value) {
    canLoadMore.value = false
  }
}

function toggle(e: Event, payment: Payment) {
  const inputChecked = (e.target as HTMLInputElement).checked
  if (inputChecked) {
    if (canCheckMore.value) {
      checked[payment.hash] = payment
    }
  }
  else delete checked[payment.hash]
  canCheckMore.value = Object.keys(checked).length < MAX_CHECKED
}

async function submit() {
  const hashes = Object.keys(checked)
  console.error('WIP', hashes, checked)
}

await init()
</script>

<template>
  <main>
    <header>
      <h2>New Release</h2>
    </header>
    <form @submit.prevent="submit">
      <table>
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
      <button
        v-if="canLoadMore"
        type="button"
        @click="loadMore"
      >Load more</button>
      <button type="submit" :disabled="canCheckMore">Ready</button>
    </form>
  </main>
</template>
