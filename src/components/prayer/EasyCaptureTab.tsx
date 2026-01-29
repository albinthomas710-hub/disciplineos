import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, ArrowRight, Trash2, Sparkles, Zap, Check } from "lucide-react";
import { toast } from "sonner";
import { Id, Doc } from "@/convex/_generated/dataModel";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export function EasyCaptureTab() {
  const inboxItems = useQuery(api.sins.getInbox);
  const createSin = useMutation(api.sins.create);
  const updateStatus = useMutation(api.sins.updateStatus);
  const removeSin = useMutation(api.sins.remove);
  const togglePrayedFor = useMutation(api.sins.togglePrayedFor);
  
  const [newItem, setNewItem] = useState("");

  const handleAdd = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newItem.trim()) return;
    try {
      await createSin({
        title: newItem,
        status: "inbox"
      });
      setNewItem("");
      toast.success("Captured to inbox");
    } catch (e) {
      toast.error("Failed to capture");
    }
  };

  const handleTogglePrayed = async (sinId: Id<"sinList">, currentStatus?: boolean) => {
    try {
      await togglePrayedFor({ sinId });
      if (!currentStatus) {
        toast.success("Prayed for this item");
      }
    } catch (e) {
      toast.error("Failed to update");
    }
  };

  const handlePromote = async (sinId: Id<"sinList">) => {
    try {
      await updateStatus({ sinId, status: "active" });
      toast.success("Moved to Active Battles");
    } catch (e) {
      toast.error("Failed to move");
    }
  };

  const handleDelete = async (sinId: Id<"sinList">) => {
    try {
      await removeSin({ sinId });
      toast.success("Removed");
    } catch (e) {
      toast.error("Failed to remove");
    }
  };

  return (
    <div className="space-y-4 mt-4">
      <Card className="border-dashed border-2">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Zap className="h-5 w-5 text-yellow-500" />
            Easy Capture
          </CardTitle>
          <CardDescription>
            Quickly capture thoughts or struggles to process later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="flex gap-2">
            <Input 
              placeholder="Type and hit enter..." 
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {inboxItems === undefined ? (
          <div className="text-center py-4 text-muted-foreground">Loading...</div>
        ) : inboxItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground bg-accent/20 rounded-lg">
            Inbox is empty. Capture something above.
          </div>
        ) : (
          <div className="grid gap-2">
            {inboxItems.map((item) => (
              <div 
                key={item._id} 
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border transition-colors group",
                  item.isPrayedFor 
                    ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900" 
                    : "bg-card hover:bg-accent/50"
                )}
              >
                <div className="flex items-center gap-3 flex-1">
                  <Button
                    size="icon"
                    variant={item.isPrayedFor ? "default" : "outline"}
                    className={cn(
                      "h-8 w-8 shrink-0 rounded-full transition-all",
                      item.isPrayedFor 
                        ? "bg-green-500 hover:bg-green-600 text-white border-green-600" 
                        : "text-muted-foreground hover:text-green-600 hover:border-green-600"
                    )}
                    onClick={() => handleTogglePrayed(item._id, item.isPrayedFor)}
                    title={item.isPrayedFor ? "Prayed for" : "Mark as prayed for"}
                  >
                    <Check className={cn("h-4 w-4", item.isPrayedFor ? "opacity-100" : "opacity-0 hover:opacity-50")} />
                  </Button>
                  <span className={cn(
                    "font-medium transition-all",
                    item.isPrayedFor && "text-green-700 dark:text-green-300 line-through decoration-green-500/50"
                  )}>
                    {item.title}
                  </span>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(item._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    className="h-8 text-xs"
                    onClick={() => handlePromote(item._id)}
                  >
                    Process
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}