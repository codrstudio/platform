/**
 * useDocuments Hook
 * SPEC-MARKBROWSER-J-001, SPEC-MARKBROWSER-J-002
 */

import { useJQEL, useJQELMutation } from '@/hooks/useJQEL';
import type { Document, DataSourceConfig } from '../types';

interface UseDocumentsOptions {
  dataSource: DataSourceConfig;
  rootPath?: string;
}

export function useDocuments({ dataSource, rootPath }: UseDocumentsOptions) {
  // Query to fetch document list
  const { data, isLoading, error, refetch } = useJQEL<Document[]>({
    schema: dataSource.schema,
    select: dataSource.documentsEntity,
    where: rootPath ? { path: { $startsWith: rootPath } } : {},
    output: ['id', 'path', 'name', 'title', 'isDirectory', 'lastModified', 'parent'],
  });

  return {
    documents: data || [],
    isLoading,
    error,
    refetch,
  };
}

interface UseDocumentOptions {
  dataSource: DataSourceConfig;
  documentId: string;
  enabled?: boolean;
}

export function useDocument({ dataSource, documentId, enabled = true }: UseDocumentOptions) {
  const { data, isLoading, error, refetch } = useJQEL<Document>({
    schema: dataSource.schema,
    select: dataSource.documentsEntity,
    where: { id: { $eq: documentId } },
    output: ['id', 'path', 'name', 'title', 'content', 'lastModified', 'size'],
    enabled,
  });

  return {
    document: data,
    isLoading,
    error,
    refetch,
  };
}

interface UseDocumentMutationsOptions {
  dataSource: DataSourceConfig;
  onSuccess?: () => void;
}

export function useDocumentMutations({ dataSource, onSuccess }: UseDocumentMutationsOptions) {
  const mutation = useJQELMutation();

  const updateDocument = async (documentId: string, content: string) => {
    return mutation.mutateAsync({
      schema: dataSource.schema,
      mutate: dataSource.documentsEntity,
      action: 'update',
      where: { id: { $eq: documentId } },
      values: {
        content,
        lastModified: new Date().toISOString(),
      },
    });
  };

  const createDocument = async (path: string, name: string, content: string = '') => {
    return mutation.mutateAsync({
      schema: dataSource.schema,
      mutate: dataSource.documentsEntity,
      action: 'insert',
      values: {
        path,
        name,
        content,
        isDirectory: false,
        lastModified: new Date().toISOString(),
      },
    });
  };

  const deleteDocument = async (documentId: string) => {
    return mutation.mutateAsync({
      schema: dataSource.schema,
      mutate: dataSource.documentsEntity,
      action: 'delete',
      where: { id: { $eq: documentId } },
    });
  };

  return {
    updateDocument,
    createDocument,
    deleteDocument,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
