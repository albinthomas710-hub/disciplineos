import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import { CheckCircle2, Plus, Flame, X, Circle } from "lucide-react";
import { useState } from "react";

interface DailyActionTrackerProps {
  manifestation: any;
  onLogActions: (actions: string[]) => void;
}

export function DailyActionTracker({ manifestation, onLogActions }: DailyActionTrackerProps) {
  const [newAction, setNewAction] = useState("");
  const [pendingActions, setPendingActions] = useState<Array<{ text: string; completed: boolean }>>([]);

  const today = new Date().toISOString().split('T')[0];
  const existingActions = manifestation.dailyActions?.find((d: any) => d.date === today)?.actions || [];
  const actionStreak = manifestation.actionStreak || 0;

  const handleAddAction = () => {
    if (!newAction.trim()) return;
    setPendingActions([...pendingActions, { text: newAction.trim(), completed: false }]);
    setNewAction("");
  };

  const handleToggleAction = (index: number) => {
    const updated = [...pendingActions];
    updated[index].completed = !updated[index].completed;
    setPendingActions(updated);
  };

  const handleRemovePending = (index: number) => {
    setPendingActions(pendingActions.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (pendingActions.length === 0) return;
    const allActions = [...existingActions, ...pendingActions.map(a => a.text)];
    onLogActions(allActions);
    setPendingActions([]);
  };

  return (
    <Card className="border-2 border-green-200 dark:border-green-800">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <span>Daily Actions</span>
          </div>
          {actionStreak > 0 && (
            <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
              <Flame className="h-3 w-3 mr-1" />
              {actionStreak} day streak
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          What actions did you take TODAY toward this goal?
        </p>

        {/* Saved Actions */}
        {existingActions.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">Logged Actions:</p>
            {existingActions.map((action: string, i: number) => (
              <motion.div
                key={i}
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950/30 rounded"
              >
                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span className="text-sm flex-1">{action}</span>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pending Actions */}
        {pendingActions.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">New Actions to Save:</p>
            {pendingActions.map((action, i) => (
              <motion.div
                key={i}
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-950/30 rounded border border-blue-200 dark:border-blue-800"
              >
                <Checkbox
                  checked={action.completed}
                  onCheckedChange={() => handleToggleAction(i)}
                  className="cursor-pointer"
                />
                <span className={`text-sm flex-1 ${action.completed ? 'line-through text-muted-foreground' : ''}`}>
                  {action.text}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRemovePending(i)}
                  className="cursor-pointer h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </motion.div>
            ))}
          </div>
        )}

        {/* Add Action */}
        <div className="flex gap-2">
          <Input
            placeholder="What action did you take?"
            value={newAction}
            onChange={(e) => setNewAction(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddAction()}
          />
          <Button onClick={handleAddAction} size="sm" className="cursor-pointer">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {pendingActions.length > 0 && (
          <Button 
            onClick={handleSave} 
            className="cursor-pointer w-full bg-green-600 hover:bg-green-700"
          >
            Save {pendingActions.length} Action{pendingActions.length > 1 ? 's' : ''}
          </Button>
        )}

        {existingActions.length === 0 && pendingActions.length === 0 && (
          <p className="text-xs text-center text-muted-foreground py-4">
            No actions logged today. Start building your action streak!
          </p>
        )}
      </CardContent>
    </Card>
  );
}