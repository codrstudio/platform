/**
 * CompositionList Page
 *
 * Lists all compositions for a portal with create/edit/delete actions
 */

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Copy } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import {
  useCompositions,
  useDeleteComposition,
} from '@/core/composition/hooks/useCompositionMutations';

export function CompositionList() {
  const { portalId } = useParams<{ portalId: string }>();
  const navigate = useNavigate();

  const { data: compositions, isLoading } = useCompositions(portalId);
  const deleteMutation = useDeleteComposition();

  const handleCreate = () => {
    navigate(`/setup/portals/${portalId}/compositions/new`);
  };

  const handleEdit = (compositionId: string) => {
    navigate(`/setup/portals/${portalId}/compositions/${compositionId}`);
  };

  const handleDelete = async (compositionId: string) => {
    try {
      await deleteMutation.mutateAsync(compositionId);
    } catch (error) {
      console.error('Failed to delete composition:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading compositions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Compositions</h1>
          <p className="text-muted-foreground mt-1">
            Manage layout compositions for this portal
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          New Composition
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Compositions</CardTitle>
          <CardDescription>
            Compositions define the layout structure for your portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!compositions || compositions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                No compositions found. Create your first composition to get started.
              </p>
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Create Composition
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Layout</TableHead>
                  <TableHead>Slots</TableHead>
                  <TableHead>Components</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {compositions.map((composition) => {
                  const activeSlots = Object.entries(composition.slots)
                    .filter(([key, value]) => value === true)
                    .map(([key]) => key);

                  const assignedComponents = Object.entries(composition.components)
                    .filter(([_, value]) => value !== undefined)
                    .length;

                  return (
                    <TableRow key={composition.id}>
                      <TableCell className="font-medium">
                        {composition.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {composition.layout.width}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {activeSlots.map((slot) => (
                            <Badge key={slot} variant="secondary" className="text-xs">
                              {slot}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {assignedComponents} assigned
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(composition.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Composition</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{composition.name}"?
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(composition.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}