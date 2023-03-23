import * as xe from '@edge/xe-utils'
import { Context } from '../main'

export type Payer = ReturnType<typeof payer>

export const payer = ({ config }: Context) => {
  let info: xe.wallet.WalletInfo | undefined

  const refresh = async () => {
    info = await xe.wallet.infoWithNextNonce(config.blockchain.host, config.funds.payer.address)
    return info
  }

  const get = () => info === undefined ? refresh() : info

  return { get, refresh }
}
