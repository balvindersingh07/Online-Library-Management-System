import { BlobServiceClient } from '@azure/storage-blob'
import { randomUUID } from 'node:crypto'

const ALLOWED = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp'])

export async function uploadBytes(buffer, contentType, filenameHint) {
  const conn = process.env.AZURE_STORAGE_CONNECTION_STRING
  if (!conn) throw new Error('Azure Blob is not configured')
  const container = process.env.AZURE_BLOB_CONTAINER || 'book-covers'
  const client = BlobServiceClient.fromConnectionString(conn)
  const cc = client.getContainerClient(container)
  await cc.createIfNotExists()

  let ext = ''
  if (filenameHint && filenameHint.includes('.')) {
    ext = '.' + filenameHint.split('.').pop().toLowerCase()
    if (!ALLOWED.has(ext)) ext = ''
  }
  const name = `${randomUUID().replace(/-/g, '')}${ext}`
  const bc = cc.getBlockBlobClient(name)
  await bc.uploadData(buffer, {
    blobHTTPHeaders: { blobContentType: contentType || 'application/octet-stream' },
  })
  return bc.url
}
