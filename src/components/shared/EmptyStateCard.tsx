import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface EmptyStateCardProps {
  icon: LucideIcon;
  message: string;
  iconClassName?: string;
}

export function EmptyStateCard({
  icon: Icon,
  message,
  iconClassName = "text-gray-400",
}: EmptyStateCardProps) {
  return (
    <Card className="border-2 border-dashed">
      <CardContent className="py-12 text-center">
        <Icon className={`h-12 w-12 mx-auto mb-3 opacity-50 ${iconClassName}`} />
        <p className="text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  );
}
