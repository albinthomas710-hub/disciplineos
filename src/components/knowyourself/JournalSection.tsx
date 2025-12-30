import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Trash2, Heart, Target, Sparkles, Save, Lock } from "lucide-react";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";

export default function JournalSection() {
  const journalEntries = useQuery(api.selfDiscovery.getJournalEntries, { limit: 5 });
  const addJournalEntry = useMutation(api.selfDiscovery.addJournalEntry);
  const deleteJournalEntry = useMutation(api.selfDiscovery.deleteJournalEntry);

  const [showJournal, setShowJournal] = useState(false);
  const [gratitude, setGratitude] = useState("");
  const [greatToday, setGreatToday] = useState("");
  const [affirmations, setAffirmations] = useState("");
  const [mood, setMood] = useState(5);

  const handleSaveJournal = async () => {
    if (!gratitude.trim() && !greatToday.trim() && !affirmations.trim()) {
      toast.error("Please fill in at least one section");
      return;
    }

    const toastId = toast.loading("Saving your legacy...");
    try {
      await addJournalEntry({
        prompt: "Daily Structured Reflection",
        response: "Structured Entry", // Legacy field filler
        gratitude: gratitude.trim(),
        greatToday: greatToday.trim(),
        affirmations: affirmations.trim(),
        mood: mood,
      });
      
      setGratitude("");
      setGreatToday("");
      setAffirmations("");
      setMood(5);
      setShowJournal(false);
      toast.success("Journal entry immortalized 🔒", { id: toastId });
    } catch (error) {
      toast.error("Failed to save entry", { id: toastId });
    }
  };

  const handleDeleteJournal = async (entryId: Id<"selfReflectionJournal">) => {
    const toastId = toast.loading("Deleting entry...");
    try {
      await deleteJournalEntry({ entryId });
      toast.success("Entry deleted", { id: toastId });
    } catch (error) {
      toast.error("Failed to delete entry", { id: toastId });
    }
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4 }}
    >
      <Card className="border-2 border-purple-300 dark:border-purple-700 bg-gradient-to-br from-purple-50 via-fuchsia-50 to-pink-50 dark:from-purple-950 dark:via-fuchsia-950 dark:to-pink-950 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
        <CardHeader className="pb-3 relative z-10">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-2.5 rounded-xl shadow-lg">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-black bg-gradient-to-r from-purple-700 via-fuchsia-700 to-pink-700 dark:from-purple-400 dark:via-fuchsia-400 dark:to-pink-400 bg-clip-text text-transparent">
                  Daily Architect Journal
                </h3>
                <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold">
                  {journalEntries?.length || 0} entries • Design your reality
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowJournal(!showJournal)}
              variant="outline"
              className="cursor-pointer border-2 border-purple-400 dark:border-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-all duration-300"
            >
              {showJournal ? "Close Journal" : "Write Entry"}
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6 relative z-10">
          <AnimatePresence>
            {showJournal && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="space-y-6 p-6 border-2 border-purple-300 dark:border-purple-700 rounded-xl bg-white/80 dark:bg-black/40 backdrop-blur-sm shadow-inner">
                  
                  {/* Section 1: Gratitude */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-purple-800 dark:text-purple-300 font-bold text-base">
                      <Heart className="h-4 w-4 text-pink-500" />
                      1. What am I grateful for?
                    </Label>
                    <p className="text-xs text-muted-foreground italic">
                      "God gave me a great non-poor life, I know the truth..."
                    </p>
                    <Textarea
                      value={gratitude}
                      onChange={(e) => setGratitude(e.target.value)}
                      placeholder="List 3 things..."
                      className="min-h-[80px] border-purple-200 dark:border-purple-800 focus:border-pink-500 transition-colors bg-white/50 dark:bg-purple-950/30"
                    />
                  </div>

                  {/* Section 2: Great Today */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-purple-800 dark:text-purple-300 font-bold text-base">
                      <Target className="h-4 w-4 text-blue-500" />
                      2. What would make today great?
                    </Label>
                    <p className="text-xs text-muted-foreground italic">
                      "I have to make 100 outreaches, I have to build something..."
                    </p>
                    <Textarea
                      value={greatToday}
                      onChange={(e) => setGreatToday(e.target.value)}
                      placeholder="Define your wins..."
                      className="min-h-[80px] border-purple-200 dark:border-purple-800 focus:border-blue-500 transition-colors bg-white/50 dark:bg-purple-950/30"
                    />
                  </div>

                  {/* Section 3: Affirmations - Masterpiece Design */}
                  <div className="relative p-1 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-lg">
                    <div className="bg-black/90 rounded-lg p-4 space-y-3">
                      <Label className="flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 font-black text-lg tracking-wide">
                        <Sparkles className="h-5 w-5 text-purple-300" />
                        3. DAILY AFFIRMATIONS
                      </Label>
                      <p className="text-xs text-purple-300/70 font-medium tracking-wider uppercase">
                        Speak it into existence. This is your reality.
                      </p>
                      <Textarea
                        value={affirmations}
                        onChange={(e) => setAffirmations(e.target.value)}
                        placeholder="I AM..."
                        className="min-h-[120px] border-2 border-purple-500/30 focus:border-purple-400 bg-purple-950/20 text-purple-100 placeholder:text-purple-700/50 font-serif text-lg leading-relaxed shadow-inner selection:bg-purple-500/30"
                      />
                    </div>
                  </div>

                  {/* Mood Slider */}
                  <div className="pt-2">
                    <div className="flex justify-between items-center mb-2">
                      <Label className="font-semibold text-sm">Daily Energy Level</Label>
                      <span className="text-xs font-bold bg-purple-100 dark:bg-purple-900 px-2 py-1 rounded-full text-purple-700 dark:text-purple-300">
                        {mood}/10
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={mood}
                      onChange={(e) => setMood(Number(e.target.value))}
                      className="w-full h-2 bg-purple-200 dark:bg-purple-800 rounded-lg appearance-none cursor-pointer accent-purple-600"
                    />
                  </div>

                  <Button
                    onClick={handleSaveJournal}
                    className="w-full h-12 text-base font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                  >
                    <Save className="h-5 w-5 mr-2" />
                    Save to History
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Recent Entries List */}
          {journalEntries && journalEntries.length > 0 && (
            <div className="space-y-4 pt-2">
              <h4 className="font-bold text-sm text-purple-700 dark:text-purple-400 uppercase tracking-wider flex items-center gap-2">
                <Lock className="h-3 w-3" /> Recent Archives
              </h4>
              <AnimatePresence>
                {journalEntries.map((entry: any, i: number) => (
                  <motion.div
                    key={entry._id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-4 border-2 border-purple-200 dark:border-purple-800/50 rounded-xl hover:border-purple-400 dark:hover:border-purple-600 transition-all duration-200 group bg-white/50 dark:bg-purple-950/20 backdrop-blur-sm"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-md">
                          {entry.date}
                        </span>
                        {entry.mood && (
                          <span className="text-xs text-muted-foreground font-medium">
                            Energy: {entry.mood}/10
                          </span>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteJournal(entry._id)}
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/50 transition-all duration-200"
                      >
                        <Trash2 className="h-3 w-3 text-red-600" />
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      {entry.gratitude && (
                        <div className="text-sm">
                          <span className="text-xs font-bold text-pink-600 dark:text-pink-400 uppercase block mb-0.5">Gratitude</span>
                          <p className="text-muted-foreground line-clamp-2">{entry.gratitude}</p>
                        </div>
                      )}
                      {entry.greatToday && (
                        <div className="text-sm">
                          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase block mb-0.5">Great Today</span>
                          <p className="text-muted-foreground line-clamp-2">{entry.greatToday}</p>
                        </div>
                      )}
                      {entry.affirmations && (
                        <div className="text-sm bg-purple-900/5 dark:bg-purple-100/5 p-2 rounded-lg border border-purple-500/10">
                          <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase block mb-0.5">Affirmations</span>
                          <p className="font-serif italic text-purple-900 dark:text-purple-100 line-clamp-2">{entry.affirmations}</p>
                        </div>
                      )}
                      {/* Fallback for old entries */}
                      {!entry.gratitude && !entry.greatToday && !entry.affirmations && (
                        <div className="text-sm">
                          <p className="text-muted-foreground">{entry.response}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
