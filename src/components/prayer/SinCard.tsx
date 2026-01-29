import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, Trophy, Trash2, History } from "lucide-react";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { motion } from "framer-motion";

interface SinCardProps {
  sin: Doc<"sinList">;
  onLogRelapse: (sin: Doc<"sinList">) => void;
  onConfess: (sin: Doc<"sinList">) => void;
  onToggleStatus: (sinId: Id<"sinList">, currentStatus: string) => void;
  onDelete: (sinId: Id<"sinList">) => void;
}

export function SinCard({ sin, onLogRelapse, onConfess, onToggleStatus, onDelete }: SinCardProps) {
  const isConquered = sin.status === "conquered";

  if (isConquered) {
    return (
      <Card className="opacity-75 border-l-4 border-l-green-500">
        <CardHeader>
          <CardTitle className="line-through text-muted-foreground">{sin.title}</CardTitle>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Conquered</Badge>
        </CardHeader>
        <CardContent>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onToggleStatus(sin._id as Id<"sinList">, "conquered")}
          >
            Reactivate Struggle
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <Card className="h-full border-l-4 border-l-red-500 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">{sin.title}</CardTitle>
              {sin.category && (
                <Badge variant="outline" className="mt-1 text-xs">
                  {sin.category}
                </Badge>
              )}
            </div>
            <div className="flex flex-col items-end">
              <Badge variant={sin.unconfessedCount > 0 ? "destructive" : "secondary"}>
                {sin.unconfessedCount} Unconfessed
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {sin.scriptureAntidote && (
            <div className="bg-muted/50 p-3 rounded-md text-sm italic border-l-2 border-primary">
              "{sin.scriptureAntidote}"
            </div>
          )}
          
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <History className="h-3 w-3" />
            Last Fall: {sin.lastRelapseDate ? new Date(sin.lastRelapseDate).toLocaleDateString() : "Never"}
          </div>

          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-red-900 dark:hover:bg-red-950"
              onClick={() => onLogRelapse(sin)}
            >
              <AlertTriangle className="h-3 w-3 mr-1" />
              Stumbled
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 border-green-200 hover:bg-green-50 hover:text-green-600 dark:border-green-900 dark:hover:bg-green-950"
              onClick={() => onConfess(sin)}
              disabled={sin.unconfessedCount === 0}
            >
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Confess
            </Button>
          </div>
          
          <div className="flex justify-between pt-2 border-t gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 text-xs border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800 dark:border-green-900 dark:text-green-400 dark:hover:bg-green-950"
              onClick={() => onToggleStatus(sin._id as Id<"sinList">, "active")}
            >
              <Trophy className="h-3 w-3 mr-1" />
              Mark Conquered
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs text-red-400 hover:text-red-600 h-8 w-8 p-0"
              onClick={() => onDelete(sin._id as Id<"sinList">)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}