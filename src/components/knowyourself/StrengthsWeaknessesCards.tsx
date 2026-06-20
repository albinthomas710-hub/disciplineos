import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Target, Plus, Trash2, Check, X, TrendingUp } from "lucide-react";
import { useState } from "react";

interface StrengthsWeaknessesCardsProps {
  strengths: string[];
  weaknesses: string[];
  showAddStrength: boolean;
  showAddWeakness: boolean;
  newStrength: string;
  newWeakness: string;
  setShowAddStrength: (show: boolean) => void;
  setShowAddWeakness: (show: boolean) => void;
  setNewStrength: (value: string) => void;
  setNewWeakness: (value: string) => void;
  onAddStrength: () => void;
  onRemoveStrength: (strength: string) => void;
  onAddWeakness: () => void;
  onRemoveWeakness: (weakness: string) => void;
  onMarkFixed: (weakness: string) => void;
}

export default function StrengthsWeaknessesCards({
  strengths,
  weaknesses,
  showAddStrength,
  showAddWeakness,
  newStrength,
  newWeakness,
  setShowAddStrength,
  setShowAddWeakness,
  setNewStrength,
  setNewWeakness,
  onAddStrength,
  onRemoveStrength,
  onAddWeakness,
  onRemoveWeakness,
  onMarkFixed,
}: StrengthsWeaknessesCardsProps) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Strengths Card - Dark Psychology: Pride & Achievement */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-2 border-green-300 dark:border-green-700 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950 dark:via-emerald-950 dark:to-teal-950 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-green-600 to-emerald-600 p-2.5 rounded-xl shadow-lg">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-black bg-gradient-to-r from-green-700 via-emerald-700 to-teal-700 dark:from-green-400 dark:via-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                    Your Strengths
                  </h3>
                  <p className="text-xs text-green-600 dark:text-green-400 font-semibold">
                    {strengths.length} powers unlocked
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => setShowAddStrength(!showAddStrength)}
                className="cursor-pointer bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <AnimatePresence>
              {showAddStrength && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex gap-2 p-3 border-2 border-green-400 dark:border-green-600 rounded-xl bg-white dark:bg-green-950/50 shadow-inner">
                    <input
                      type="text"
                      value={newStrength}
                      onChange={(e) => setNewStrength(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && onAddStrength()}
                      placeholder="What makes you powerful?"
                      className="flex-1 px-3 py-2 rounded-lg border-2 border-green-300 dark:border-green-700 bg-background focus:border-green-500 dark:focus:border-green-500 transition-colors font-medium"
                      autoFocus
                    />
                    <Button size="sm" onClick={onAddStrength} className="cursor-pointer bg-green-600 hover:bg-green-700">
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setShowAddStrength(false)} className="cursor-pointer">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {strengths.length > 0 ? (
              <ul className="space-y-2">
                <AnimatePresence>
                  {strengths.map((strength, i) => (
                    <motion.li
                      key={strength}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -20, opacity: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center justify-between gap-2 p-3 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-all duration-200 group border border-transparent hover:border-green-300 dark:hover:border-green-700"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg" />
                        <span className="font-semibold text-sm">{strength}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onRemoveStrength(strength)}
                        className="cursor-pointer h-8 w-8 p-0 opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/50 transition-all duration-200"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            ) : (
              <div className="text-center py-8 px-4">
                <Sparkles className="h-12 w-12 mx-auto mb-3 text-green-400 opacity-50" />
                <p className="text-sm text-muted-foreground font-medium">
                  Click + to claim your strengths
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  Or analyze patterns to discover them
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Weaknesses Card - Dark Psychology: Fear & Urgency */}
      <motion.div
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-2 border-orange-300 dark:border-orange-700 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 dark:from-orange-950 dark:via-red-950 dark:to-pink-950 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-orange-600 to-red-600 p-2.5 rounded-xl shadow-lg">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-black bg-gradient-to-r from-orange-700 via-red-700 to-pink-700 dark:from-orange-400 dark:via-red-400 dark:to-pink-400 bg-clip-text text-transparent">
                    Growth Areas
                  </h3>
                  <p className="text-xs text-orange-600 dark:text-orange-400 font-semibold">
                    {weaknesses.length} battles to win
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => setShowAddWeakness(!showAddWeakness)}
                className="cursor-pointer bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <AnimatePresence>
              {showAddWeakness && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex gap-2 p-3 border-2 border-orange-400 dark:border-orange-600 rounded-xl bg-white dark:bg-orange-950/50 shadow-inner">
                    <input
                      type="text"
                      value={newWeakness}
                      onChange={(e) => setNewWeakness(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && onAddWeakness()}
                      placeholder="What's holding you back?"
                      className="flex-1 px-3 py-2 rounded-lg border-2 border-orange-300 dark:border-orange-700 bg-background focus:border-orange-500 dark:focus:border-orange-500 transition-colors font-medium"
                      autoFocus
                    />
                    <Button size="sm" onClick={onAddWeakness} className="cursor-pointer bg-orange-600 hover:bg-orange-700">
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setShowAddWeakness(false)} className="cursor-pointer">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {weaknesses.length > 0 ? (
              <ul className="space-y-2">
                <AnimatePresence>
                  {weaknesses.map((weakness, i) => (
                    <motion.li
                      key={weakness}
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: 20, opacity: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center justify-between gap-2 p-3 rounded-xl hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-all duration-200 group border border-transparent hover:border-orange-300 dark:hover:border-orange-700"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-orange-500 to-red-500 shadow-lg" />
                        <span className="font-semibold text-sm">{weakness}</span>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onMarkFixed(weakness)}
                          className="cursor-pointer h-8 w-8 p-0 hover:bg-green-100 dark:hover:bg-green-900/50"
                          title="Conquered!"
                        >
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onRemoveWeakness(weakness)}
                          className="cursor-pointer h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/50"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            ) : (
              <div className="text-center py-8 px-4">
                <Target className="h-12 w-12 mx-auto mb-3 text-orange-400 opacity-50" />
                <p className="text-sm text-muted-foreground font-medium">
                  Click + to identify growth areas
                </p>
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                  Or analyze patterns to reveal them
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
