import { DocumentMetadata } from 'arangojs/documents'
import { Release } from './db'

export const present = (r: Partial<DocumentMetadata> & Release) => ({
  _key: r._key,
  timestamp: r.timestamp,
  winners: r.winners,
  highestHashes: r.highestHashes
})
