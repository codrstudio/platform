// services/storage/index.ts
/**
 * Sistema de Persistência NIC Chat
 *
 * Exports centralizados para o sistema de storage.
 */

export { storageService } from './storageService'
export { LocalStorageDriver } from './LocalStorageDriver'
export type { StorageDriver, StorageDriverOptions } from './StorageDriver'
