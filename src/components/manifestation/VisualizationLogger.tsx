import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Eye, Sparkles } from "lucide-react";
import { useState } from "react";

interface VisualizationLoggerProps {
  onLog: (data: { emotionalIntensity: number; sensoryDetails: string; duration: number }) => void;
}

export function VisualizationLogger({ onLog }: VisualizationLoggerProps) {
  const [emotionalIntensity, setEmotionalIntensity] = useState(5);
  const [sensoryDetails, setSensoryDetails] = useState("");
  const [duration, setDuration] = useState(5);

  const handleSubmit = () => {
    if (!sensoryDetails.trim()) return;
    onLog({
      emotionalIntensity,
      sensoryDetails: sensoryDetails.trim(),
      duration,
    });
    setSensoryDetails("");
    setEmotionalIntensity(5);
    setDuration(5);
  };

  return (
    <Card className="border-2 border-purple-200 dark:border-purple-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-purple-600" />
          <span>Visualization Session</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>What did you SEE, FEEL, and HEAR?</Label>
          <Textarea
            placeholder="Describe in vivid detail... What colors? What sounds? What emotions?"
            value={sensoryDetails}
            onChange={(e) => setSensoryDetails(e.target.value)}
            className="mt-2 min-h-[100px]"
          />
        </div>

        <div>
          <Label>Emotional Intensity: {emotionalIntensity}/10</Label>
          <Slider
            value={[emotionalIntensity]}
            onValueChange={(v) => setEmotionalIntensity(v[0])}
            min={1}
            max={10}
            step={1}
            className="mt-2"
          />
          <p className="text-xs text-muted-foreground mt-1">
            How intensely did you FEEL this reality?
          </p>
        </div>

        <div>
          <Label>Duration: {duration} minutes</Label>
          <Slider
            value={[duration]}
            onValueChange={(v) => setDuration(v[0])}
            min={1}
            max={30}
            step={1}
            className="mt-2"
          />
        </div>

        <Button 
          onClick={handleSubmit} 
          disabled={!sensoryDetails.trim()}
          className="cursor-pointer w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Log Visualization Session
        </Button>
      </CardContent>
    </Card>
  );
}
