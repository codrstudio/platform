// components/BlueprintCard.tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

interface BlueprintCardProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function BlueprintCard({ title, description, children }: BlueprintCardProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      {children && <CardContent>{children}</CardContent>}
    </Card>
  );
}
