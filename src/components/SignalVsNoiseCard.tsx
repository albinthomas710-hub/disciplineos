import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Target, 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  Circle,
  Flame,
  Skull,
  TrendingUp,
  TrendingDown,
  Plus,
  X,
  Radio,
  Volume2,
  VolumeX,
  Lock,
  ShieldAlert
} from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SignalImportance = "the_one_thing" | "high_signal" | "medium_signal" | "low_signal";
type NoiseImportance = "high_noise" | "low_noise";

interface SignalTask {
  id: string;
  task: string;
  importance: SignalImportance;
  completed: boolean;
  completedAt?: number;
}

interface NoiseTask {
  id: string;
  task: string;
  importance: NoiseImportance;
  completed: boolean;
  completedAt?: number;
}

type Task = SignalTask | NoiseTask;

interface SignalVsNoiseCardProps {
  dateStr: string;
  initialSignalTasks?: SignalTask[];
  initialNoiseTasks?: NoiseTask[];
  theOneThingCompleted?: boolean;
  isToday: boolean;
}

export default function SignalVsNoiseCard({ 
  dateStr, 
  initialSignalTasks, 
  initialNoiseTasks,
  theOneThingCompleted = false,
  isToday 
}: SignalVsNoiseCardProps) {
  const updateMetrics = useMutation(api.history.updateDailyMetrics);
  
  // Initialize with props or empty arrays to prevent infinite re-renders
  const [signalTasks, setSignalTasks] = useState<SignalTask[]>(initialSignalTasks || []);
  const [noiseTasks, setNoiseTasks] = useState<NoiseTask[]>(initialNoiseTasks || []);
  const [newTask, setNewTask] = useState("");
  const [taskType, setTaskType] = useState<"signal" | "noise">("signal");
  const [taskImportance, setTaskImportance] = useState<SignalImportance | NoiseImportance>("high_signal");
  const [isSaved, setIsSaved] = useState(true);

  useEffect(() => {
    setSignalTasks(initialSignalTasks || []);
    setNoiseTasks(initialNoiseTasks || []);
    setIsSaved(true);
  }, [dateStr, initialSignalTasks, initialNoiseTasks]);

  const theOneThing = signalTasks.find(t => t.importance === "the_one_thing");
  const signalCompleted = signalTasks.filter(t => t.completed).length;
  const signalTotal = signalTasks.length;
  const signalRate = signalTotal > 0 ? Math.round((signalCompleted / signalTotal) * 100) : 0;
  
  // Dark Psychology: Lock Noise until Signal is done
  const isNoiseLocked = signalTasks.some(t => !t.completed);

  const addTask = () => {
    if (!newTask.trim()) {
      toast.error("Task cannot be empty");
      return;
    }

    if (taskType === "signal") {
      if (taskImportance === "the_one_thing" && theOneThing) {
        toast.error("You can only have ONE 'The One Thing' per day!");
        return;
      }
      const task: SignalTask = {
        id: Date.now().toString(),
        task: newTask.trim(),
        importance: taskImportance as SignalImportance,
        completed: false,
      };
      setSignalTasks([...signalTasks, task]);
    } else {
      const task: NoiseTask = {
        id: Date.now().toString(),
        task: newTask.trim(),
        importance: taskImportance as NoiseImportance,
        completed: false,
      };
      setNoiseTasks([...noiseTasks, task]);
    }

    setNewTask("");
    setIsSaved(false);
  };

  const toggleTask = (id: string, type: "signal" | "noise") => {
    if (type === "signal") {
      setSignalTasks(signalTasks.map(t => 
        t.id === id ? { ...t, completed: !t.completed, completedAt: !t.completed ? Date.now() : undefined } : t
      ));
    } else {
      // Enforce Discipline: Cannot touch noise if signal is pending
      if (isNoiseLocked) {
        toast.error("DISCIPLINE CHECK: Complete ALL Signal tasks before touching Noise.", {
          icon: <Lock className="h-4 w-4" />,
          className: "bg-red-500 text-white border-none font-bold"
        });
        return;
      }
      setNoiseTasks(noiseTasks.map(t => 
        t.id === id ? { ...t, completed: !t.completed, completedAt: !t.completed ? Date.now() : undefined } : t
      ));
    }
    setIsSaved(false);
  };

  const removeTask = (id: string, type: "signal" | "noise") => {
    if (type === "signal") {
      setSignalTasks(signalTasks.filter(t => t.id !== id));
    } else {
      setNoiseTasks(noiseTasks.filter(t => t.id !== id));
    }
    setIsSaved(false);
  };

  const handleSave = async () => {
    try {
      const theOneCompleted = theOneThing?.completed || false;
      
      await updateMetrics({
        date: dateStr,
        signalTasks,
        noiseTasks,
        signalCompletionRate: signalRate,
        theOneThingCompleted: theOneCompleted,
      });
      
      setIsSaved(true);
      toast.success("Signal vs Noise saved!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save");
    }
  };

  const getImportanceConfig = (importance: string) => {
    const configs: Record<string, { label: string; color: string; icon: any; gradient: string }> = {
      the_one_thing: { 
        label: "THE ONE THING (Most Important)", 
        color: "text-red-600 dark:text-red-400", 
        icon: Flame,
        gradient: "from-red-600 via-orange-600 to-yellow-600"
      },
      high_signal: { 
        label: "High Importance (Signal)", 
        color: "text-orange-600 dark:text-orange-400", 
        icon: Zap,
        gradient: "from-orange-500 to-red-500"
      },
      medium_signal: { 
        label: "Medium Importance (Signal)", 
        color: "text-blue-600 dark:text-blue-400", 
        icon: TrendingUp,
        gradient: "from-blue-500 to-indigo-500"
      },
      low_signal: { 
        label: "Low Importance (Signal)", 
        color: "text-green-600 dark:text-green-400", 
        icon: Target,
        gradient: "from-green-500 to-emerald-500"
      },
      high_noise: { 
        label: "High Noise (Delegate/Delay)", 
        color: "text-yellow-600 dark:text-yellow-400", 
        icon: AlertTriangle,
        gradient: "from-yellow-500 to-amber-500"
      },
      low_noise: { 
        label: "Low Noise (Ignore)", 
        color: "text-gray-600 dark:text-gray-400", 
        icon: VolumeX,
        gradient: "from-gray-500 to-slate-500"
      },
    };
    return configs[importance] || configs.low_signal;
  };

  return (
    <Card className="border-2 border-red-500/30 bg-gradient-to-br from-red-50/30 via-orange-50/20 to-yellow-50/10 dark:from-red-950/20 dark:via-orange-950/10 dark:to-yellow-950/5 shadow-2xl overflow-hidden relative">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-orange-500/5 pointer-events-none" />
      <motion.div 
        className="absolute top-0 left-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <CardHeader className="pb-4 border-b-2 border-red-500/20 relative">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <CardTitle className="text-3xl font-black tracking-tight flex items-center gap-3">
              <motion.div
                animate={{
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="bg-gradient-to-br from-red-600 via-orange-600 to-yellow-600 text-white w-12 h-12 rounded-xl flex items-center justify-center shadow-2xl shadow-red-500/50"
              >
                <Radio className="h-6 w-6" />
              </motion.div>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 dark:from-red-400 dark:via-orange-400 dark:to-yellow-400">
                Signal vs Noise
              </span>
            </CardTitle>
            
            <div className="pl-15 space-y-2">
              <p className="text-sm font-bold text-red-700 dark:text-red-300">
                80% Signal. 20% Noise. That's the only way forward.
              </p>
              <div className="text-xs text-muted-foreground space-y-1.5 bg-background/40 p-3 rounded-lg border border-red-500/10 backdrop-blur-sm">
                <p className="leading-relaxed">
                  <span className="font-black text-green-600 uppercase">Signal Definition:</span> The 3-5 most important things you <span className="italic">must</span> get done in the next 24 hours.
                </p>
                <p className="leading-relaxed">
                  <span className="font-black text-red-600 uppercase">The Law:</span> First devote time and energy to Signal tasks. Only touch Noise tasks once <span className="underline decoration-red-500/50">ALL</span> Signal tasks are completed.
                </p>
              </div>
            </div>
          </div>

          {theOneThing && (
            <AnimatePresence>
              {theOneThing.completed ? (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="bg-gradient-to-br from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-2xl shadow-green-500/50"
                >
                  <Flame className="h-5 w-5" />
                  <span className="text-sm font-black">NEEDLE MOVED</span>
                </motion.div>
              ) : (
                <motion.div
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                  className="bg-gradient-to-br from-red-500 to-orange-600 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-2xl shadow-red-500/50"
                >
                  <Skull className="h-5 w-5" />
                  <span className="text-sm font-black">DO THE ONE THING</span>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

        {/* Dark Psychology Warning */}
        {isToday && !theOneThing && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-red-100 dark:bg-red-900/30 border-2 border-red-600 rounded-xl flex items-start gap-3"
          >
            <Skull className="h-6 w-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-black text-red-900 dark:text-red-100">
                ⚠️ CRITICAL: You haven't defined THE ONE THING
              </p>
              <p className="text-xs text-red-800 dark:text-red-200 leading-relaxed">
                Without THE ONE THING, you'll spend today busy but accomplish nothing that matters. 
                <span className="font-black"> Every day without THE ONE THING is a day wasted.</span>
              </p>
            </div>
          </motion.div>
        )}

        {/* Signal Completion Rate */}
        {signalTotal > 0 && (
          <div className="mt-4 p-4 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-300 dark:border-orange-700 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-orange-900 dark:text-orange-100">
                Signal Completion Rate
              </span>
              <span className={`text-2xl font-black ${signalRate >= 80 ? 'text-green-600' : signalRate >= 50 ? 'text-orange-600' : 'text-red-600'}`}>
                {signalRate}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${signalRate}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full ${signalRate >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-600' : signalRate >= 50 ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-gradient-to-r from-red-600 to-red-800'}`}
              />
            </div>
            <p className="text-xs text-orange-800 dark:text-orange-200 mt-2">
              {signalCompleted} of {signalTotal} signal tasks completed
            </p>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-6 space-y-6 relative">
        {/* Add Task Section */}
        <div className="space-y-3 p-4 bg-white/50 dark:bg-black/20 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold">Add New Task</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Select value={taskType} onValueChange={(v: any) => setTaskType(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="signal">📡 Signal</SelectItem>
                <SelectItem value="noise">📢 Noise</SelectItem>
              </SelectContent>
            </Select>

            <Select value={taskImportance} onValueChange={(v: any) => setTaskImportance(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {taskType === "signal" ? (
                  <>
                    <SelectItem value="the_one_thing">🔥 THE ONE THING</SelectItem>
                    <SelectItem value="high_signal">⚡ High Importance</SelectItem>
                    <SelectItem value="medium_signal">📈 Medium Importance</SelectItem>
                    <SelectItem value="low_signal">🎯 Low Importance</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="high_noise">⚠️ High Noise</SelectItem>
                    <SelectItem value="low_noise">🔇 Low Noise</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>

            <Input
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
              placeholder="Brain dump your task here..."
              className="col-span-1"
            />
          </div>

          <Button onClick={addTask} className="w-full" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>

        {/* Signal Tasks */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b-2 border-green-500/30">
            <Radio className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-black text-green-700 dark:text-green-300">
              SIGNAL TASKS ({signalTasks.length})
            </h3>
          </div>

          {signalTasks.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground italic bg-muted/20 rounded-xl">
              No signal tasks yet. Add THE ONE THING that moves the needle.
            </div>
          ) : (
            <div className="space-y-2">
              {signalTasks.map((task) => {
                const config = getImportanceConfig(task.importance);
                const Icon = config.icon;
                
                return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      task.completed 
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-500' 
                        : `bg-gradient-to-r ${config.gradient} bg-opacity-10 border-${config.color.split('-')[1]}-500`
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleTask(task.id, "signal")}
                        className="mt-1 flex-shrink-0"
                      >
                        {task.completed ? (
                          <CheckCircle2 className="h-6 w-6 text-green-600" />
                        ) : (
                          <Circle className="h-6 w-6 text-gray-400 hover:text-green-600 transition-colors" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className={`h-4 w-4 ${config.color}`} />
                          <Badge variant="outline" className={`text-xs ${config.color} border-current`}>
                            {config.label}
                          </Badge>
                        </div>
                        <p className={`text-sm font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {task.task}
                        </p>
                      </div>

                      <button
                        onClick={() => removeTask(task.id, "signal")}
                        className="flex-shrink-0 text-red-500 hover:text-red-700 transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Noise Tasks */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b-2 border-gray-500/30">
            <Volume2 className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-black text-gray-700 dark:text-gray-300">
              NOISE TASKS ({noiseTasks.length})
            </h3>
            <span className="text-xs text-muted-foreground italic">
              (Only touch after ALL signal tasks are done)
            </span>
          </div>

          {isNoiseLocked && noiseTasks.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-3 p-3 bg-red-100/50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3"
            >
              <Lock className="h-5 w-5 text-red-500" />
              <p className="text-xs font-bold text-red-700 dark:text-red-300">
                NOISE LOCKED: Complete all Signal tasks first.
              </p>
            </motion.div>
          )}

          {noiseTasks.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground italic bg-muted/20 rounded-xl">
              No noise tasks. Good - focus on signal.
            </div>
          ) : (
            <div className="space-y-2">
              {noiseTasks.map((task) => {
                const config = getImportanceConfig(task.importance);
                const Icon = config.icon;
                
                return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      task.completed 
                        ? 'bg-gray-50 dark:bg-gray-900/20 border-gray-500' 
                        : 'bg-gray-100 dark:bg-gray-800/20 border-gray-300 dark:border-gray-700'
                    } ${isNoiseLocked ? 'opacity-50 grayscale' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleTask(task.id, "noise")}
                        className={`mt-1 flex-shrink-0 ${isNoiseLocked ? 'cursor-not-allowed' : ''}`}
                      >
                        {task.completed ? (
                          <CheckCircle2 className="h-6 w-6 text-gray-600" />
                        ) : (
                          isNoiseLocked ? <Lock className="h-5 w-5 text-red-400" /> : <Circle className="h-6 w-6 text-gray-400 hover:text-gray-600 transition-colors" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className={`h-4 w-4 ${config.color}`} />
                          <Badge variant="outline" className={`text-xs ${config.color} border-current`}>
                            {config.label}
                          </Badge>
                        </div>
                        <p className={`text-sm font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {task.task}
                        </p>
                      </div>

                      <button
                        onClick={() => removeTask(task.id, "noise")}
                        className="flex-shrink-0 text-red-500 hover:text-red-700 transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Save Button */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={handleSave}
            disabled={isSaved}
            className={`w-full h-12 text-base font-black shadow-xl transition-all ${
              isSaved
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 hover:from-red-700 hover:via-orange-700 hover:to-yellow-700 shadow-red-500/50"
            }`}
          >
            {isSaved ? (
              <>
                <CheckCircle2 className="h-5 w-5 mr-2" />
                SAVED
              </>
            ) : (
              <>
                <Target className="h-5 w-5 mr-2" />
                SAVE SIGNAL VS NOISE
              </>
            )}
          </Button>
        </motion.div>

        {/* Psychological Footer */}
        <div className="pt-4 border-t border-red-200 dark:border-red-800">
          <p className="text-xs text-center text-muted-foreground font-medium leading-relaxed">
            <span className="font-black text-red-600 dark:text-red-400">
              "The main thing is to keep the main thing the main thing."
            </span>
            <br />
            Focus on signal. Ignore noise. Move the needle forward.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}