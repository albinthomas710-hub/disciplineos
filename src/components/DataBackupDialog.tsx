import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery, useAction } from "convex/react";
import { Download, FileJson, Loader2, ShieldCheck, Upload, AlertTriangle, Copy, Check } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface DataBackupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DataBackupDialog({ open, onOpenChange }: DataBackupDialogProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const userData = useQuery(api.backup.getAllUserData);
  const generateBackup = useAction(api.backup.generateBackupAction);
  const restoreData = useMutation(api.backup.restoreUserData);

  const handleDownload = async () => {
    setIsExporting(true);
    try {
      // Generate backup on server to avoid browser "virus" false positives with blobs
      const url = await generateBackup();
      if (!url) throw new Error("Failed to generate backup URL");
      
      // Trigger download from the secure URL
      const link = document.createElement("a");
      link.href = url;
      link.download = `discipline_os_backup_${new Date().toISOString().split('T')[0]}.json`;
      // Target _blank to ensure it opens/downloads correctly from cross-origin
      link.target = "_blank"; 
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Backup generated and downloading! 🔒");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to generate backup file");
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyToClipboard = async () => {
    setIsCopying(true);
    try {
      const url = await generateBackup();
      if (!url) throw new Error("Failed to generate backup URL");
      
      const response = await fetch(url);
      const text = await response.text();
      
      await navigator.clipboard.writeText(text);
      toast.success("Data copied to clipboard! Paste it into a text file to save.");
    } catch (error) {
      console.error("Copy failed:", error);
      toast.error("Failed to copy data. Try downloading instead.");
    } finally {
      setIsCopying(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        
        // Basic validation
        if (!json.metadata || !json.data) {
          throw new Error("Invalid backup file format");
        }

        const promise = restoreData({ data: json });
        
        toast.promise(promise, {
          loading: 'Restoring your data... This may take a moment.',
          success: (data) => {
            setIsImporting(false);
            onOpenChange(false);
            // Reload page to reflect changes
            setTimeout(() => window.location.reload(), 1500);
            return `Successfully restored ${data.count} items!`;
          },
          error: (err) => {
            setIsImporting(false);
            return `Restore failed: ${err.message}`;
          }
        });

      } catch (error) {
        console.error("Import failed:", error);
        toast.error("Failed to parse backup file. Is it a valid JSON?");
        setIsImporting(false);
      }
    };

    reader.readAsText(file);
    // Reset input
    event.target.value = '';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <ShieldCheck className="h-6 w-6 text-green-600" />
            Data Backup & Restore
          </DialogTitle>
          <DialogDescription className="pt-2">
            Manage your data sovereignty. Export a full backup or restore from a previous backup file.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="export" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="export">Export Data</TabsTrigger>
            <TabsTrigger value="import">Import Data</TabsTrigger>
          </TabsList>
          
          <TabsContent value="export" className="space-y-4 py-4">
            <div className="flex flex-col items-center justify-center py-4 space-y-4">
              <div className="h-20 w-20 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <Download className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
              
              <div className="text-center space-y-1">
                <p className="font-medium">Download Full Backup</p>
                <p className="text-sm text-muted-foreground px-4">
                  Save all your timetables, notes, projects, and logs to a secure JSON file.
                </p>
              </div>
            </div>

            <Alert className="bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
              <ShieldCheck className="h-4 w-4 text-blue-600" />
              <AlertTitle>False Positive Warning</AlertTitle>
              <AlertDescription className="text-xs text-muted-foreground">
                If your browser flags the download as "suspicious", it is a false positive because the file is generated on the fly. It is safe to keep/allow the file.
              </AlertDescription>
            </Alert>

            <div className="flex flex-col gap-2">
              <Button 
                onClick={handleDownload} 
                disabled={!userData || isExporting}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Download Backup ({userData ? "Ready" : "Loading..."})
                  </>
                )}
              </Button>

              <Button 
                onClick={handleCopyToClipboard} 
                disabled={!userData || isCopying}
                variant="outline"
                className="w-full"
              >
                {isCopying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Copying...
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Data to Clipboard (Fallback)
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="import" className="space-y-4 py-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                Restoring data will add to your existing data. It does not delete current data, which may result in duplicates if you restore the same file twice.
              </AlertDescription>
            </Alert>

            <div className="flex flex-col items-center justify-center py-4 space-y-4">
              <div className="h-20 w-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <Upload className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              </div>
              
              <div className="text-center space-y-1">
                <p className="font-medium">Restore from Backup</p>
                <p className="text-sm text-muted-foreground px-4">
                  Upload a previously exported .json file to restore your data.
                </p>
              </div>
            </div>

            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />

            <Button 
              onClick={handleImportClick} 
              disabled={isImporting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isImporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Restoring...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Select Backup File
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}