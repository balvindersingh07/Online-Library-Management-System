/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  /** Injected in vite.config.ts when VERCEL=1 at build time */
  readonly VERCEL_DEPLOY?: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
