// pages/BlueprintPage.tsx
import bannerSvg from '../assets/banner.svg';
import { BlueprintCard } from '../components/BlueprintCard';
import { HomepageToggle } from '../components/HomepageToggle';
import { useBlueprintConfig } from '../hooks/useBlueprintConfig';
import { Code2, Database, FileCode } from 'lucide-react';

export function BlueprintPage() {
  const { data: config, isLoading } = useBlueprintConfig();

  if (isLoading) {
    return <div className="p-8">Carregando...</div>;
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      {/* Banner */}
      <div className="w-full">
        <img
          src={bannerSvg}
          alt="Blueprint Module Banner"
          className="w-full rounded-lg shadow-md"
        />
      </div>

      {/* Configuração da Instância */}
      <BlueprintCard
        title={config?.title || 'Blueprint Module'}
        description={config?.description}
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Esta página demonstra as práticas corretas para criar módulos na plataforma.
          </p>

          {/* Toggle Homepage */}
          <HomepageToggle />
        </div>
      </BlueprintCard>

      {/* Exemplos */}
      <BlueprintCard title="Padrões Demonstrados">
        <ul className="space-y-2">
          <li className="flex items-start gap-2">
            <FileCode className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <strong>Assets Internos:</strong> Banner importado de <code>./assets/banner.svg</code>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <Database className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <strong>JQEL:</strong> Config carregada via <code>useBlueprintConfig()</code> hook
            </div>
          </li>
          <li className="flex items-start gap-2">
            <Code2 className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <strong>Single-Instance:</strong> Apenas uma instância por portal
            </div>
          </li>
        </ul>
      </BlueprintCard>
    </div>
  );
}
