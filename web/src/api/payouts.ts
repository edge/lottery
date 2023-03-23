import type * as xe from '@edge/xe-utils'

export type Payout = {
  attempts?: number
  lastResponse?: string
  release: string
  status: PayoutStatus
  tx: PayoutTx
  block?: Pick<xe.block.Block, 'hash' | 'height'>
}

export type PayoutTx = Omit<xe.tx.Tx, 'hash' | 'signature'> & Partial<Pick<xe.tx.Tx, 'hash' | 'signature'>> & {
  data: xe.tx.TxData & {
    ref: string
  }
}

export type PayoutStatus = 'unsent' | 'pending' | 'processing' | 'confirmed'
