// Realm Types
// Realm System - grouped portals that share configuration

export interface Realm {
  realmId: string
  name: string
  description?: string
  removable: boolean
  config?: {
    theme?: {
      mode?: 'light' | 'dark' | 'system'
      brandColor?: string
      radius?: string
    }
  }
  metadata?: Record<string, unknown>
}
