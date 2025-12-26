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
import { Download, FileJson, Loader2, ShieldCheck, Upload, AlertTriangle, Copy, Check, Eye, Filter, Sparkles } from "lucide-react";
import { useState, useRef, useMemo } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface DataBackupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DataBackupDialog({ open, onOpenChange }: DataBackupDialogProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [previewCategory, setPreviewCategory] = useState<string>("all");
  const [isCleanMode, setIsCleanMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const userData = useQuery(api.backup.getAllUserData);
  const generateBackup = useAction(api.backup.generateBackupAction);
  const restoreData = useMutation(api.backup.restoreUserData);

  // Helper to clean data for export/preview
  const cleanData = (data: any): any => {
    if (Array.isArray(data)) {
      return data.map(item => cleanData(item));
    }
    if (data && typeof data === 'object') {
      const cleaned: any = {};
      for (const key in data) {
        // Remove system fields, userId, and foreign keys (ending in Id)
        // Also remove timestamps if they are numbers (likely system timestamps)
        if (
          key.startsWith('_') || 
          key === 'userId' || 
          key.endsWith('Id') ||
          key === 'createdAt' ||
          key === 'updatedAt'
        ) {
          continue;
        }
        cleaned[key] = cleanData(data[key]);
      }
      return cleaned;
    }
    return data;
  };

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
      // If viewing a specific category OR if clean mode is on, use the preview data
      if (previewCategory !== "all" || isCleanMode) {
        const dataToCopy = getPreviewData;
        await navigator.clipboard.writeText(JSON.stringify(dataToCopy, null, 2));
        toast.success(`Copied ${isCleanMode ? 'cleaned' : ''} ${previewCategory === 'all' ? 'data' : previewCategory} to clipboard!`);
        setIsCopying(false);
        return;
      }

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

  const handleDownloadPreview = () => {
    try {
      const dataToDownload = getPreviewData;
      if (!dataToDownload) return;

      const blob = new Blob([JSON.stringify(dataToDownload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      
      const timestamp = new Date().toISOString().split('T')[0];
      const categoryName = previewCategory === 'all' ? 'full_backup' : previewCategory;
      const cleanSuffix = isCleanMode ? '_cleaned' : '';
      
      link.href = url;
      link.download = `discipline_os_${categoryName}${cleanSuffix}_${timestamp}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Downloaded ${isCleanMode ? 'cleaned' : ''} ${previewCategory === 'all' ? 'data' : previewCategory} JSON!`);
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download preview data");
    }
  };

  const getPreviewData = useMemo(() => {
    if (!userData?.data) return null;
    
    let data;
    if (previewCategory === "all") {
      data = userData;
    } else {
      // Return just the selected category data
      data = (userData.data as any)[previewCategory] || { message: "No data found for this category" };
    }

    if (isCleanMode) {
      return cleanData(data);
    }
    return data;
  }, [userData, previewCategory, isCleanMode]);

  const categories = [
    { value: "all", label: "All Data (Complete Backup)" },
    { value: "projects", label: "Projects" },
    { value: "notes", label: "Notes" },
    { value: "adviceLibrary", label: "Advice Library" },
    { value: "quotes", label: "Quotes" },
    { value: "timetables", label: "Timetables" },
    { value: "manifestations", label: "Manifestations" },
    { value: "problems", label: "Problem Vault" },
    { value: "solutions", label: "Solutions" },
    { value: "failureWisdom", label: "Mistake Vault" },
    { value: "prayers", label: "Prayers" },
    { value: "videoLibrary", label: "Video Library" },
    { value: "vectal", label: "Vectal Tasks" },
  ];

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
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <ShieldCheck className="h-6 w-6 text-green-600" />
            Data Backup & Restore
          </DialogTitle>
          <DialogDescription className="pt-2">
            Manage your data sovereignty. Export a full backup, preview your raw data, or restore from a file.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="export" className="w-full flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="export">Export Data</TabsTrigger>
            <TabsTrigger value="preview">Preview Data</TabsTrigger>
            <TabsTrigger value="import">Import Data</TabsTrigger>
          </TabsList>
          
          <TabsContent value="export" className="space-y-4 py-4 overflow-y-auto">
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

          <TabsContent value="preview" className="flex-1 flex flex-col overflow-hidden space-y-4 py-4">
            <div className="flex flex-col gap-4 px-1">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-1">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={previewCategory} onValueChange={setPreviewCategory}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleCopyToClipboard}
                  disabled={!userData}
                >
                  <Copy className="h-3 w-3 mr-2" />
                  Copy {previewCategory === 'all' ? 'All' : 'Section'}
                </Button>

                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleDownloadPreview}
                  disabled={!userData}
                >
                  <Download className="h-3 w-3 mr-2" />
                  Download JSON
                </Button>
              </div>

              <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-900 p-2 rounded-md border">
                <Switch 
                  id="clean-mode" 
                  checked={isCleanMode}
                  onCheckedChange={setIsCleanMode}
                />
                <Label htmlFor="clean-mode" className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  Clean Data Mode
                  <span className="text-xs font-normal text-muted-foreground hidden sm:inline">
                    (Removes IDs & system fields for easy sharing)
                  </span>
                </Label>
              </div>
            </div>

            <div className="flex-1 border rounded-md bg-slate-950 text-slate-50 overflow-hidden relative">
              <div className="absolute top-2 right-2 text-xs text-slate-500 font-mono">
                {previewCategory === 'all' ? 'full_backup.json' : `${previewCategory}.json`}
                {isCleanMode && ' (Cleaned)'}
              </div>
              <ScrollArea className="h-full w-full p-4">
                {userData ? (
                  <pre className="text-xs font-mono whitespace-pre-wrap break-all">
                    {JSON.stringify(getPreviewData, null, 2)}
                  </pre>
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-500">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    Loading data...
                  </div>
                )}
              </ScrollArea>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              This is a live preview of your data. You can copy specific sections or download the full backup.
            </p>
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