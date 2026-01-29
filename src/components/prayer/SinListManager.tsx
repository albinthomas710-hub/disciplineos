import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Skull, CheckCircle2, AlertTriangle, Plus, Trash2, History, Sword, Flame, ListChecks, Calendar } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Id } from "@/convex/_generated/dataModel";
import { Checkbox } from "@/components/ui/checkbox";

export function SinListManager() {
  const activeSins = useQuery(api.sins.getActive);
  const conqueredSins = useQuery(api.sins.getConquered);
  const logs = useQuery(api.sins.getLogs);
  
  const createSin = useMutation(api.sins.create);
  const logRelapse = useMutation(api.sins.logRelapse);
  const batchLogRelapse = useMutation(api.sins.batchLogRelapse);
  const confess = useMutation(api.sins.confess);
  const toggleStatus = useMutation(api.sins.toggleStatus);
  const removeSin = useMutation(api.sins.remove);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isExamenOpen, setIsExamenOpen] = useState(false);
  const [newSinTitle, setNewSinTitle] = useState("");
  const [newSinCategory, setNewSinCategory] = useState("");
  const [newSinAntidote, setNewSinAntidote] = useState("");

  const [selectedSin, setSelectedSin] = useState<any>(null);
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [logType, setLogType] = useState<"relapse" | "confession">("relapse");
  const [logNotes, setLogNotes] = useState("");
  const [logTrigger, setLogTrigger] = useState("");
  
  // Examen state
  const [examenSelected, setExamenSelected] = useState<string[]>([]);
  const [examenNotes, setExamenNotes] = useState("");

  const handleCreate = async () => {
    if (!newSinTitle.trim()) return;
    try {
      await createSin({
        title: newSinTitle,
        category: newSinCategory,
        scriptureAntidote: newSinAntidote,
      });
      setNewSinTitle("");
      setNewSinCategory("");
      setNewSinAntidote("");
      setIsAddOpen(false);
      toast.success("Added to spiritual warfare list");
    } catch (e) {
      toast.error("Failed to add item");
    }
  };

  const handleLogSubmit = async () => {
    if (!selectedSin) return;
    try {
      if (logType === "relapse") {
        await logRelapse({
          sinId: selectedSin._id,
          notes: logNotes,
          trigger: logTrigger,
        });
        toast.error("Relapse logged. Don't give up.", { icon: "🛡️" });
      } else {
        await confess({
          sinId: selectedSin._id,
          notes: logNotes,
        });
        toast.success("Confession recorded. You are washed clean.", { icon: "✨" });
      }
      setIsLogOpen(false);
      setLogNotes("");
      setLogTrigger("");
    } catch (e) {
      toast.error("Failed to log action");
    }
  };

  const handleExamenSubmit = async () => {
    if (examenSelected.length === 0) {
      toast.info("No struggles selected. Good job today!");
      setIsExamenOpen(false);
      return;
    }

    try {
      await batchLogRelapse({
        sinIds: examenSelected as Id<"sinList">[],
        notes: examenNotes || "Logged via Daily Examen",
      });
      toast.error(`Logged ${examenSelected.length} struggles. Keep fighting.`, { icon: "🛡️" });
      setIsExamenOpen(false);
      setExamenSelected([]);
      setExamenNotes("");
    } catch (e) {
      toast.error("Failed to save examen");
    }
  };

  const toggleExamenSelection = (sinId: string) => {
    setExamenSelected(prev => 
      prev.includes(sinId) 
        ? prev.filter(id => id !== sinId)
        : [...prev, sinId]
    );
  };

  const openLogModal = (sin: any, type: "relapse" | "confession") => {
    setSelectedSin(sin);
    setLogType(type);
    setIsLogOpen(true);
  };

  if (!activeSins || !conqueredSins) return <div className="p-8 text-center">Loading spiritual inventory...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sword className="h-6 w-6 text-red-500" />
            Spiritual Warfare
          </h2>
          <p className="text-muted-foreground">Identify, track, and overcome your spiritual struggles.</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isExamenOpen} onOpenChange={setIsExamenOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-purple-200 hover:bg-purple-50 text-purple-700 dark:border-purple-900 dark:text-purple-400">
                <ListChecks className="h-4 w-4 mr-2" />
                Daily Examen
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Daily Examination</DialogTitle>
                <DialogDescription>
                  Review your day. Select any areas where you stumbled today.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <ScrollArea className="h-[300px] pr-4">
                  {activeSins.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      No active struggles to check. Add some first.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activeSins.map(sin => (
                        <div key={sin._id} className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                          <Checkbox 
                            id={`examen-${sin._id}`} 
                            checked={examenSelected.includes(sin._id)}
                            onCheckedChange={() => toggleExamenSelection(sin._id)}
                          />
                          <div className="grid gap-1.5 leading-none">
                            <label
                              htmlFor={`examen-${sin._id}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              {sin.title}
                            </label>
                            {sin.category && (
                              <p className="text-xs text-muted-foreground">
                                {sin.category}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
                <div className="mt-4">
                  <label className="text-sm font-medium mb-2 block">Notes (Optional)</label>
                  <Textarea 
                    placeholder="Reflections on today's battles..." 
                    value={examenNotes}
                    onChange={(e) => setExamenNotes(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleExamenSubmit}>
                  {examenSelected.length === 0 ? "No Struggles Today" : `Log ${examenSelected.length} Stumbles`}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-red-600 hover:bg-red-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Struggle
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Identify a Struggle</DialogTitle>
                <DialogDescription>
                  "For we do not wrestle against flesh and blood..." - Eph 6:12
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name of Sin/Struggle</label>
                  <Input 
                    placeholder="e.g., Pride, Anger, Lust, Sloth" 
                    value={newSinTitle}
                    onChange={(e) => setNewSinTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category (Optional)</label>
                  <Input 
                    placeholder="e.g., Thought, Word, Deed" 
                    value={newSinCategory}
                    onChange={(e) => setNewSinCategory(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Scripture Antidote</label>
                  <Textarea 
                    placeholder="A verse to fight this specific struggle..." 
                    value={newSinAntidote}
                    onChange={(e) => setNewSinAntidote(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreate}>Add to List</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Active Battles ({activeSins.length})</TabsTrigger>
          <TabsTrigger value="conquered">Conquered ({conqueredSins.length})</TabsTrigger>
          <TabsTrigger value="history">History & Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4 mt-4">
          <AnimatePresence>
            {activeSins.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-xl">
                <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No active battles recorded</h3>
                <p className="text-muted-foreground">Add a struggle to start tracking your victory.</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {activeSins.map((sin) => (
                  <motion.div
                    key={sin._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <Card className="h-full border-l-4 border-l-red-500 shadow-sm hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{sin.title}</CardTitle>
                            {sin.category && (
                              <Badge variant="outline" className="mt-1 text-xs">
                                {sin.category}
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-col items-end">
                            <Badge variant={sin.unconfessedCount > 0 ? "destructive" : "secondary"}>
                              {sin.unconfessedCount} Unconfessed
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {sin.scriptureAntidote && (
                          <div className="bg-muted/50 p-3 rounded-md text-sm italic border-l-2 border-primary">
                            "{sin.scriptureAntidote}"
                          </div>
                        )}
                        
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <History className="h-3 w-3" />
                          Last Fall: {sin.lastRelapseDate ? new Date(sin.lastRelapseDate).toLocaleDateString() : "Never"}
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-red-900 dark:hover:bg-red-950"
                            onClick={() => openLogModal(sin, "relapse")}
                          >
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Stumbled
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 border-green-200 hover:bg-green-50 hover:text-green-600 dark:border-green-900 dark:hover:bg-green-950"
                            onClick={() => openLogModal(sin, "confession")}
                            disabled={sin.unconfessedCount === 0}
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Confess
                          </Button>
                        </div>
                        
                        <div className="flex justify-between pt-2 border-t">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-xs text-muted-foreground h-6"
                            onClick={() => toggleStatus({ sinId: sin._id })}
                          >
                            Mark Conquered
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-xs text-red-400 hover:text-red-600 h-6"
                            onClick={() => {
                              if (confirm("Delete this struggle permanently?")) {
                                removeSin({ sinId: sin._id });
                              }
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="conquered" className="mt-4">
          <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg mb-4 text-sm text-green-800 dark:text-green-300 border border-green-200 dark:border-green-900">
            <p><strong>Conquered Sins:</strong> These are struggles you have overcome or are no longer actively fighting daily. They are archived here as a testimony of victory.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {conqueredSins.map((sin) => (
              <Card key={sin._id} className="opacity-75 border-l-4 border-l-green-500">
                <CardHeader>
                  <CardTitle className="line-through text-muted-foreground">{sin.title}</CardTitle>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Conquered</Badge>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => toggleStatus({ sinId: sin._id })}
                  >
                    Reactivate Struggle
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Spiritual History
              </CardTitle>
              <CardDescription>
                A record of your battles and confessions. This data is stored securely in your private log.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {!logs ? (
                  <div className="p-4 text-center">Loading history...</div>
                ) : logs.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    No history recorded yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {logs.map((log: any) => {
                      // Find the sin title from active or conquered lists
                      const sinTitle = [...activeSins, ...conqueredSins].find(s => s._id === log.sinId)?.title || "Unknown Struggle";
                      
                      return (
                        <div key={log._id} className="flex items-start gap-4 p-4 rounded-lg border bg-card">
                          <div className={`mt-1 p-2 rounded-full ${log.type === 'relapse' ? 'bg-red-100 text-red-600 dark:bg-red-900/30' : 'bg-green-100 text-green-600 dark:bg-green-900/30'}`}>
                            {log.type === 'relapse' ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <h4 className="font-medium">{log.type === 'relapse' ? 'Stumbled in: ' : 'Confessed: '} {sinTitle}</h4>
                              <span className="text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</span>
                            </div>
                            {log.trigger && (
                              <p className="text-sm text-muted-foreground mt-1">
                                <span className="font-medium">Trigger:</span> {log.trigger}
                              </p>
                            )}
                            {log.notes && (
                              <p className="text-sm mt-1 italic">"{log.notes}"</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Log Modal */}
      <Dialog open={isLogOpen} onOpenChange={setIsLogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {logType === "relapse" ? (
                <>
                  <Flame className="h-5 w-5 text-red-500" />
                  Log a Stumble
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Record Confession
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {logType === "relapse" 
                ? "Be honest. What happened? Identifying triggers helps you fight better next time."
                : "If we confess our sins, He is faithful and just to forgive us. (1 John 1:9)"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {logType === "relapse" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Trigger / Context</label>
                <Input 
                  placeholder="What led to this? (e.g., Stress, Boredom, Late night)" 
                  value={logTrigger}
                  onChange={(e) => setLogTrigger(e.target.value)}
                />
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes / Prayer</label>
              <Textarea 
                placeholder={logType === "relapse" ? "Brief notes..." : "Prayer of repentance..."}
                value={logNotes}
                onChange={(e) => setLogNotes(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant={logType === "relapse" ? "destructive" : "default"}
              onClick={handleLogSubmit}
            >
              {logType === "relapse" ? "Log Stumble" : "Confirm Confession"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}