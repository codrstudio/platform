/**
 * TipTap - Rich text editor
 *
 * Re-exporta componentes do TipTap v2.
 *
 * @see https://tiptap.dev/
 */

// Main components
export {
  useEditor,
  EditorContent,
  EditorProvider,

  // Types
  type Editor,
  type EditorOptions,
  type Content,
} from '@tiptap/react';

// Extensions
export { default as StarterKitExtension } from '@tiptap/starter-kit';
export { default as LinkExtension } from '@tiptap/extension-link';
