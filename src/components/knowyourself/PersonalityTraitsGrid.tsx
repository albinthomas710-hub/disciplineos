import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Target, Zap, TrendingUp, Award, LucideIcon, Edit2 } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

interface Trait {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
  darkPsychMessage: string;
  key: "consistency" | "resilience" | "ambition" | "discipline";
}

interface PersonalityTraitsGridProps {
  traits: {
    consistency: number;
    resilience: number;
    ambition: number;
    discipline: number;
  };
}

export default function PersonalityTraitsGrid({ traits }: PersonalityTraitsGridProps) {
  const updateTraits = useMutation((api as any).selfDiscovery.updatePersonalityTraits);
  const [editingTrait, setEditingTrait] = useState<Trait | null>(null);
  const [editValue, setEditValue] = useState(0);

  const traitData: Trait[] = [
    {
      label: "Consistency",
      value: traits.consistency,
      icon: Target,
      color: "from-green-500 via-emerald-500 to-teal-500",
      darkPsychMessage: traits.consistency < 50 ? "You're losing the game" : "You're winning",
      key: "consistency",
    },
    {
      label: "Resilience",
      value: traits.resilience,
      icon: Zap,
      color: "from-orange-500 via-red-500 to-pink-500",
      darkPsychMessage: traits.resilience < 50 ? "Weakness detected" : "Unbreakable",
      key: "resilience",
    },
    {
      label: "Ambition",
      value: traits.ambition,
      icon: TrendingUp,
      color: "from-purple-500 via-fuchsia-500 to-pink-500",
      darkPsychMessage: traits.ambition < 50 ? "Dream smaller?" : "Unstoppable force",
      key: "ambition",
    },
    {
      label: "Discipline",
      value: traits.discipline,
      icon: Award,
      color: "from-blue-500 via-cyan-500 to-teal-500",
      darkPsychMessage: traits.discipline < 50 ? "Slipping away" : "Iron will",
      key: "discipline",
    },
  ];

  const handleEditClick = (trait: Trait) => {
    setEditingTrait(trait);
    setEditValue(trait.value);
  };

  const handleSave = async () => {
    if (!editingTrait) return;

    const newTraits = {
      ...traits,
      [editingTrait.key]: editValue,
    };

    try {
      await updateTraits(newTraits);
      toast.success(`${editingTrait.label} updated manually`);
      setEditingTrait(null);
    } catch (error) {
      toast.error("Failed to update trait");
    }
  };

  return (
    <>
      <div className="grid md:grid-cols-4 gap-4">
        {traitData.map((trait, i) => (
          <motion.div
            key={i}
            initial={{ y: 20, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1, type: "spring", stiffness: 200 }}
            whileHover={{ scale: 1.05, y: -5 }}
            onClick={() => handleEditClick(trait)}
            className="cursor-pointer"
          >
            <Card className="relative overflow-hidden border-2 hover:border-cyan-400 dark:hover:border-cyan-600 transition-all duration-300 group">
              {/* Animated gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${trait.color} opacity-5 group-hover:opacity-10 transition-opacity duration-500`} />
              
              {/* Pulsing glow effect for low scores (dark psychology: urgency) */}
              {trait.value < 50 && (
                <motion.div
                  className="absolute inset-0 bg-red-500/10"
                  animate={{ opacity: [0.1, 0.3, 0.1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}

              <CardContent className="p-5 relative z-10">
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Edit2 className="h-4 w-4 text-muted-foreground" />
                </div>

                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${trait.color} flex items-center justify-center mb-4 shadow-lg group-hover:shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6`}>
                  <trait.icon className="h-7 w-7 text-white drop-shadow-lg" />
                </div>
                
                <p className="text-sm text-muted-foreground mb-1 font-medium">{trait.label}</p>
                
                {/* Score with psychological messaging */}
                <div className="flex items-baseline gap-2 mb-2">
                  <p className={`text-3xl font-black tracking-tight ${trait.value < 50 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                    {trait.value}
                  </p>
                  <span className="text-lg text-muted-foreground font-bold">/100</span>
                </div>

                {/* Dark psychology message */}
                <p className={`text-xs font-semibold mb-3 ${trait.value < 50 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                  {trait.darkPsychMessage}
                </p>

                <Progress 
                  value={trait.value} 
                  className={`h-3 ${trait.value < 50 ? 'bg-red-100 dark:bg-red-950' : ''}`}
                />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Dialog open={!!editingTrait} onOpenChange={(open) => !open && setEditingTrait(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Manually Override: {editingTrait?.label}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Score Override</Label>
                <span className={`text-2xl font-bold ${editValue < 50 ? 'text-red-500' : 'text-green-500'}`}>
                  {editValue}/100
                </span>
              </div>
              <Slider
                value={[editValue]}
                onValueChange={(vals) => setEditValue(vals[0])}
                max={100}
                step={1}
                className="py-4"
              />
              <p className="text-sm text-muted-foreground italic">
                "You know yourself best. Set the score that reflects your true reality."
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTrait(null)}>Cancel</Button>
            <Button onClick={handleSave}>Save Override</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}