import { useNavigate, Link } from 'react-router-dom';
import { Hash, Settings, Palette, Shield, Lock, PackageOpen, Home } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { usePortalExists } from '@/hooks/usePortalExists';

export interface PortalDefaultViewProps {
  portalId: string;
  portalName?: string;
  realmId: string;
  removable: boolean;
  brandColor?: string;
  theme: 'light' | 'dark' | 'system';
}

export function PortalDefaultView({
  portalId,
  portalName,
  realmId,
  removable,
  theme,
}: PortalDefaultViewProps) {
  const navigate = useNavigate();

  // Verifica se o portal "setup" existe para mostrar link "Editar"
  const { data: setupExists } = usePortalExists('setup');

  // Subtítulo baseado no contexto do portal
  const getSubtitle = () => {
    if (portalId === 'main') return 'Seu espaço principal de trabalho';
    if (portalId === 'setup') return 'Centro de configuração da plataforma';
    return 'Ambiente isolado e personalizado';
  };

  // Determina o nome exibido do portal
  const displayName = portalName || portalId.charAt(0).toUpperCase() + portalId.slice(1);

  // Ação do botão baseada no portal
  const handleAction = () => {
    if (portalId === 'setup') {
      // TODO: navegar para rota de módulos quando implementada
      console.log('Navegar para módulos');
    } else {
      navigate('/setup');
    }
  };

  const actionLabel = portalId === 'setup' ? 'Explorar Módulos' : 'Ir para Configurações';

  // Formata o tema para exibição
  const themeDisplay = theme === 'system' ? 'Sistema' : theme === 'light' ? 'Claro' : 'Escuro';

  return (
    <div className="min-h-screen bg-background">
      {/* Container principal com max-width */}
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
        {/* Breadcrumb de navegação */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            {/* Link para Home (sempre presente) */}
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/" className="flex items-center gap-1.5">
                  <Home className="h-4 w-4" aria-hidden="true" />
                  <span>Home</span>
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbSeparator />

            {/* Portal atual (não clicável) */}
            <BreadcrumbItem>
              <BreadcrumbPage>{displayName}</BreadcrumbPage>
            </BreadcrumbItem>

            {/* Link "Editar" (condicional - só se setup existir e não for o próprio setup) */}
            {setupExists && portalId !== 'setup' && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to={`/setup/portals/${portalId}`}>
                      Editar
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>

        {/* Hero Section - Card Grande */}
        <Card className="mb-8 overflow-hidden border-2 transition-shadow duration-200 hover:shadow-lg">
          <CardHeader className="text-center space-y-4 pb-8 pt-12">
            {/* Ícone grande do portal */}
            <div className="flex justify-center">
              <div className="rounded-full bg-primary/10 p-6">
                <PackageOpen className="h-16 w-16 text-primary" aria-hidden="true" />
              </div>
            </div>

            {/* Nome e descrição */}
            <div className="space-y-2">
              <CardTitle className="text-4xl font-bold tracking-tight">
                {displayName}
              </CardTitle>
              <CardDescription className="text-lg">
                {getSubtitle()}
              </CardDescription>
            </div>
          </CardHeader>
        </Card>

        <Separator className="my-8" />

        {/* Grid de Cards - Propriedades */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Card 1 - Identificação */}
          <Card className="transition-shadow duration-200 hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Hash className="h-4 w-4" aria-hidden="true" />
                <CardTitle className="text-sm font-medium">Identificador</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary" className="text-sm">
                {portalId}
              </Badge>
            </CardContent>
          </Card>

          {/* Card 2 - Reino */}
          <Card className="transition-shadow duration-200 hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Settings className="h-4 w-4" aria-hidden="true" />
                <CardTitle className="text-sm font-medium">Reino</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <Badge variant="outline" className="text-sm">
                {realmId}
              </Badge>
              <p className="text-xs text-muted-foreground">
                Compartilha configurações com outros portais do mesmo reino
              </p>
            </CardContent>
          </Card>

          {/* Card 3 - Tema */}
          <Card className="transition-shadow duration-200 hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Palette className="h-4 w-4" aria-hidden="true" />
                <CardTitle className="text-sm font-medium">Tema Ativo</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <div
                  className="h-6 w-6 rounded-full bg-primary border-2 border-border"
                  aria-label="Cor primária do tema"
                />
                <span className="text-sm font-medium">{themeDisplay}</span>
              </div>
            </CardContent>
          </Card>

          {/* Card 4 - Status */}
          <Card className="transition-shadow duration-200 hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                {removable ? (
                  <Shield className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Lock className="h-4 w-4" aria-hidden="true" />
                )}
                <CardTitle className="text-sm font-medium">Status</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <Badge
                variant={removable ? "default" : "secondary"}
                className="text-sm"
              >
                {removable ? 'Removível' : 'Protegido'}
              </Badge>
            </CardContent>
          </Card>
        </div>

        <Separator className="my-8" />

        {/* Empty State */}
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            {/* Ícone grande */}
            <div className="mb-6">
              <PackageOpen
                className="h-24 w-24 text-muted-foreground/50"
                aria-hidden="true"
              />
            </div>

            {/* Título e descrição */}
            <div className="space-y-3 mb-8 max-w-md">
              <h3 className="text-2xl font-semibold tracking-tight">
                Espaço em branco
              </h3>
              <p className="text-muted-foreground">
                Este portal ainda não possui módulos ativos. Ative funcionalidades para começar a construir sua experiência personalizada.
              </p>
            </div>

            {/* Botão de ação */}
            <Button
              size="lg"
              onClick={handleAction}
              className="gap-2"
            >
              <Settings className="h-4 w-4" aria-hidden="true" />
              {actionLabel}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
