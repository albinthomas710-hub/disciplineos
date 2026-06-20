import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Search, Plus } from "lucide-react";
import { useState } from "react";

interface EvidenceCollectorProps {
  manifestation: any;
  onLogEvidence: (evidence: string) => void;
}

export function EvidenceCollector({ manifestation, onLogEvidence }: EvidenceCollectorProps) {
  const [newEvidence, setNewEvidence] = useState("");
  const evidenceLog = manifestation.evidenceLog || [];

  const handleSubmit = () => {
    if (!newEvidence.trim()) return;
    onLogEvidence(newEvidence.trim());
    setNewEvidence("");
  };

  return (
    <Card className="border-2 border-blue-200 dark:border-blue-800">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-blue-600" />
            <span>Evidence Log</span>
          </div>
          <Badge variant="secondary">{evidenceLog.length} signs</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          What proof did you see TODAY that this is working?
        </p>

        {/* Evidence List */}
        <div className="space-y-2 max-h-[200px] overflow-y-auto">
          {evidenceLog.slice(-5).reverse().map((item: any, i: number) => (
            <motion.div
              key={i}
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded text-sm"
            >
              <p className="font-medium text-blue-600">{item.date}</p>
              <p>{item.evidence}</p>
            </motion.div>
          ))}
        </div>

        {/* Add Evidence */}
        <div className="space-y-2">
          <Textarea
            placeholder="What synchronicity, opportunity, or progress did you notice?"
            value={newEvidence}
            onChange={(e) => setNewEvidence(e.target.value)}
            className="min-h-[80px]"
          />
          <Button 
            onClick={handleSubmit}
            disabled={!newEvidence.trim()}
            className="cursor-pointer w-full bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Log Evidence
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
