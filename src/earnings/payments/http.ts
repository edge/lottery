import { EarningsPayment } from './db'

export const present = (p: EarningsPayment) => ({
  sender: p.sender,
  recipient: p.recipient,
  amount: p.amount,
  nonce: p.nonce,
  data: p.data,
  hash: p.hash,
  signature: p.signature
})
