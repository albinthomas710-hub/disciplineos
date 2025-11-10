import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { motion } from "framer-motion";
import { Shield, Plus, Trash2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface TriggerInput {
  id: string;
  title: string;
  description: string;
  color: string;
  isCritical: boolean;
}

interface DopamineShieldOnboardingProps {
  onComplete: () => void;
}

export default function DopamineShieldOnboarding({ onComplete }: DopamineShieldOnboardingProps) {
  const addTrigger = useMutation((api as any).emergencyTriggers.addTrigger);
  const completeOnboarding = useMutation((api as any).users.completeShieldOnboarding);
  
  const [step, setStep] = useState(1);
  const [triggers, setTriggers] = useState<TriggerInput[]>([
    {
      id: "1",
      title: "",
      description: "",
      color: "from-red-500 to-orange-500",
      isCritical: false,
    },
  ]);

  const colorOptions = [
    { value: "from-red-500 to-orange-500", label: "Red-Orange" },
    { value: "from-purple-500 to-pink-500", label: "Purple-Pink" },
    { value: "from-blue-500 to-cyan-500", label: "Blue-Cyan" },
    { value: "from-green-500 to-emerald-500", label: "Green-Emerald" },
    { value: "from-yellow-500 to-orange-500", label: "Yellow-Orange" },
    { value: "from-gray-500 to-slate-500", label: "Gray-Slate" },
  ];

  const addNewTrigger = () => {
    setTriggers([
      ...triggers,
      {
        id: Date.now().toString(),
        title: "",
        description: "",
        color: "from-blue-500 to-cyan-500",
        isCritical: false,
      },
    ]);
  };

  const removeTrigger = (id: string) => {
    if (triggers.length > 1) {
      setTriggers(triggers.filter((t) => t.id !== id));
    }
  };

  const updateTrigger = (id: string, field: keyof TriggerInput, value: any) => {
    setTriggers(
      triggers.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  };

  const handleComplete = async () => {
    // Validate triggers
    const validTriggers = triggers.filter(
      (t) => t.title.trim() && t.description.trim()
    );

    if (validTriggers.length === 0) {
      toast.error("Please add at least one trigger");
      return;
    }

    const toastId = toast.loading("Setting up your Dopamine Shield...");
    try {
      // Add all triggers
      for (const trigger of validTriggers) {
        await addTrigger({
          title: trigger.title.trim(),
          description: trigger.description.trim(),
          color: trigger.color,
          isCritical: trigger.isCritical,
        });
      }

      // Mark onboarding as complete
      await completeOnboarding();

      toast.success("Dopamine Shield configured! 🛡️", { id: toastId });
      onComplete();
    } catch (error) {
      toast.error("Failed to setup shield", { id: toastId });
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <Card className="border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-purple-600 to-indigo-600 p-3 rounded-xl">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Welcome to Dopamine Shield</h2>
                <p className="text-sm text-muted-foreground font-normal">
                  Let's customize it for your specific challenges
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-blue-600" />
                    What is Dopamine Shield?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Dopamine Shield helps you combat your specific temptations and distractions. 
                    It provides emergency support, converts fantasies into action plans, and helps 
                    you reclaim wasted time.
                  </p>
                </div>

                <div className="p-4 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <h3 className="font-semibold mb-2">📝 Your Task:</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Define your personal triggers - the situations where you're most likely to get distracted or tempted.
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Social media scrolling after studying?</li>
                    <li>• Gaming when you should be working?</li>
                    <li>• Daydreaming instead of executing?</li>
                    <li>• Binge-watching shows?</li>
                  </ul>
                </div>

                <Button
                  onClick={() => setStep(2)}
                  className="w-full cursor-pointer bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                  size="lg"
                >
                  Let's Customize My Shield
                </Button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
                  <p className="text-sm font-medium">
                    💡 Add your personal temptation triggers below. Be specific about what triggers you and what happens.
                  </p>
                </div>

                {triggers.map((trigger, index) => (
                  <Card key={trigger.id} className="border-2">
                    <CardContent className="pt-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">Trigger #{index + 1}</h4>
                        {triggers.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTrigger(trigger.id)}
                            className="cursor-pointer text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div>
                        <Label>Trigger Name</Label>
                        <Input
                          placeholder="e.g., Instagram Reels After Study"
                          value={trigger.title}
                          onChange={(e) =>
                            updateTrigger(trigger.id, "title", e.target.value)
                          }
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label>What Happens? (Be Specific)</Label>
                        <Textarea
                          placeholder="e.g., After finishing homework → open Instagram → watch reels for 2 hours → feel guilty"
                          value={trigger.description}
                          onChange={(e) =>
                            updateTrigger(trigger.id, "description", e.target.value)
                          }
                          className="mt-1 min-h-[100px]"
                        />
                      </div>

                      <div>
                        <Label>Color Theme</Label>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          {colorOptions.map((color) => (
                            <button
                              key={color.value}
                              onClick={() =>
                                updateTrigger(trigger.id, "color", color.value)
                              }
                              className={`p-3 rounded-lg border-2 transition-all ${
                                trigger.color === color.value
                                  ? "border-purple-500 scale-105"
                                  : "border-gray-200 dark:border-gray-700"
                              }`}
                            >
                              <div
                                className={`h-6 w-full rounded bg-gradient-to-r ${color.value}`}
                              />
                              <p className="text-xs mt-1">{color.label}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`critical-${trigger.id}`}
                          checked={trigger.isCritical}
                          onChange={(e) =>
                            updateTrigger(trigger.id, "isCritical", e.target.checked)
                          }
                          className="cursor-pointer"
                        />
                        <Label htmlFor={`critical-${trigger.id}`} className="cursor-pointer">
                          Mark as Critical (High Priority)
                        </Label>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <Button
                  onClick={addNewTrigger}
                  variant="outline"
                  className="w-full cursor-pointer"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Trigger
                </Button>

                <div className="flex gap-2">
                  <Button
                    onClick={() => setStep(1)}
                    variant="outline"
                    className="cursor-pointer"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleComplete}
                    className="flex-1 cursor-pointer bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                    size="lg"
                  >
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    Complete Setup
                  </Button>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
