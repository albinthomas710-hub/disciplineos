import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Brain, Plus, Sparkles, CheckCircle2 } from "lucide-react";
import { useState } from "react";

interface BeliefAuditProps {
  manifestation: any;
  onAddBelief: (belief: string) => void;
  onResolveBelief: (index: number, reframe: string) => void;
  onGenerateReframes: () => void;
}

export function BeliefAudit({ 
  manifestation, 
  onAddBelief, 
  onResolveBelief,
  onGenerateReframes 
}: BeliefAuditProps) {
  const [newBelief, setNewBelief] = useState("");
  const [reframeIndex, setReframeIndex] = useState<number | null>(null);
  const [reframeText, setReframeText] = useState("");
  
  const limitingBeliefs = manifestation.limitingBeliefs || [];
  const unresolvedCount = limitingBeliefs.filter((b: any) => !b.resolved).length;

  const handleAddBelief = () => {
    if (!newBelief.trim()) return;
    onAddBelief(newBelief.trim());
    setNewBelief("");
  };

  const handleResolve = (index: number) => {
    if (!reframeText.trim()) return;
    onResolveBelief(index, reframeText.trim());
    setReframeIndex(null);
    setReframeText("");
  };

  return (
    <Card className="border-2 border-purple-200 dark:border-purple-800">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <span>Belief Audit</span>
          </div>
          <div className="flex gap-2">
            <Badge variant="destructive">{unresolvedCount} limiting</Badge>
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              {limitingBeliefs.length - unresolvedCount} resolved
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            What negative thoughts contradict this goal?
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={onGenerateReframes}
            className="cursor-pointer"
          >
            <Sparkles className="h-3 w-3 mr-1" />
            AI Reframes
          </Button>
        </div>

        {/* Beliefs List */}
        <div className="space-y-3 max-h-[300px] overflow-y-auto">
          {limitingBeliefs.map((belief: any, i: number) => (
            <motion.div
              key={i}
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className={`p-3 rounded border-l-4 ${
                belief.resolved 
                  ? "bg-green-50 dark:bg-green-950/20 border-green-500" 
                  : "bg-red-50 dark:bg-red-950/20 border-red-500"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-xs font-bold text-red-700 dark:text-red-400">
                    ❌ Limiting Belief:
                  </p>
                  <p className="text-sm mb-2">{belief.belief}</p>
                  
                  {belief.reframe && (
                    <div className="mt-2">
                      <p className="text-xs font-bold text-green-700 dark:text-green-400">
                        ✅ Empowering Reframe:
                      </p>
                      <p className="text-sm">{belief.reframe}</p>
                    </div>
                  )}

                  {reframeIndex === i && !belief.resolved && (
                    <div className="mt-2 space-y-2">
                      <Textarea
                        placeholder="Write an empowering reframe..."
                        value={reframeText}
                        onChange={(e) => setReframeText(e.target.value)}
                        className="min-h-[60px]"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleResolve(i)}
                          className="cursor-pointer"
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Resolve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setReframeIndex(null);
                            setReframeText("");
                          }}
                          className="cursor-pointer"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                
                {!belief.resolved && reframeIndex !== i && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setReframeIndex(i);
                      setReframeText(belief.reframe || "");
                    }}
                    className="cursor-pointer"
                  >
                    Reframe
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Add Belief */}
        <div className="space-y-2">
          <Textarea
            placeholder="What negative thought came up? (e.g., 'I'm not good enough', 'This is impossible')"
            value={newBelief}
            onChange={(e) => setNewBelief(e.target.value)}
            className="min-h-[60px]"
          />
          <Button 
            onClick={handleAddBelief}
            disabled={!newBelief.trim()}
            className="cursor-pointer w-full bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Limiting Belief
          </Button>
        </div>

        {limitingBeliefs.length === 0 && (
          <p className="text-xs text-center text-muted-foreground py-4">
            No limiting beliefs tracked yet. Add one when negative thoughts arise.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
