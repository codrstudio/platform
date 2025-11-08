// About Page - Página sobre a plataforma
// Apresenta informações sobre a Platform e sua arquitetura

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ExternalLink, Layers, Package, Zap, Globe, Shield, Palette } from 'lucide-react'
import { PageBreadcrumb } from '@/components/navigation'
import { useSetupBreadcrumb } from '@/hooks/useBreadcrumb'

export function AboutPage() {
  const breadcrumbItems = useSetupBreadcrumb('Sobre')

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Breadcrumb */}
      <PageBreadcrumb items={breadcrumbItems} />

      {/* Header com Logo */}
      <div className="flex flex-col items-center gap-6 text-center">
        <img
          src="/brand.svg"
          alt="Platform"
          className="h-24 mt-8 w-auto"
        />
        <div>
          <p className="text-xl text-muted-foreground mt-2">
            Plataforma Modular para Aplicações Web Escaláveis
          </p>
          <div className="flex gap-2 justify-center mt-4">
            <Badge variant="secondary">v0.0.0</Badge>
            <Badge variant="outline">Fase de Desenvolvimento</Badge>
          </div>
        </div>
      </div>

      <Separator />

      {/* Visão Geral */}
      <Card>
        <CardHeader>
          <CardTitle>Sobre a Platform</CardTitle>
          <CardDescription>
            Uma solução completa para criar, gerenciar e escalar aplicações web modulares
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            A <strong>Platform</strong> é uma plataforma modular projetada para permitir o desenvolvimento
            ágil de aplicações web complexas através de uma arquitetura baseada em <strong>Portais</strong>,
            <strong> Módulos</strong> e <strong>Instâncias</strong>.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Com o conceito de <strong>Reinos (Realms)</strong>, a plataforma permite agrupar portais
            que compartilham configurações, tornando possível gerenciar múltiplas aplicações
            de forma centralizada e eficiente.
          </p>
        </CardContent>
      </Card>

      {/* Arquitetura */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Arquitetura
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Layers className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">Three-Layer</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                <strong>Frontend</strong> (React 19 + Vite)<br />
                <strong>Backend</strong> (Express + Node.js)<br />
                <strong>Backbone</strong> (n8n workflows)
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">Modular</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Módulos encapsulados que podem ser ativados/desativados por portal.
                Lazy loading e code splitting automático.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">Real-time</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Server-Sent Events (SSE) para atualizações em tempo real.
                Redis Pub/Sub para comunicação entre serviços.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conceitos Principais */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Hierarquia de Conceitos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-sm mb-1">1. Reino (Realm)</h4>
                <p className="text-sm text-muted-foreground">
                  Agrupamento lógico de portais que compartilham configurações como tema,
                  permissões e políticas.
                </p>
              </div>
              <Separator />
              <div>
                <h4 className="font-semibold text-sm mb-1">2. Portal</h4>
                <p className="text-sm text-muted-foreground">
                  Sub-aplicação isolada dentro da plataforma. Cada portal tem sua própria URL
                  e pode ativar diferentes módulos.
                </p>
              </div>
              <Separator />
              <div>
                <h4 className="font-semibold text-sm mb-1">3. Módulo</h4>
                <p className="text-sm text-muted-foreground">
                  Funcionalidade encapsulada e reutilizável. Pode ser ativado em múltiplos
                  portais com configurações diferentes.
                </p>
              </div>
              <Separator />
              <div>
                <h4 className="font-semibold text-sm mb-1">4. Instância</h4>
                <p className="text-sm text-muted-foreground">
                  Configuração específica de um módulo em um portal. Um módulo pode ter
                  múltiplas instâncias com diferentes parâmetros.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Recursos Principais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-primary">✓</span>
                </div>
                <span>
                  <strong>Sistema de Reinos:</strong> Agrupe portais e compartilhe configurações
                </span>
              </li>
              <li className="flex items-start gap-2">
                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-primary">✓</span>
                </div>
                <span>
                  <strong>Módulos Reutilizáveis:</strong> Desenvolva uma vez, use em múltiplos portais
                </span>
              </li>
              <li className="flex items-start gap-2">
                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-primary">✓</span>
                </div>
                <span>
                  <strong>Autenticação Unificada:</strong> JWT-based auth com n8n workflows
                </span>
              </li>
              <li className="flex items-start gap-2">
                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-primary">✓</span>
                </div>
                <span>
                  <strong>JQEL Query Language:</strong> Acesso unificado a dados, agnóstico de banco
                </span>
              </li>
              <li className="flex items-start gap-2">
                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-primary">✓</span>
                </div>
                <span>
                  <strong>Real-time Events:</strong> SSE para atualizações instantâneas
                </span>
              </li>
              <li className="flex items-start gap-2">
                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-primary">✓</span>
                </div>
                <span>
                  <strong>PWA Ready:</strong> Instalável e funciona offline
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Sistema de Tema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            Sistema de Tema
          </CardTitle>
          <CardDescription>
            Hierarquia de 3 níveis para personalização visual
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1">1</Badge>
              <div className="flex-1">
                <p className="text-sm font-medium">Sistema Default</p>
                <p className="text-xs text-muted-foreground">
                  Cor laranja vibrante (#ff7f2a) - Cor da marca
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1">2</Badge>
              <div className="flex-1">
                <p className="text-sm font-medium">Configuração do Reino</p>
                <p className="text-xs text-muted-foreground">
                  Cor compartilhada por todos os portais do reino
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1">3</Badge>
              <div className="flex-1">
                <p className="text-sm font-medium">Override do Portal</p>
                <p className="text-xs text-muted-foreground">
                  Personalização específica do portal (opcional)
                </p>
              </div>
            </div>
          </div>
          <Separator />
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-md border-2" style={{ backgroundColor: '#ff7f2a' }} />
              <span className="text-xs text-muted-foreground">#ff7f2a<br />Laranja Vibrante</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-md border-2" style={{ backgroundColor: '#8b6a6a' }} />
              <span className="text-xs text-muted-foreground">#8b6a6a<br />Marrom Rosado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-md border-2" style={{ backgroundColor: '#ffb27a' }} />
              <span className="text-xs text-muted-foreground">#ffb27a<br />Laranja Claro</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stack Tecnológico */}
      <Card>
        <CardHeader>
          <CardTitle>Stack Tecnológico</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <h4 className="font-semibold text-sm mb-3">Frontend</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• React 19 + Vite</li>
                <li>• TypeScript</li>
                <li>• TailwindCSS + shadcn/ui</li>
                <li>• TanStack Query</li>
                <li>• React Router</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Backend</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Node.js + Express</li>
                <li>• TypeScript</li>
                <li>• Redis (Pub/Sub + Streams)</li>
                <li>• JWT Authentication</li>
                <li>• Server-Sent Events</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Backbone</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• n8n Workflows</li>
                <li>• Business Logic</li>
                <li>• Data Access</li>
                <li>• External Integrations</li>
                <li>• Task Automation</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Links e Referências */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5 text-primary" />
            Documentação e Referências
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Especificações</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• spec/SPEC-concepts.md - Conceitos fundamentais</li>
                <li>• spec/SPEC-architecture.md - Arquitetura da plataforma</li>
                <li>• spec/SPEC-modules.md - Sistema de módulos</li>
                <li>• spec/SPEC-realms.md - Sistema de reinos</li>
                <li>• spec/SPEC-theming.md - Sistema de temas</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Implementação</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• src/PLAN.md - Roadmap de implementação</li>
                <li>• MANIFESTO.md - Filosofia e visão</li>
                <li>• CLAUDE.md - Guia de desenvolvimento</li>
                <li>• spec/STACK.md - Stack tecnológico</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground">
        <p>Platform - Build once, reuse infinitely.</p>
        <p className="mt-1">© 2025 Codr.Studio</p>
      </div>
    </div>
  )
}
