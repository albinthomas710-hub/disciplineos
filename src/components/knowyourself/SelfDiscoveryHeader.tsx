import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Brain, Loader2, RefreshCw } from "lucide-react";

interface SelfDiscoveryHeaderProps {
  score: number;
  isAnalyzing: boolean;
  onAnalyze: () => void;
}

export default function SelfDiscoveryHeader({ score, isAnalyzing, onAnalyze }: SelfDiscoveryHeaderProps) {
  return (
    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
      <Card className="border-2 border-cyan-300 dark:border-cyan-700 bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 dark:from-cyan-950 dark:via-blue-950 dark:to-indigo-950 shadow-2xl relative overflow-hidden">
        {/* Animated background gradient */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-indigo-500/10"
          animate={{
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{ backgroundSize: "200% 200%" }}
        />

        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-3">
            <motion.div 
              className="bg-gradient-to-br from-cyan-600 to-blue-600 p-3 rounded-xl shadow-2xl"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Brain className="h-6 w-6 text-white" />
            </motion.div>
            <div className="flex-1">
              <h2 className="text-3xl font-black bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent drop-shadow-lg">
                Know Yourself
              </h2>
              <p className="text-sm text-muted-foreground font-semibold">
                Deep insights into your patterns, strengths, and growth
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-semibold mb-1">Self-Discovery Score</p>
              <motion.p 
                className="text-5xl font-black bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent drop-shadow-xl"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {score}/100
              </motion.p>
              {/* Dark psychology: Social proof & urgency */}
              <p className={`text-xs font-bold mt-1 ${score < 50 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                {score < 30 && "⚠️ Critical: Self-awareness needed"}
                {score >= 30 && score < 50 && "📊 Below average: Room to grow"}
                {score >= 50 && score < 70 && "✓ Good: Keep pushing"}
                {score >= 70 && score < 90 && "🔥 Excellent: Top 20%"}
                {score >= 90 && "🏆 Elite: Top 5% self-awareness"}
              </p>
            </div>
            <Button
              onClick={onAnalyze}
              disabled={isAnalyzing}
              className="cursor-pointer bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              {isAnalyzing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Analyze Patterns
            </Button>
          </div>
          <Progress value={score} className="h-4 shadow-inner" />
        </CardContent>
      </Card>
    </motion.div>
  );
}