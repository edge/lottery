import { DocumentMetadata } from 'arangojs/documents'
import { Draw } from './db'

export const present = (d: Partial<DocumentMetadata> & Draw) => ({
  _key: d._key,
  timestamp: d.timestamp,
  winners: d.winners,
  highestHashes: d.highestHashes
})
