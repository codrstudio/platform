/**
 * HelpdeskDashboard - Dashboard principal do modulo Helpdesk
 * Baseado em: spec/modules/sac-module/SPEC-sac-helpdesk.md
 */

import { useNavigate } from 'react-router-dom';
import { Ticket, FolderTree, Users, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function HelpdeskDashboard() {
  const navigate = useNavigate();

  const menuItems = [
    {
      title: 'Categorias',
      description: 'Gerenciar categorias de chamados',
      icon: FolderTree,
      path: '/categorias',
      color: 'text-blue-500',
    },
    {
      title: 'Chamados',
      description: 'Visualizar e gerenciar chamados',
      icon: Ticket,
      path: '/chamados',
      color: 'text-green-500',
      disabled: true,
    },
    {
      title: 'Clientes',
      description: 'Gerenciar clientes',
      icon: Users,
      path: '/clientes',
      color: 'text-purple-500',
      disabled: true,
    },
    {
      title: 'Contatos',
      description: 'Gerenciar contatos',
      icon: UserCircle,
      path: '/contatos',
      color: 'text-orange-500',
      disabled: true,
    },
  ];

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Helpdesk / SAC</h1>
        <p className="text-muted-foreground">
          Sistema de atendimento ao cliente e gerenciamento de chamados
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Card
              key={item.path}
              className={`cursor-pointer hover:shadow-lg transition-shadow ${
                item.disabled ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={() => !item.disabled && navigate(item.path)}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`${item.color}`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  <div>
                    <CardTitle>{item.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{item.description}</CardDescription>
                {item.disabled && (
                  <p className="text-xs text-muted-foreground mt-2">Em desenvolvimento</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-12">
        <Card>
          <CardHeader>
            <CardTitle>Visao Geral</CardTitle>
            <CardDescription>Estatisticas rapidas do sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-3xl font-bold">-</div>
                <div className="text-sm text-muted-foreground">Chamados Abertos</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-3xl font-bold">-</div>
                <div className="text-sm text-muted-foreground">Chamados Hoje</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-3xl font-bold">-</div>
                <div className="text-sm text-muted-foreground">Tempo Medio</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-3xl font-bold">-</div>
                <div className="text-sm text-muted-foreground">Satisfacao</div>
              </div>
            </div>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Estatisticas serao implementadas nas proximas fases
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
