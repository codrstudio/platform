/**
 * Homepage Editor Page
 *
 * Dedicated page for visual homepage editing.
 * Replaces the modal-based editor to reduce DOM weight on instance form page.
 *
 * Route: /editor (relative to instance context)
 * Full URL: /setup/portals/{portalId}/modules/homepage/instances/{instanceId}/editor
 *
 * Architecture:
 * - Standalone page (not a modal overlay)
 * - Uses composition system for flexible layout
 * - Integrates HomepageVisualEditor component
 *
 * @module homepage/pages
 */

import { useParams, useNavigate } from 'react-router-dom';
import { HomepageVisualEditor } from '../components/editor/HomepageVisualEditor';

export function EditorPage() {
  const { portalId, instanceId } = useParams<{
    portalId: string;
    instanceId: string;
  }>();
  const navigate = useNavigate();

  // Navigate back to instance form
  const handleClose = () => {
    navigate(`/setup/portals/${portalId}/modules/homepage/instances/${instanceId}`);
  };

  // Validate required params
  if (!portalId || !instanceId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">Erro</h1>
          <p className="text-muted-foreground">
            Parâmetros inválidos. Portal ID e Instance ID são obrigatórios.
          </p>
        </div>
      </div>
    );
  }

  return (
    <HomepageVisualEditor
      moduleId="homepage"
      instanceId={instanceId}
      portalId={portalId}
      onClose={handleClose}
    />
  );
}
