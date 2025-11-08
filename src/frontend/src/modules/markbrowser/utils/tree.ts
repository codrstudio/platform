/**
 * Tree Utilities
 * SPEC-MARKBROWSER-D-003, SPEC-MARKBROWSER-F-002
 */

import type { Document, TreeNode } from '../types';

/**
 * Builds a hierarchical tree structure from a flat list of documents
 */
export function buildTree(documents: Document[]): TreeNode[] {
  const nodeMap = new Map<string, TreeNode>();
  const roots: TreeNode[] = [];

  // First pass: create all nodes
  documents.forEach((doc) => {
    const node: TreeNode = {
      id: doc.id,
      name: doc.name,
      path: doc.path,
      isDirectory: doc.isDirectory,
      children: doc.isDirectory ? [] : undefined,
    };
    nodeMap.set(doc.path, node);
  });

  // Second pass: build hierarchy
  documents.forEach((doc) => {
    const node = nodeMap.get(doc.path);
    if (!node) return;

    // Find parent
    const pathParts = doc.path.split('/').filter(Boolean);
    if (pathParts.length === 1) {
      // Root level
      roots.push(node);
    } else {
      // Has parent
      const parentPath = '/' + pathParts.slice(0, -1).join('/');
      const parent = nodeMap.get(parentPath);
      if (parent && parent.children) {
        parent.children.push(node);
      } else {
        // Parent not found, add to roots
        roots.push(node);
      }
    }
  });

  // Sort by name (directories first)
  const sortNodes = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.localeCompare(b.name);
    });
    nodes.forEach((node) => {
      if (node.children) {
        sortNodes(node.children);
      }
    });
  };

  sortNodes(roots);
  return roots;
}

/**
 * Extracts breadcrumb trail from a document path
 */
export function getBreadcrumbs(path: string): Array<{ name: string; path: string }> {
  const parts = path.split('/').filter(Boolean);
  const breadcrumbs: Array<{ name: string; path: string }> = [];

  parts.forEach((part, index) => {
    const crumbPath = '/' + parts.slice(0, index + 1).join('/');
    breadcrumbs.push({
      name: part,
      path: crumbPath,
    });
  });

  return breadcrumbs;
}

/**
 * Extracts table of contents from markdown content
 * SPEC-MARKBROWSER-O-018
 */
export function extractTOC(content: string): Array<{ level: number; text: string; id: string }> {
  const toc: Array<{ level: number; text: string; id: string }> = [];
  const lines = content.split('\n');

  lines.forEach((line) => {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');

      toc.push({ level, text, id });
    }
  });

  return toc;
}

/**
 * Resolves a relative link based on the current document path
 * SPEC-MARKBROWSER-M-008
 */
export function resolveRelativeLink(currentPath: string, relativeLink: string): string {
  if (relativeLink.startsWith('/')) {
    return relativeLink;
  }

  const currentDir = currentPath.substring(0, currentPath.lastIndexOf('/'));
  const parts = currentDir.split('/').filter(Boolean);

  relativeLink.split('/').forEach((part) => {
    if (part === '..') {
      parts.pop();
    } else if (part !== '.') {
      parts.push(part);
    }
  });

  return '/' + parts.join('/');
}
