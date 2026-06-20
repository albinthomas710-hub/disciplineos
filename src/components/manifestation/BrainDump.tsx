import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import { Lightbulb, Plus, Trash2, CheckCircle2, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function BrainDump() {
  const ideas = useQuery((api as any).affirmationIdeas.getIncompleteIdeas);
  const createIdea = useMutation((api as any).affirmationIdeas.createIdea);
  const deleteIdea = useMutation((api as any).affirmationIdeas.deleteIdea);
  const markCompleted = useMutation((api as any).affirmationIdeas.markIdeaCompleted);

  const [newIdea, setNewIdea] = useState("");

  const handleAddIdea = async () => {
    if (!newIdea.trim()) {
      toast.error("Please enter an idea");
      return;
    }

    try {
      await createIdea({ content: newIdea.trim() });
      setNewIdea("");
      toast.success("Idea saved! 💡");
    } catch (error) {
      toast.error("Failed to save idea");
    }
  };

  const handleDelete = async (ideaId: string) => {
    try {
      await deleteIdea({ ideaId: ideaId as any });
      toast.success("Idea deleted");
    } catch (error) {
      toast.error("Failed to delete idea");
    }
  };

  const handleMarkCompleted = async (ideaId: string) => {
    try {
      await markCompleted({ ideaId: ideaId as any });
      toast.success("Idea marked as completed! ✅");
    } catch (error) {
      toast.error("Failed to mark as completed");
    }
  };

  return (
    <Card className="border-2 border-yellow-200 dark:border-yellow-800 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950 dark:to-amber-950">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-600" />
          <span>Brain Dump - Quick Ideas</span>
          <Badge variant="outline" className="ml-auto">
            {ideas?.length || 0} ideas
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Capture affirmation ideas quickly. Mark as complete when you've turned them into full affirmations.
        </p>

        {/* Add Idea */}
        <div className="flex gap-2">
          <Input
            placeholder="Quick affirmation idea..."
            value={newIdea}
            onChange={(e) => setNewIdea(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddIdea()}
            className="flex-1"
          />
          <Button onClick={handleAddIdea} size="sm" className="cursor-pointer">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Ideas List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {ideas?.map((idea: any, index: number) => (
            <motion.div
              key={idea._id}
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-start gap-2 p-3 bg-white dark:bg-gray-900 rounded-lg border border-yellow-200 dark:border-yellow-800"
            >
              <Sparkles className="h-4 w-4 text-yellow-600 mt-1 shrink-0" />
              <p className="text-sm flex-1">{idea.content}</p>
              <div className="flex gap-1 shrink-0">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleMarkCompleted(idea._id)}
                  className="cursor-pointer h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
                  title="Mark as completed"
                >
                  <CheckCircle2 className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(idea._id)}
                  className="cursor-pointer h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ))}

          {ideas?.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Lightbulb className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No ideas yet. Start capturing your thoughts!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
