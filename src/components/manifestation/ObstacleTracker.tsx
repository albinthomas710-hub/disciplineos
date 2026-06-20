import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { AlertTriangle, Plus, CheckCircle2 } from "lucide-react";
import { useState } from "react";

interface ObstacleTrackerProps {
  manifestation: any;
  onLogObstacle: (obstacle: { obstacle: string; solution: string }) => void;
}

export function ObstacleTracker({ manifestation, onLogObstacle }: ObstacleTrackerProps) {
  const [obstacle, setObstacle] = useState("");
  const [solution, setSolution] = useState("");
  const obstacles = manifestation.obstacles || [];

  const handleSubmit = () => {
    if (!obstacle.trim() || !solution.trim()) return;
    onLogObstacle({
      obstacle: obstacle.trim(),
      solution: solution.trim(),
    });
    setObstacle("");
    setSolution("");
  };

  return (
    <Card className="border-2 border-orange-200 dark:border-orange-800">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <span>Obstacle Tracker</span>
          </div>
          <Badge variant="secondary">{obstacles.length} overcome</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          What stopped you? How did you overcome it?
        </p>

        {/* Obstacles List */}
        <div className="space-y-2 max-h-[200px] overflow-y-auto">
          {obstacles.slice(-5).reverse().map((item: any, i: number) => (
            <motion.div
              key={i}
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="p-3 bg-orange-50 dark:bg-orange-950/30 rounded space-y-2"
            >
              <div>
                <p className="text-xs font-bold text-orange-700 dark:text-orange-400">
                  🚧 Obstacle:
                </p>
                <p className="text-sm">{item.obstacle}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-green-700 dark:text-green-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Solution:
                </p>
                <p className="text-sm">{item.solution}</p>
              </div>
              <p className="text-xs text-muted-foreground">{item.date}</p>
            </motion.div>
          ))}
        </div>

        {/* Add Obstacle */}
        <div className="space-y-3">
          <div>
            <Label>What obstacle did you face?</Label>
            <Input
              placeholder="e.g., Felt unmotivated, ran out of time, got distracted..."
              value={obstacle}
              onChange={(e) => setObstacle(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label>How did you overcome it (or will you)?</Label>
            <Textarea
              placeholder="e.g., Set a timer for 5 minutes, asked for accountability..."
              value={solution}
              onChange={(e) => setSolution(e.target.value)}
              className="mt-1 min-h-[60px]"
            />
          </div>
          <Button 
            onClick={handleSubmit}
            disabled={!obstacle.trim() || !solution.trim()}
            className="cursor-pointer w-full bg-orange-600 hover:bg-orange-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Log Obstacle & Solution
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
