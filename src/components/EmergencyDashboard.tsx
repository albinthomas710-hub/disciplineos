import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { AlertCircle, Heart, Phone, BookOpen, Users, CheckCircle, Plus, Trash2, Edit2, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface EmergencyDashboardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const temptationStrategies = [
  {
    icon: Heart,
    title: "Deep Breathing",
    description: "Take 10 deep breaths, focusing on each inhale and exhale",
    action: "Start Breathing Exercise",
  },
  {
    icon: Phone,
    title: "Call Someone",
    description: "Reach out to your accountability partner or a trusted friend",
    action: "Open Contacts",
  },
  {
    icon: BookOpen,
    title: "Read Your Goals",
    description: "Review your vision and why you started this journey",
    action: "View Goals",
  },
  {
    icon: Users,
    title: "Community Support",
    description: "Connect with others who understand your struggle",
    action: "Join Community",
  },
];

export default function EmergencyDashboard({
  open,
  onOpenChange,
}: EmergencyDashboardProps) {
  const triggers = useQuery((api as any).emergencyTriggers.getUserTriggers);
  const initializeTriggers = useMutation((api as any).emergencyTriggers.initializeDefaultTriggers);
  const addTrigger = useMutation((api as any).emergencyTriggers.addTrigger);
  const deleteTrigger = useMutation((api as any).emergencyTriggers.deleteTrigger);
  
  const [selectedTrigger, setSelectedTrigger] = useState<Id<"emergencyTriggers"> | null>(null);
  const [isAddingTrigger, setIsAddingTrigger] = useState(false);
  const [newTrigger, setNewTrigger] = useState({
    title: "",
    description: "",
    color: "from-blue-500 to-cyan-500",
    isCritical: false,
  });

  // Password protection state
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(false);

  const EMERGENCY_PASSWORD = "2450";

  // Reset unlock state when modal closes
  useEffect(() => {
    if (!open) {
      setIsUnlocked(false);
      setPasswordInput("");
      setPasswordError(false);
    }
  }, [open]);

  useEffect(() => {
    if (triggers !== undefined && triggers.length === 0) {
      initializeTriggers();
    }
  }, [triggers, initializeTriggers]);

  const handlePasswordSubmit = () => {
    if (passwordInput === EMERGENCY_PASSWORD) {
      setIsUnlocked(true);
      setPasswordError(false);
      setPasswordInput("");
    } else {
      setPasswordError(true);
      toast.error("Incorrect password");
    }
  };

  const handleAddTrigger = async () => {
    if (!newTrigger.title.trim() || !newTrigger.description.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await addTrigger(newTrigger);
      setNewTrigger({
        title: "",
        description: "",
        color: "from-blue-500 to-cyan-500",
        isCritical: false,
      });
      setIsAddingTrigger(false);
      toast.success("Trigger added successfully");
    } catch (error) {
      toast.error("Failed to add trigger");
    }
  };

  const handleDeleteTrigger = async (triggerId: Id<"emergencyTriggers">) => {
    try {
      await deleteTrigger({ triggerId });
      toast.success("Trigger deleted");
    } catch (error) {
      toast.error("Failed to delete trigger");
    }
  };

  const handleStrategyClick = (strategy: string) => {
    toast.success(`${strategy} activated - Stay strong! 💪`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {!isUnlocked ? (
          // Password Lock Screen
          <div className="flex flex-col items-center justify-center py-12 px-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="w-24 h-24 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center mb-6"
            >
              <AlertCircle className="h-12 w-12 text-white" />
            </motion.div>
            <h2 className="text-3xl font-bold text-center mb-3">
              Protected Emergency Support
            </h2>
            <p className="text-gray-300 text-center mb-8 max-w-md">
              This feature is password-protected. Enter your password to access emergency support.
            </p>
            <div className="w-full max-w-sm space-y-4">
              <div>
                <Label className="text-white mb-2 block">Password</Label>
                <Input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setPasswordError(false);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handlePasswordSubmit()}
                  placeholder="Enter password"
                  className={`bg-gray-800 border-gray-700 text-white text-center text-lg tracking-widest ${
                    passwordError ? "border-red-500" : ""
                  }`}
                  autoFocus
                />
                {passwordError && (
                  <p className="text-red-400 text-sm mt-2 text-center">
                    Incorrect password. Please try again.
                  </p>
                )}
              </div>
              <Button
                onClick={handlePasswordSubmit}
                className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white cursor-pointer"
                size="lg"
              >
                Unlock Emergency Support
              </Button>
            </div>
          </div>
        ) : (
          // Original Emergency Dashboard Content
          <>
            <DialogHeader>
              <div className="flex items-center justify-center mb-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.5 }}
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center"
                >
                  <AlertCircle className="h-10 w-10 text-white" />
                </motion.div>
              </div>
              <DialogTitle className="text-3xl font-bold text-center">
                You're Not Alone
              </DialogTitle>
              <DialogDescription className="text-center text-gray-300 text-lg">
                You took the right step. Now choose a strategy to help you through this moment.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* PIN Entry - keep existing */}
              
              {/* Your Personal Triggers Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    Your Personal Triggers
                  </h3>
                  <Button
                    onClick={() => setIsAddingTrigger(true)}
                    size="sm"
                    className="cursor-pointer bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Trigger
                  </Button>
                </div>
                
                {isAddingTrigger && (
                  <Card className="border-2 border-orange-300 dark:border-orange-700 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950">
                    <CardContent className="p-4 space-y-3">
                      <div>
                        <Label>Trigger Title</Label>
                        <Input
                          placeholder="e.g., YouTube Shorts After Learning"
                          value={newTrigger.title}
                          onChange={(e) => setNewTrigger({ ...newTrigger, title: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Input
                          placeholder="What triggers this temptation?"
                          value={newTrigger.description}
                          onChange={(e) => setNewTrigger({ ...newTrigger, description: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Color Theme</Label>
                        <select
                          value={newTrigger.color}
                          onChange={(e) => setNewTrigger({ ...newTrigger, color: e.target.value })}
                          className="w-full mt-1 p-2 border rounded-md bg-background"
                        >
                          <option value="from-blue-500 to-cyan-500">Blue</option>
                          <option value="from-red-500 to-orange-500">Red</option>
                          <option value="from-purple-500 to-pink-500">Purple</option>
                          <option value="from-green-500 to-emerald-500">Green</option>
                          <option value="from-yellow-500 to-orange-500">Yellow</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="critical"
                          checked={newTrigger.isCritical}
                          onChange={(e) => setNewTrigger({ ...newTrigger, isCritical: e.target.checked })}
                          className="cursor-pointer"
                        />
                        <Label htmlFor="critical" className="cursor-pointer">Mark as Critical</Label>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleAddTrigger}
                          className="cursor-pointer flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                        >
                          Add Trigger
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsAddingTrigger(false);
                            setNewTrigger({
                              title: "",
                              description: "",
                              color: "from-blue-500 to-cyan-500",
                              isCritical: false,
                            });
                          }}
                          className="cursor-pointer"
                        >
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {triggers && triggers.length > 0 ? (
                  <div className="grid gap-3">
                    {triggers.map((trigger: any) => (
                      <motion.div
                        key={trigger._id}
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Card
                          className={`border-2 bg-gradient-to-br ${trigger.color} shadow-lg hover:shadow-xl transition-all`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold flex items-center gap-2 text-white drop-shadow-md">
                                  {trigger.title}
                                  {trigger.isCritical && (
                                    <Badge variant="destructive" className="text-xs">
                                      CRITICAL
                                    </Badge>
                                  )}
                                </h4>
                                <p className="text-sm text-white/90 mt-1 drop-shadow">
                                  {trigger.description}
                                </p>
                              </div>
                              <div className="flex gap-1 ml-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteTrigger(trigger._id)}
                                  className="cursor-pointer h-8 w-8 p-0 hover:bg-white/20 text-white"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <Card className="border-2 border-dashed">
                    <CardContent className="p-6 text-center">
                      <p className="text-muted-foreground">
                        No triggers configured yet. Click "Add Trigger" to create your first one.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Emergency Support Strategies */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Immediate Support Strategies</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {temptationStrategies.map((strategy, index) => (
                    <motion.div
                      key={index}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleStrategyClick(strategy.title)}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-2 rounded-lg">
                              <strategy.icon className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold mb-1">{strategy.title}</h4>
                              <p className="text-sm text-muted-foreground mb-3">
                                {strategy.description}
                              </p>
                              <Button size="sm" className="w-full cursor-pointer">
                                {strategy.action}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}