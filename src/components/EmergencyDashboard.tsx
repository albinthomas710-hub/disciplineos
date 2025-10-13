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
import { motion } from "framer-motion";
import { AlertCircle, Heart, Phone, BookOpen, Users, CheckCircle, Plus, Trash2, Edit2 } from "lucide-react";
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
  const userTriggers = useQuery(api.emergencyTriggers.getUserTriggers);
  const initializeTriggers = useMutation(api.emergencyTriggers.initializeDefaultTriggers);
  const addTrigger = useMutation(api.emergencyTriggers.addTrigger);
  const deleteTrigger = useMutation(api.emergencyTriggers.deleteTrigger);
  
  const [selectedTrigger, setSelectedTrigger] = useState<Id<"emergencyTriggers"> | null>(null);
  const [isAddingTrigger, setIsAddingTrigger] = useState(false);
  const [newTrigger, setNewTrigger] = useState({
    title: "",
    description: "",
    color: "from-blue-500 to-cyan-500",
    isCritical: false,
  });

  useEffect(() => {
    if (userTriggers !== undefined && userTriggers.length === 0) {
      initializeTriggers();
    }
  }, [userTriggers, initializeTriggers]);

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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-900 to-black text-white border-red-500/30">
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

        {/* Your Specific Triggers - MOVED TO TOP */}
        <div className="my-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-center">
                Your Temptation Triggers
              </h3>
              <p className="text-sm text-gray-400 text-center">
                Identify which trigger you're facing right now
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => setIsAddingTrigger(!isAddingTrigger)}
              className="bg-cyan-600 hover:bg-cyan-700 cursor-pointer"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Trigger
            </Button>
          </div>

          {/* Add Trigger Form */}
          {isAddingTrigger && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="mb-4 p-4 rounded-lg bg-gray-800/50 border border-gray-700 space-y-3"
            >
              <div>
                <Label className="text-white">Trigger Title</Label>
                <Input
                  value={newTrigger.title}
                  onChange={(e) => setNewTrigger({ ...newTrigger, title: e.target.value })}
                  placeholder="e.g., Social Media Scrolling"
                  className="mt-1 bg-gray-900 border-gray-700 text-white"
                />
              </div>
              <div>
                <Label className="text-white">Description</Label>
                <Input
                  value={newTrigger.description}
                  onChange={(e) => setNewTrigger({ ...newTrigger, description: e.target.value })}
                  placeholder="Describe the trigger pattern..."
                  className="mt-1 bg-gray-900 border-gray-700 text-white"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddTrigger} className="cursor-pointer flex-1">
                  Add Trigger
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsAddingTrigger(false)}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}

          <div className="space-y-3">
            {userTriggers?.map((trigger, i) => (
              <motion.div
                key={trigger._id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setSelectedTrigger(trigger._id)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedTrigger === trigger._id
                    ? "border-cyan-500 bg-cyan-500/10"
                    : trigger.isCritical
                    ? "border-red-500/50 bg-red-500/5 hover:border-red-500"
                    : "border-gray-700 bg-gray-800/30 hover:border-gray-600"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg bg-gradient-to-br ${trigger.color} flex items-center justify-center shrink-0`}
                  >
                    <span className="text-white font-bold">{i + 1}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-white">
                        {trigger.title}
                      </h4>
                      {trigger.isCritical && (
                        <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                          CRITICAL
                        </span>
                      )}
                      {selectedTrigger === trigger._id && (
                        <CheckCircle className="h-5 w-5 text-cyan-500 ml-auto" />
                      )}
                    </div>
                    <p className="text-sm text-gray-400">
                      {trigger.description}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTrigger(trigger._id);
                    }}
                    className="cursor-pointer text-red-400 hover:text-red-300 hover:bg-red-950"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Support Strategies Grid - MOVED TO BOTTOM */}
        <div className="grid md:grid-cols-2 gap-4 mt-8">
          {temptationStrategies.map((strategy, i) => (
            <motion.div
              key={i}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="bg-gray-800/50 border-gray-700 hover:border-cyan-500/50 transition-all cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <strategy.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white mb-2">
                        {strategy.title}
                      </h4>
                      <p className="text-sm text-gray-400 mb-3">
                        {strategy.description}
                      </p>
                      <Button
                        size="sm"
                        onClick={() => handleStrategyClick(strategy.action)}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white cursor-pointer"
                      >
                        {strategy.action}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Encouragement Footer */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 p-6 rounded-lg bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border border-cyan-500/30"
        >
          <p className="text-center text-gray-300 italic">
            "No temptation has overtaken you except what is common to mankind. Stay strong - you've got this."
          </p>
        </motion.div>

        {/* Stay Strong Button */}
        <div className="flex justify-center mt-6">
          <Button
            size="lg"
            onClick={() => {
              toast.success("Stay strong! You've got this. 💪");
              onOpenChange(false);
            }}
            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-8 py-6 text-lg cursor-pointer"
          >
            <CheckCircle className="h-5 w-5 mr-2" />
            Stay strong! You've got this.
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
