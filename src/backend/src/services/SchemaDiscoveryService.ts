/**
 * Schema Discovery Service
 *
 * Serviço responsável por carregar, cachear e servir documentos SDL
 * (Schema Definition Language) para o frontend.
 *
 * @see SPEC-jqel-schema.md
 */

import fs from 'fs/promises';
import path from 'path';
import type { SDLDocument } from '../types/sdl';

export class SchemaDiscoveryService {
  private cache: SDLDocument | null = null;
  private lastLoadTime: number = 0;
  private readonly cacheDuration = 5 * 60 * 1000; // 5 minutos
  private readonly schemasPath: string;

  constructor(schemasPath?: string) {
    // Caminho padrão: src/backend/schemas/
    this.schemasPath = schemasPath || path.join(process.cwd(), 'schemas');
  }

  /**
   * Obter documento SDL completo
   * Retorna do cache se disponível e não expirado
   */
  async getSchemas(): Promise<SDLDocument> {
    const now = Date.now();

    // Verificar cache
    if (this.cache && now - this.lastLoadTime < this.cacheDuration) {
      console.log('[SchemaDiscoveryService] Returning cached SDL document');
      return this.cache;
    }

    // Recarregar schemas
    console.log('[SchemaDiscoveryService] Loading SDL document from disk');
    const document = await this.loadSchemas();

    // Atualizar cache
    this.cache = document;
    this.lastLoadTime = now;

    return document;
  }

  /**
   * Recarregar schemas forçadamente
   */
  async refreshSchemas(): Promise<SDLDocument> {
    this.cache = null;
    this.lastLoadTime = 0;
    return this.getSchemas();
  }

  /**
   * Carregar documento SDL do disco
   */
  private async loadSchemas(): Promise<SDLDocument> {
    try {
      // Tentar carregar arquivo schemas.json
      const filePath = path.join(this.schemasPath, 'schemas.json');
      const content = await fs.readFile(filePath, 'utf-8');
      const document = JSON.parse(content) as SDLDocument;

      // Validar estrutura básica
      this.validateDocument(document);

      console.log(`[SchemaDiscoveryService] Loaded SDL document with ${document.schemas.length} schemas, ${document.entities.length} entities, ${document.actions.length} actions`);

      return document;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        console.warn('[SchemaDiscoveryService] schemas.json not found, returning empty document');
        return this.getEmptyDocument();
      }

      console.error('[SchemaDiscoveryService] Error loading SDL document:', error);
      throw new Error('Failed to load SDL document');
    }
  }

  /**
   * Validar estrutura básica do documento SDL
   */
  private validateDocument(document: any): asserts document is SDLDocument {
    if (!document || typeof document !== 'object') {
      throw new Error('Invalid SDL document: must be an object');
    }

    if (!Array.isArray(document.schemas)) {
      throw new Error('Invalid SDL document: schemas must be an array');
    }

    if (!Array.isArray(document.entities)) {
      throw new Error('Invalid SDL document: entities must be an array');
    }

    if (!Array.isArray(document.actions)) {
      throw new Error('Invalid SDL document: actions must be an array');
    }
  }

  /**
   * Retornar documento SDL vazio
   */
  private getEmptyDocument(): SDLDocument {
    return {
      schemas: [],
      entities: [],
      actions: [],
    };
  }

  /**
   * Obter schemas por nome
   */
  async getSchema(name: string) {
    const document = await this.getSchemas();
    return document.schemas.find((s) => s.name === name);
  }

  /**
   * Obter entidade por schema + nome
   */
  async getEntity(schema: string, name: string) {
    const document = await this.getSchemas();
    return document.entities.find((e) => e.schema === schema && e.name === name);
  }

  /**
   * Obter action por nome
   */
  async getAction(name: string) {
    const document = await this.getSchemas();
    return document.actions.find((a) => a.name === name);
  }

  /**
   * Obter actions de um schema específico
   */
  async getActionsBySchema(schema: string) {
    const document = await this.getSchemas();
    return document.actions.filter((a) => a.schema === schema);
  }

  /**
   * Obter actions searchable (para Command Palette)
   */
  async getSearchableActions() {
    const document = await this.getSchemas();
    return document.actions.filter((a) => a.searchable?.enabled === true);
  }
}

// Singleton instance
export const schemaDiscoveryService = new SchemaDiscoveryService();
