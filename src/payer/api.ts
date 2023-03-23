import { Context } from '../main'
import { RequestHandler } from 'express'

export const get = ({ payer }: Context): RequestHandler => async (req, res, next) => {
  try {
    const info = await payer.get()
    res.json({
      payer: {
        address: info.address,
        balance: info.balance,
        nonce: info.nonce
      }
    })
    next()
  }
  catch (err) {
    next(err)
  }
}
