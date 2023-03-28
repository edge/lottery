// Copyright (C) 2023 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import { build } from './build'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { type Payer, get as getPayer } from '@/api/payer'

export const usePayer = defineStore('payer', () => {
  const payer = ref<Payer>()

  const reload = async () => {
    const res = await getPayer(build.api.host)
    payer.value = res.payer
  }

  reload().catch((err) => console.error(err))

  return { payer, reload }
})
