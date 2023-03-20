<script setup lang="ts">
import * as earnings from '@/api/earnings'
import AddressLink from '@/components/AddressLink.vue'
import HashLink from '@/components/HashLink.vue'
import type { Payment } from '@/api/earnings'
import XEAmount from '@/components/XEAmount.vue'
import { reactive } from 'vue'

const checked = reactive<string[]>([])
const paginate = reactive({ limit: 10, page: 1 })
const payments = reactive<Payment[]>([])

const reset = () => {
  while (payments.length > 0) payments.pop()
  while (checked.length > 0) checked.pop()
  paginate.page = 1
}

const init = async () => {
  reset()
  const res = await earnings.listPayments({ limit: 11, page: paginate.page })
  payments.push(...res.results)
  checked.push(...res.results.map(p => p.hash))
}

const loadMore = async () => {
  paginate.page++
  const res = await earnings.listPayments(paginate)
  if (paginate.page === 2) {
    payments.push(...res.results.slice(1))
  }
  else {
    payments.push(...res.results)
  }
}

const submit = async () => {
  console.error('WIP')
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
              <input type="checkbox" :checked="checked.includes(payment.hash)"/>
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
      <button type="button" @click="loadMore">Load more</button>
      <button type="submit">Ready</button>
    </form>
  </main>
</template>
