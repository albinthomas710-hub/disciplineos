import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Download, FileJson, Loader2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface DataBackupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DataBackupDialog({ open, onOpenChange }: DataBackupDialogProps) {
  const [isExporting, setIsExporting] = useState(false);
  // We don't fetch automatically to save bandwidth, we fetch when they click export
  // But useQuery is reactive. We can use a skip logic or just fetch it.
  // For a large export, it's better to fetch on demand. 
  // However, Convex useQuery is the easiest way to get data.
  // We'll use a state to trigger the query or just fetch it.
  // Actually, for a one-time download, we can just use the query and show a loading state.
  
  const userData = useQuery(api.backup.getAllUserData);

  const handleDownload = () => {
    if (!userData) {
      toast.error("Data is still loading...");
      return;
    }

    setIsExporting(true);
    try {
      const dataStr = JSON.stringify(userData, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = url;
      link.download = `discipline_os_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success("Backup downloaded successfully! 🔒");
      onOpenChange(false);
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to generate backup file");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <ShieldCheck className="h-6 w-6 text-green-600" />
            Data Backup & Export
          </DialogTitle>
          <DialogDescription className="pt-2">
            Your data belongs to you. Download a complete backup of your entire DisciplineOS workspace, including all timetables, notes, projects, and logs.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-6 space-y-4">
          <div className="h-24 w-24 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center">
            <FileJson className="h-12 w-12 text-green-600 dark:text-green-400" />
          </div>
          
          <div className="text-center space-y-1">
            <p className="font-medium">discipline_os_backup.json</p>
            <p className="text-sm text-muted-foreground">
              {userData ? "Ready to download" : "Preparing your data..."}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleDownload} 
            disabled={!userData || isExporting}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Download Backup
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
