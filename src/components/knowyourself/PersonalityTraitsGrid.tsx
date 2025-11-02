import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Target, Zap, TrendingUp, Award, LucideIcon } from "lucide-react";

interface Trait {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
  darkPsychMessage: string;
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
  const traitData: Trait[] = [
    {
      label: "Consistency",
      value: traits.consistency,
      icon: Target,
      color: "from-green-500 via-emerald-500 to-teal-500",
      darkPsychMessage: traits.consistency < 50 ? "You're losing the game" : "You're winning",
    },
    {
      label: "Resilience",
      value: traits.resilience,
      icon: Zap,
      color: "from-orange-500 via-red-500 to-pink-500",
      darkPsychMessage: traits.resilience < 50 ? "Weakness detected" : "Unbreakable",
    },
    {
      label: "Ambition",
      value: traits.ambition,
      icon: TrendingUp,
      color: "from-purple-500 via-fuchsia-500 to-pink-500",
      darkPsychMessage: traits.ambition < 50 ? "Dream smaller?" : "Unstoppable force",
    },
    {
      label: "Discipline",
      value: traits.discipline,
      icon: Award,
      color: "from-blue-500 via-cyan-500 to-teal-500",
      darkPsychMessage: traits.discipline < 50 ? "Slipping away" : "Iron will",
    },
  ];

  return (
    <div className="grid md:grid-cols-4 gap-4">
      {traitData.map((trait, i) => (
        <motion.div
          key={i}
          initial={{ y: 20, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1, type: "spring", stiffness: 200 }}
          whileHover={{ scale: 1.05, y: -5 }}
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
  );
}
