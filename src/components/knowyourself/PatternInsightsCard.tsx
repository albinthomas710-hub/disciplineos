import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb } from "lucide-react";

interface PatternInsightsCardProps {
  insights: any[];
}

export default function PatternInsightsCard({ insights }: PatternInsightsCardProps) {
  if (!insights || insights.length === 0) return null;

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      <Card className="border-2 border-yellow-300 dark:border-yellow-700 bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 dark:from-yellow-950 dark:via-amber-950 dark:to-orange-950 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-yellow-600 to-orange-600 p-2.5 rounded-xl shadow-lg">
              <Lightbulb className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-black bg-gradient-to-r from-yellow-700 via-amber-700 to-orange-700 dark:from-yellow-400 dark:via-amber-400 dark:to-orange-400 bg-clip-text text-transparent">
                Pattern Insights
              </h3>
              <p className="text-xs text-yellow-600 dark:text-yellow-400 font-semibold">
                🔒 Exclusive discoveries about you
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <AnimatePresence>
              {insights.map((insight: any, i: number) => (
                <motion.div
                  key={i}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-4 border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-950/50 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <h4 className="font-bold text-sm mb-1">{insight.title}</h4>
                  <p className="text-sm text-muted-foreground">{insight.description}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
