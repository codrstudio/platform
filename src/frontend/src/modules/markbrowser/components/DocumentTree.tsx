/**
 * DocumentTree Component
 * SPEC-MARKBROWSER-F-001 to SPEC-MARKBROWSER-F-005
 */

import { useState } from 'react';
import { ChevronRight, ChevronDown, File, Folder, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TreeNode } from '../types';

interface DocumentTreeProps {
  tree: TreeNode[];
  activeDocumentId?: string;
  onDocumentSelect: (documentId: string, path: string) => void;
  expandDepth?: number;
}

interface TreeItemProps {
  node: TreeNode;
  level: number;
  isActive: boolean;
  onSelect: (documentId: string, path: string) => void;
  defaultExpanded: boolean;
}

function TreeItem({ node, level, isActive, onSelect, defaultExpanded }: TreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const handleClick = () => {
    if (node.isDirectory) {
      setIsExpanded(!isExpanded);
    } else {
      onSelect(node.id, node.path);
    }
  };

  const handleChevronClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-accent',
          isActive && 'bg-accent text-accent-foreground font-medium',
          'transition-colors'
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        {node.isDirectory && (
          <button
            onClick={handleChevronClick}
            className="p-0 h-4 w-4 hover:bg-accent-foreground/10 rounded"
            aria-label={isExpanded ? 'Colapsar pasta' : 'Expandir pasta'}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        )}

        {!node.isDirectory && <div className="w-4" />}

        {node.isDirectory ? (
          isExpanded ? (
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Folder className="h-4 w-4 text-muted-foreground" />
          )
        ) : (
          <File className="h-4 w-4 text-muted-foreground" />
        )}

        <span className="text-sm truncate">{node.name}</span>
      </div>

      {node.isDirectory && isExpanded && node.children && (
        <div role="group">
          {node.children.map((child) => (
            <TreeItem
              key={child.id}
              node={child}
              level={level + 1}
              isActive={child.id === activeDocumentId}
              onSelect={onSelect}
              defaultExpanded={level + 1 < (defaultExpanded ? 2 : 0)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function DocumentTree({
  tree,
  activeDocumentId,
  onDocumentSelect,
  expandDepth = 1,
}: DocumentTreeProps) {
  return (
    <nav
      className="space-y-1 overflow-y-auto"
      aria-label="Árvore de documentos"
    >
      {tree.map((node) => (
        <TreeItem
          key={node.id}
          node={node}
          level={0}
          isActive={node.id === activeDocumentId}
          onSelect={onDocumentSelect}
          defaultExpanded={expandDepth > 0}
        />
      ))}
    </nav>
  );
}
