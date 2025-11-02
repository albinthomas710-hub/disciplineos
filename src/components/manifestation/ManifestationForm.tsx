import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { Sparkles, Target, Brain, Zap } from "lucide-react";

interface ManifestationFormProps {
  formData: {
    type: "vision" | "affirmation" | "habit" | "mindset";
    title: string;
    content: string;
    targetDate: string;
    identityStatement: string;
    painLeverage: string;
  };
  onChange: (data: any) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isEditing?: boolean;
}

const manifestationTypes = [
  { value: "vision", label: "Vision Goal", icon: Target, color: "from-purple-500 to-pink-500" },
  { value: "affirmation", label: "Affirmation", icon: Sparkles, color: "from-yellow-500 to-orange-500" },
  { value: "habit", label: "Habit Change", icon: Zap, color: "from-green-500 to-emerald-500" },
  { value: "mindset", label: "Mindset Shift", icon: Brain, color: "from-blue-500 to-cyan-500" },
];

export function ManifestationForm({ formData, onChange, onSubmit, onCancel, isEditing }: ManifestationFormProps) {
  return (
    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}>
      <Card className="border-2 border-purple-200 dark:border-purple-800 shadow-2xl">
        <CardContent className="pt-6 space-y-6">
          {!isEditing && (
            <div>
              <Label className="text-base font-bold">Type</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                {manifestationTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => onChange({ ...formData, type: type.value as any })}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                      formData.type === type.value
                        ? `bg-gradient-to-br ${type.color} text-white border-transparent shadow-xl scale-105`
                        : "border-gray-200 dark:border-gray-700 hover:border-purple-300 hover:scale-105"
                    }`}
                  >
                    <type.icon className="h-6 w-6 mx-auto mb-2" />
                    <p className="text-sm font-bold">{type.label}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* DARK PSYCHOLOGY: Identity Statement - PROMINENT */}
          <div className="p-6 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/40 dark:to-orange-950/40 border-4 border-red-400 dark:border-red-700 rounded-2xl shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center animate-pulse">
                <span className="text-2xl">🔥</span>
              </div>
              <div>
                <Label className="text-red-700 dark:text-red-300 font-black text-lg">WHO YOU MUST BECOME</Label>
                <p className="text-xs text-red-600 dark:text-red-400">Your brain will force your actions to match this identity</p>
              </div>
            </div>
            <Input
              placeholder="I am the person who... (e.g., 'I am someone who never quits')"
              value={formData.identityStatement}
              onChange={(e) => onChange({ ...formData, identityStatement: e.target.value })}
              className="mt-2 border-2 border-red-400 dark:border-red-600 text-base font-semibold h-12"
            />
          </div>

          {/* DARK PSYCHOLOGY: Pain Leverage - PROMINENT */}
          <div className="p-6 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950/40 dark:to-yellow-950/40 border-4 border-orange-400 dark:border-orange-700 rounded-2xl shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-orange-600 flex items-center justify-center animate-pulse">
                <span className="text-2xl">⚡</span>
              </div>
              <div>
                <Label className="text-orange-700 dark:text-orange-300 font-black text-lg">THE COST OF FAILURE</Label>
                <p className="text-xs text-orange-600 dark:text-orange-400">Pain is 10x more motivating than pleasure. Use it.</p>
              </div>
            </div>
            <Textarea
              placeholder="If I don't achieve this, I will... (Be brutally honest about the pain of staying the same)"
              value={formData.painLeverage}
              onChange={(e) => onChange({ ...formData, painLeverage: e.target.value })}
              className="mt-2 border-2 border-orange-400 dark:border-orange-600 text-base font-semibold min-h-[100px]"
            />
          </div>

          <div>
            <Label className="text-base font-bold">Title</Label>
            <Input
              placeholder="What do you want to manifest?"
              value={formData.title}
              onChange={(e) => onChange({ ...formData, title: e.target.value })}
              className="mt-2 h-12 text-base"
            />
          </div>
          
          <div>
            <Label className="text-base font-bold">Description / Affirmation</Label>
            <Textarea
              placeholder="Write in detail... Use present tense (I am, I have, I do)"
              value={formData.content}
              onChange={(e) => onChange({ ...formData, content: e.target.value })}
              className="mt-2 min-h-[150px] text-base"
            />
          </div>
          
          <div>
            <Label className="text-base font-bold">Target Date (Optional)</Label>
            <Input
              type="date"
              value={formData.targetDate}
              onChange={(e) => onChange({ ...formData, targetDate: e.target.value })}
              className="mt-2 h-12"
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button 
              onClick={onSubmit} 
              className="cursor-pointer flex-1 h-14 text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-xl"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              {isEditing ? "Save Changes" : "Create Manifestation"}
            </Button>
            <Button
              variant="outline"
              onClick={onCancel}
              className="cursor-pointer h-14 px-8"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
