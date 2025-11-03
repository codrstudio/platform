/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_SSE_URL: string
  readonly VITE_NODE_ENV: string
  // Add more env variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
