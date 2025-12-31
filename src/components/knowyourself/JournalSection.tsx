import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Trash2, Heart, Target, Sparkles, Save, Lock, FileText, Sunrise, Moon } from "lucide-react";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";

export default function JournalSection() {
  const morningJournals = useQuery(api.selfDiscovery.getMorningJournals, { limit: 5 });
  const eveningJournals = useQuery(api.selfDiscovery.getEveningJournals, { limit: 5 });
  const addMorningJournal = useMutation(api.selfDiscovery.addMorningJournal);
  const addEveningJournal = useMutation(api.selfDiscovery.addEveningJournal);
  const deleteMorningJournal = useMutation(api.selfDiscovery.deleteMorningJournal);
  const deleteEveningJournal = useMutation(api.selfDiscovery.deleteEveningJournal);

  const [showMorningJournal, setShowMorningJournal] = useState(false);
  const [showEveningJournal, setShowEveningJournal] = useState(false);
  
  // Morning journal fields
  const [gratitude, setGratitude] = useState("");
  const [greatToday, setGreatToday] = useState("");
  const [affirmations, setAffirmations] = useState("");
  const [whereAmINow, setWhereAmINow] = useState("");
  const [whoToBecome, setWhoToBecome] = useState("");
  const [morningMood, setMorningMood] = useState(5);

  // Evening journal fields
  const [wholeDayJournal, setWholeDayJournal] = useState("");
  const [eveningMood, setEveningMood] = useState(5);

  const handleSaveMorningJournal = async () => {
    if (!gratitude.trim() || !greatToday.trim() || !affirmations.trim() || !whereAmINow.trim() || !whoToBecome.trim()) {
      toast.error("Please fill in all morning journal sections");
      return;
    }

    const toastId = toast.loading("Saving morning journal...");
    try {
      await addMorningJournal({
        gratitude: gratitude.trim(),
        greatToday: greatToday.trim(),
        affirmations: affirmations.trim(),
        whereAmINow: whereAmINow.trim(),
        whoToBecome: whoToBecome.trim(),
        mood: morningMood,
      });
      
      setGratitude("");
      setGreatToday("");
      setAffirmations("");
      setWhereAmINow("");
      setWhoToBecome("");
      setMorningMood(5);
      setShowMorningJournal(false);
      toast.success("Morning journal saved 🌅", { id: toastId });
    } catch (error) {
      toast.error("Failed to save morning journal", { id: toastId });
    }
  };

  const handleSaveEveningJournal = async () => {
    if (!wholeDayJournal.trim()) {
      toast.error("Please write your whole day journal");
      return;
    }

    const toastId = toast.loading("Saving evening journal...");
    try {
      await addEveningJournal({
        wholeDayJournal: wholeDayJournal.trim(),
        mood: eveningMood,
      });
      
      setWholeDayJournal("");
      setEveningMood(5);
      setShowEveningJournal(false);
      toast.success("Evening journal saved 🌙", { id: toastId });
    } catch (error) {
      toast.error("Failed to save evening journal", { id: toastId });
    }
  };

  const handleDeleteMorningJournal = async (entryId: Id<"morningJournal">) => {
    const toastId = toast.loading("Deleting entry...");
    try {
      await deleteMorningJournal({ entryId });
      toast.success("Entry deleted", { id: toastId });
    } catch (error) {
      toast.error("Failed to delete entry", { id: toastId });
    }
  };

  const handleDeleteEveningJournal = async (entryId: Id<"eveningJournal">) => {
    const toastId = toast.loading("Deleting entry...");
    try {
      await deleteEveningJournal({ entryId });
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
                  Morning: {morningJournals?.length || 0} • Evening: {eveningJournals?.length || 0}
                </p>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6 relative z-10">
          <Tabs defaultValue="morning" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="morning" className="flex items-center gap-2">
                <Sunrise className="h-4 w-4" />
                Morning Journal
              </TabsTrigger>
              <TabsTrigger value="evening" className="flex items-center gap-2">
                <Moon className="h-4 w-4" />
                Evening Journal
              </TabsTrigger>
            </TabsList>

            <TabsContent value="morning" className="mt-4">
              <Button
                onClick={() => setShowMorningJournal(!showMorningJournal)}
                variant="outline"
                className="w-full mb-4 border-2 border-purple-400 dark:border-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/50"
              >
                {showMorningJournal ? "Close Morning Journal" : "Write Morning Journal"}
              </Button>

              <AnimatePresence>
                {showMorningJournal && (
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
                          "God gave me a great non-poor life, I know the truth. God gave me ambition and drive. I have another day to prove myself..."
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
                          "I have to make 100 outreaches, I have to build something. Be grateful and patient—today I dominate my discipline..."
                        </p>
                        <Textarea
                          value={greatToday}
                          onChange={(e) => setGreatToday(e.target.value)}
                          placeholder="Define your wins..."
                          className="min-h-[80px] border-purple-200 dark:border-purple-800 focus:border-blue-500 transition-colors bg-white/50 dark:bg-purple-950/30"
                        />
                      </div>

                      {/* Section 3: Affirmations */}
                      <div className="relative p-0.5 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-lg">
                        <div className="bg-white/90 dark:bg-black/60 rounded-[10px] p-4 space-y-3 backdrop-blur-sm">
                          <Label className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-black text-lg tracking-wide">
                            <Sparkles className="h-5 w-5 text-purple-500" />
                            3. DAILY AFFIRMATIONS
                          </Label>
                          <p className="text-xs text-muted-foreground font-medium tracking-wider">
                            "I AM unstoppable. I AM disciplined. I AM building an empire. Every second I waste, my enemies get ahead. I don't have time for weakness."
                          </p>
                          <Textarea
                            value={affirmations}
                            onChange={(e) => setAffirmations(e.target.value)}
                            placeholder="I AM..."
                            className="min-h-[120px] border-2 border-purple-200 dark:border-purple-800 focus:border-purple-500 bg-white/50 dark:bg-purple-950/30 text-foreground placeholder:text-muted-foreground/50 font-serif text-lg leading-relaxed shadow-inner"
                          />
                        </div>
                      </div>

                      {/* Section 4: WHERE AM I RIGHT NOW? */}
                      <div className="space-y-2 border-2 border-orange-300 dark:border-orange-700 rounded-xl p-4 bg-orange-50/50 dark:bg-orange-950/20">
                        <Label className="flex items-center gap-2 text-orange-800 dark:text-orange-300 font-black text-base uppercase tracking-wide">
                          <Target className="h-5 w-5 text-orange-600" />
                          4. WHERE AM I RIGHT NOW?
                        </Label>
                        <p className="text-xs text-muted-foreground italic font-medium">
                          "Be brutally honest. What's your current reality? Your skills, your discipline level, your financial situation, your daily habits..."
                        </p>
                        <Textarea
                          value={whereAmINow}
                          onChange={(e) => setWhereAmINow(e.target.value)}
                          placeholder="Current reality check..."
                          className="min-h-[100px] border-orange-200 dark:border-orange-800 focus:border-orange-500 transition-colors bg-white/70 dark:bg-orange-950/30"
                        />
                      </div>

                      {/* Section 5: WHO DO I NEED TO BECOME? */}
                      <div className="space-y-2 border-2 border-cyan-300 dark:border-cyan-700 rounded-xl p-4 bg-cyan-50/50 dark:bg-cyan-950/20">
                        <Label className="flex items-center gap-2 text-cyan-800 dark:text-cyan-300 font-black text-base uppercase tracking-wide">
                          <Sparkles className="h-5 w-5 text-cyan-600" />
                          5. WHO DO I NEED TO BECOME?
                        </Label>
                        <p className="text-xs text-muted-foreground italic font-medium">
                          "To accomplish the things I want to accomplish... What version of yourself closes the gap? What habits, mindset, skills?"
                        </p>
                        <Textarea
                          value={whoToBecome}
                          onChange={(e) => setWhoToBecome(e.target.value)}
                          placeholder="The person I must become..."
                          className="min-h-[100px] border-cyan-200 dark:border-cyan-800 focus:border-cyan-500 transition-colors bg-white/70 dark:bg-cyan-950/30"
                        />
                      </div>

                      {/* Mood Slider */}
                      <div className="pt-2">
                        <div className="flex justify-between items-center mb-2">
                          <Label className="font-semibold text-sm">Morning Energy Level</Label>
                          <span className="text-xs font-bold bg-purple-100 dark:bg-purple-900 px-2 py-1 rounded-full text-purple-700 dark:text-purple-300">
                            {morningMood}/10
                          </span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={morningMood}
                          onChange={(e) => setMorningMood(Number(e.target.value))}
                          className="w-full h-2 bg-purple-200 dark:bg-purple-800 rounded-lg appearance-none cursor-pointer accent-purple-600"
                        />
                      </div>

                      <Button
                        onClick={handleSaveMorningJournal}
                        className="w-full h-12 text-base font-bold bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                      >
                        <Save className="h-5 w-5 mr-2" />
                        Save Morning Journal
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Recent Morning Entries */}
              {morningJournals && morningJournals.length > 0 && (
                <div className="space-y-4 pt-4">
                  <h4 className="font-bold text-sm text-orange-700 dark:text-orange-400 uppercase tracking-wider flex items-center gap-2">
                    <Sunrise className="h-3 w-3" /> Recent Morning Journals
                  </h4>
                  <AnimatePresence>
                    {morningJournals.map((entry: any, i: number) => (
                      <motion.div
                        key={entry._id}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -20, opacity: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="p-4 border-2 border-orange-200 dark:border-orange-800/50 rounded-xl hover:border-orange-400 dark:hover:border-orange-600 transition-all duration-200 group bg-white/50 dark:bg-orange-950/20 backdrop-blur-sm"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 px-2 py-1 rounded-md">
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
                            onClick={() => handleDeleteMorningJournal(entry._id)}
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/50 transition-all duration-200"
                          >
                            <Trash2 className="h-3 w-3 text-red-600" />
                          </Button>
                        </div>
                        
                        <div className="space-y-3 text-sm">
                          <div>
                            <span className="text-xs font-bold text-pink-600 dark:text-pink-400 uppercase block mb-0.5">Gratitude</span>
                            <p className="text-muted-foreground line-clamp-2">{entry.gratitude}</p>
                          </div>
                          <div>
                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase block mb-0.5">Great Today</span>
                            <p className="text-muted-foreground line-clamp-2">{entry.greatToday}</p>
                          </div>
                          <div className="bg-purple-900/5 dark:bg-purple-100/5 p-2 rounded-lg border border-purple-500/10">
                            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase block mb-0.5">Affirmations</span>
                            <p className="font-serif italic text-purple-900 dark:text-purple-100 line-clamp-2">{entry.affirmations}</p>
                          </div>
                          <div>
                            <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase block mb-0.5">Where Am I Now</span>
                            <p className="text-muted-foreground line-clamp-2">{entry.whereAmINow}</p>
                          </div>
                          <div>
                            <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase block mb-0.5">Who To Become</span>
                            <p className="text-muted-foreground line-clamp-2">{entry.whoToBecome}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </TabsContent>

            <TabsContent value="evening" className="mt-4">
              <Button
                onClick={() => setShowEveningJournal(!showEveningJournal)}
                variant="outline"
                className="w-full mb-4 border-2 border-indigo-400 dark:border-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
              >
                {showEveningJournal ? "Close Evening Journal" : "Write Evening Journal"}
              </Button>

              <AnimatePresence>
                {showEveningJournal && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-6 p-6 border-2 border-indigo-300 dark:border-indigo-700 rounded-xl bg-white/80 dark:bg-black/40 backdrop-blur-sm shadow-inner">
                      
                      {/* Whole Day Journal */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-indigo-800 dark:text-indigo-300 font-bold text-base">
                          <FileText className="h-4 w-4 text-emerald-500" />
                          Whole Day Journal
                        </Label>
                        <p className="text-xs text-muted-foreground italic">
                          "Woke up at 5am, trained for 1 hour. Made 50 outreaches before lunch. Had a moment of weakness at 3pm but pushed through. Closed 2 clients. This is who I'm becoming..."
                        </p>
                        <Textarea
                          value={wholeDayJournal}
                          onChange={(e) => setWholeDayJournal(e.target.value)}
                          placeholder="Log your entire day here..."
                          className="min-h-[200px] border-indigo-200 dark:border-indigo-800 focus:border-emerald-500 transition-colors bg-white/50 dark:bg-indigo-950/30"
                        />
                      </div>

                      {/* Mood Slider */}
                      <div className="pt-2">
                        <div className="flex justify-between items-center mb-2">
                          <Label className="font-semibold text-sm">Evening Energy Level</Label>
                          <span className="text-xs font-bold bg-indigo-100 dark:bg-indigo-900 px-2 py-1 rounded-full text-indigo-700 dark:text-indigo-300">
                            {eveningMood}/10
                          </span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={eveningMood}
                          onChange={(e) => setEveningMood(Number(e.target.value))}
                          className="w-full h-2 bg-indigo-200 dark:bg-indigo-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                      </div>

                      <Button
                        onClick={handleSaveEveningJournal}
                        className="w-full h-12 text-base font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                      >
                        <Save className="h-5 w-5 mr-2" />
                        Save Evening Journal
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Recent Evening Entries */}
              {eveningJournals && eveningJournals.length > 0 && (
                <div className="space-y-4 pt-4">
                  <h4 className="font-bold text-sm text-indigo-700 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                    <Moon className="h-3 w-3" /> Recent Evening Journals
                  </h4>
                  <AnimatePresence>
                    {eveningJournals.map((entry: any, i: number) => (
                      <motion.div
                        key={entry._id}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -20, opacity: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="p-4 border-2 border-indigo-200 dark:border-indigo-800/50 rounded-xl hover:border-indigo-400 dark:hover:border-indigo-600 transition-all duration-200 group bg-white/50 dark:bg-indigo-950/20 backdrop-blur-sm"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded-md">
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
                            onClick={() => handleDeleteEveningJournal(entry._id)}
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/50 transition-all duration-200"
                          >
                            <Trash2 className="h-3 w-3 text-red-600" />
                          </Button>
                        </div>
                        
                        <div className="text-sm">
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase block mb-1">Whole Day Journal</span>
                          <p className="text-muted-foreground whitespace-pre-wrap">{entry.wholeDayJournal}</p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
}