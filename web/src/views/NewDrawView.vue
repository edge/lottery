<script setup lang="ts">
import * as draws from '@/api/draws'
import * as earnings from '@/api/earnings'
import AddressLink from '@/components/AddressLink.vue'
import HashLink from '@/components/HashLink.vue'
import type { Payment } from '@/api/earnings'
import XEAmount from '@/components/XEAmount.vue'
import { formatTimestamp } from '@/lib'
import { useBuild } from '@/stores/build'
import { useConfig } from '@/stores/config'
import { useRouter } from 'vue-router'
import { computed, reactive, ref } from 'vue'

const router = useRouter()

const build = useBuild()
const { config, reload: reloadConfig } = useConfig()

const maxChecked = computed(() => config.funds.distribution.length || 0)

const checked = reactive<Record<string, Payment>>({})
const payments = reactive<Payment[]>([])
const mode = ref<'pick' | 'ready'>('pick')

const lastError = ref<Error>()
const limit = 10
const skip = computed(() => Object.keys(payments).length)
const totalCount = ref(0)

const canCheckMore = computed(() => Object.keys(checked).length < maxChecked.value)
const canLoadMore = computed(() => skip.value < totalCount.value)
const checkedList = computed(() => Object.values(checked))
const lastDrawDate = computed(() => formatTimestamp(config.nextDraw.since))

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
  res.results.forEach((payment) => {
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

function pick() {
  lastError.value = undefined
  mode.value = 'pick'
}

function ready() {
  mode.value = 'ready'
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

  try {
    const res = await draws.create(build.api.host, { draw: { winners } })
    await reloadConfig()
    router.push(`/draws/${res.draw._key}`)
  }
  catch (err) {
    lastError.value = err as Error
    console.log(err)
  }
}

init()
</script>

<template>
  <main>
    <header class="title">
      <h2>New Draw</h2>
    </header>
    <div class="pick" v-if="mode === 'pick'">
      <div class="info">
        <p>Showing highest earnings transactions since {{ lastDrawDate }}</p>
      </div>
      <form @submit.prevent="ready">
        <table>
          <thead>
            <tr>
              <th></th>
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
                  @change.prevent="(e) => toggle(e, payment)"
                />
              </td>
              <td class="hash">
                <HashLink :hash="payment.hash" />
              </td>
              <td class="recipient">
                <AddressLink :address="payment.recipient" />
              </td>
              <td class="amount">
                <XEAmount :mxe="payment.amount" />
              </td>
              <td class="memo">
                {{ payment.data.memo }}
              </td>
            </tr>
          </tbody>
        </table>
        <div class="actions">
          <button type="button" :disabled="!canLoadMore" @click="loadMore">Load more</button>
          <button type="submit" :disabled="canCheckMore">Ready</button>
        </div>
      </form>
    </div>
    <div class="ready" v-if="mode === 'ready'">
      <div class="info">
        <p>Showing selected earnings transactions since {{ lastDrawDate }}</p>
        <p>If you are satisfied with your selection, click <em>Submit</em> to proceed.</p>
      </div>
      <form @submit.prevent="submit">
        <table>
          <thead>
            <tr>
              <th>Hash</th>
              <th>Recipient</th>
              <th>Amount</th>
              <th>Memo</th>
              <th>Winnings</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(payment, i) in checkedList" v-bind:key="payment.hash">
              <td class="hash">
                <HashLink :hash="payment.hash" />
              </td>
              <td class="recipient">
                <AddressLink :address="payment.recipient" />
              </td>
              <td class="amount">
                <XEAmount :mxe="payment.amount" />
              </td>
              <td class="memo">
                {{ payment.data.memo }}
              </td>
              <td class="winnings">
                <XEAmount :mxe="config.funds.distribution[i]" />
              </td>
            </tr>
          </tbody>
        </table>
        <div class="actions">
          <button type="button" @click="pick">Back</button>
          <button type="submit">Submit</button>
        </div>
      </form>
    </div>
    <div class="error" v-if="lastError">
      {{ lastError.message }}
    </div>
  </main>
</template>
