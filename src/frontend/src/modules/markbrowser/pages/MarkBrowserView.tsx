/**
 * MarkBrowser Main Component
 * SPEC-MARKBROWSER-L-001 to SPEC-MARKBROWSER-L-004
 */

import { useState, useMemo } from 'react';
import { PanelLeftClose, PanelLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { useInstanceConfig } from '@/hooks/useInstanceConfig';
import { DocumentTree } from '../components/DocumentTree';
import { DocumentSearch } from '../components/DocumentSearch';
import { DocumentBreadcrumbs } from '../components/DocumentBreadcrumbs';
import { MarkdownViewer } from '../components/MarkdownViewer';
import { TableOfContents } from '../components/TableOfContents';
import { useDocuments, useDocument } from '../hooks/useDocuments';
import { buildTree } from '../utils/tree';
import type { MarkBrowserConfig } from '../types';

interface MarkBrowserViewProps {
  instanceId: string;
}

export function MarkBrowserView({ instanceId }: MarkBrowserViewProps) {
  const { config, isLoading: configLoading } = useInstanceConfig<MarkBrowserConfig>(instanceId);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [selectedPath, setSelectedPath] = useState<string>('/');
  const [isTreeVisible, setIsTreeVisible] = useState(true);

  const { documents, isLoading: documentsLoading, error: documentsError } = useDocuments({
    dataSource: config?.dataSource || { schema: '', documentsEntity: '' },
    rootPath: config?.rootPath,
  });

  const { document, isLoading: documentLoading, error: documentError } = useDocument({
    dataSource: config?.dataSource || { schema: '', documentsEntity: '' },
    documentId: selectedDocumentId || '',
    enabled: !!selectedDocumentId,
  });

  const tree = useMemo(() => buildTree(documents), [documents]);

  const handleDocumentSelect = (documentId: string, path: string) => {
    setSelectedDocumentId(documentId);
    setSelectedPath(path);
  };

  if (configLoading || documentsLoading) {
    return (
      <div className="flex h-full">
        <div className="w-64 border-r p-4 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-6 w-3/4" />
        </div>
        <div className="flex-1 p-6 space-y-4">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (documentsError) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>
            Erro ao carregar documentos: {documentsError.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>Configuração da instância não encontrada</AlertDescription>
        </Alert>
      </div>
    );
  }

  const showTree = config.navigation.showTree && isTreeVisible;
  const showBreadcrumbs = config.navigation.showBreadcrumbs;
  const showTOC = config.navigation.showTOC && document;
  const enableSearch = config.features.enableSearch;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsTreeVisible(!isTreeVisible)}
              className="md:flex hidden"
            >
              {isTreeVisible ? (
                <PanelLeftClose className="h-4 w-4" />
              ) : (
                <PanelLeft className="h-4 w-4" />
              )}
            </Button>
            <h1 className="text-xl font-semibold">{config.title || 'Documentação'}</h1>
          </div>
          {enableSearch && (
            <DocumentSearch
              documents={documents}
              onDocumentSelect={handleDocumentSelect}
              className="w-full max-w-md"
            />
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Document Tree */}
        {showTree && (
          <aside
            className={cn(
              'border-r bg-muted/30 overflow-y-auto transition-all',
              'w-64 md:block hidden'
            )}
          >
            <div className="p-4">
              <DocumentTree
                tree={tree}
                activeDocumentId={selectedDocumentId || undefined}
                onDocumentSelect={handleDocumentSelect}
                expandDepth={config.navigation.expandDepth}
              />
            </div>
          </aside>
        )}

        {/* Main Document Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-8">
            {showBreadcrumbs && selectedPath && (
              <DocumentBreadcrumbs
                path={selectedPath}
                onNavigate={(path) => {
                  const doc = documents.find((d) => d.path === path);
                  if (doc && !doc.isDirectory) {
                    handleDocumentSelect(doc.id, doc.path);
                  }
                }}
                className="mb-6"
              />
            )}

            {documentLoading && (
              <div className="space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            )}

            {documentError && (
              <Alert variant="destructive">
                <AlertDescription>
                  Erro ao carregar documento: {documentError.message}
                </AlertDescription>
              </Alert>
            )}

            {!selectedDocumentId && !documentLoading && (
              <div className="text-center py-12 text-muted-foreground">
                <p>Selecione um documento para visualizar</p>
              </div>
            )}

            {document && !documentLoading && (
              <MarkdownViewer
                content={document.content}
                currentPath={document.path}
                onLinkClick={(path) => {
                  const doc = documents.find((d) => d.path === path);
                  if (doc && !doc.isDirectory) {
                    handleDocumentSelect(doc.id, doc.path);
                  }
                }}
              />
            )}
          </div>
        </main>

        {/* Sidebar - Table of Contents */}
        {showTOC && (
          <aside className="w-64 border-l bg-muted/30 overflow-y-auto md:block hidden">
            <div className="p-4 sticky top-0">
              <TableOfContents content={document.content} />
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
