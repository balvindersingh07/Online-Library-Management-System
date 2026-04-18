import { copyFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const index = join(root, 'dist', 'index.html')
const notFound = join(root, 'dist', '404.html')

if (!existsSync(index)) {
  console.warn('[postbuild] dist/index.html missing; skip 404.html copy')
  process.exit(0)
}
copyFileSync(index, notFound)
console.log('[postbuild] wrote dist/404.html (SPA fallback)')
