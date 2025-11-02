import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Plus, Check, X, Edit2, Trash2, PieChart } from "lucide-react";
import { useState } from "react";

interface TimeDistributionCardProps {
  timeDistribution: Record<string, number>;
  showAddTimeCategory: boolean;
  newTimeCategory: string;
  newTimePercentage: number;
  editingCategory: string | null;
  editPercentage: number;
  setShowAddTimeCategory: (show: boolean) => void;
  setNewTimeCategory: (value: string) => void;
  setNewTimePercentage: (value: number) => void;
  setEditingCategory: (category: string | null) => void;
  setEditPercentage: (value: number) => void;
  onAddTimeCategory: () => void;
  onUpdateTimeCategory: (category: string, percentage: number) => void;
  onDeleteTimeCategory: (category: string) => void;
}

export default function TimeDistributionCard({
  timeDistribution,
  showAddTimeCategory,
  newTimeCategory,
  newTimePercentage,
  editingCategory,
  editPercentage,
  setShowAddTimeCategory,
  setNewTimeCategory,
  setNewTimePercentage,
  setEditingCategory,
  setEditPercentage,
  onAddTimeCategory,
  onUpdateTimeCategory,
  onDeleteTimeCategory,
}: TimeDistributionCardProps) {
  const totalPercentage = Object.values(timeDistribution).reduce((sum, val) => sum + val, 0);
  const isBalanced = totalPercentage >= 95 && totalPercentage <= 105;

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="border-2 border-blue-300 dark:border-blue-700 bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-50 dark:from-blue-950 dark:via-cyan-950 dark:to-indigo-950 shadow-xl hover:shadow-2xl transition-all duration-300">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-600 to-cyan-600 p-2.5 rounded-xl shadow-lg">
                <PieChart className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-black bg-gradient-to-r from-blue-700 via-cyan-700 to-indigo-700 dark:from-blue-400 dark:via-cyan-400 dark:to-indigo-400 bg-clip-text text-transparent">
                  Where Your Time Goes
                </h3>
                <p className={`text-xs font-semibold ${isBalanced ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
                  {totalPercentage}% tracked {isBalanced ? '✓ Balanced' : '⚠ Unbalanced'}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => setShowAddTimeCategory(!showAddTimeCategory)}
              className="cursor-pointer bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <AnimatePresence>
            {showAddTimeCategory && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="flex gap-2 p-3 border-2 border-blue-400 dark:border-blue-600 rounded-xl bg-white dark:bg-blue-950/50 shadow-inner">
                  <input
                    type="text"
                    value={newTimeCategory}
                    onChange={(e) => setNewTimeCategory(e.target.value)}
                    placeholder="Category name..."
                    className="flex-1 px-3 py-2 rounded-lg border-2 border-blue-300 dark:border-blue-700 bg-background focus:border-blue-500 dark:focus:border-blue-500 transition-colors font-medium"
                    autoFocus
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newTimePercentage}
                    onChange={(e) => setNewTimePercentage(Number(e.target.value))}
                    placeholder="%"
                    className="w-20 px-3 py-2 rounded-lg border-2 border-blue-300 dark:border-blue-700 bg-background focus:border-blue-500 dark:focus:border-blue-500 transition-colors font-bold text-center"
                  />
                  <Button size="sm" onClick={onAddTimeCategory} className="cursor-pointer bg-blue-600 hover:bg-blue-700">
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowAddTimeCategory(false)} className="cursor-pointer">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {Object.keys(timeDistribution).length > 0 ? (
            <div className="space-y-3">
              <AnimatePresence>
                {Object.entries(timeDistribution)
                  .sort(([, a], [, b]) => b - a)
                  .map(([category, percentage], i) => (
                    <motion.div
                      key={category}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -20, opacity: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="space-y-2 p-3 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-200 group border border-transparent hover:border-blue-300 dark:hover:border-blue-700"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="capitalize font-bold text-sm">{category}</span>
                        <div className="flex items-center gap-2">
                          {editingCategory === category ? (
                            <>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={editPercentage}
                                onChange={(e) => setEditPercentage(Number(e.target.value))}
                                className="w-16 px-2 py-1 rounded-lg border-2 border-blue-400 dark:border-blue-600 bg-background text-sm font-bold text-center"
                                autoFocus
                              />
                              <Button
                                size="sm"
                                onClick={() => onUpdateTimeCategory(category, editPercentage)}
                                className="cursor-pointer h-7 w-7 p-0 bg-green-600 hover:bg-green-700"
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingCategory(null)}
                                className="cursor-pointer h-7 w-7 p-0"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <span className="font-black text-lg bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                                {percentage}%
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setEditingCategory(category);
                                  setEditPercentage(percentage);
                                }}
                                className="cursor-pointer h-7 w-7 p-0 opacity-0 group-hover:opacity-100 hover:bg-blue-200 dark:hover:bg-blue-800 transition-all duration-200"
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => onDeleteTimeCategory(category)}
                                className="cursor-pointer h-7 w-7 p-0 opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/50 transition-all duration-200"
                              >
                                <Trash2 className="h-3 w-3 text-red-600" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                      <Progress 
                        value={percentage} 
                        className="h-3 shadow-inner" 
                      />
                    </motion.div>
                  ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-8 px-4">
              <Clock className="h-12 w-12 mx-auto mb-3 text-blue-400 opacity-50" />
              <p className="text-sm text-muted-foreground font-medium">
                Click + to track your time manually
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                Or analyze patterns to auto-generate from time blocks
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
