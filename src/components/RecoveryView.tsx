import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, Database, Mail, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";

export default function RecoveryView() {
  const anonymousUsers = useQuery((api as any).recovery.listAnonymousUsers);
  const convertToEmail = useMutation((api as any).recovery.convertAnonymousToEmail);
  const [selectedUserId, setSelectedUserId] = useState<Id<"users"> | null>(null);
  const [email, setEmail] = useState("");
  const [isConverting, setIsConverting] = useState(false);

  const handleConvert = async () => {
    if (!selectedUserId || !email) {
      toast.error("Please select an account and enter your email");
      return;
    }

    if (!email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsConverting(true);
    try {
      await convertToEmail({
        anonymousUserId: selectedUserId,
        email: email.trim(),
      });
      toast.success("Account recovered! Please log out and log back in with this email.");
      setEmail("");
      setSelectedUserId(null);
    } catch (error) {
      toast.error("Failed to recover account: " + (error as Error).message);
    } finally {
      setIsConverting(false);
    }
  };

  if (!anonymousUsers) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-yellow-600" />
            <CardTitle className="text-yellow-900 dark:text-yellow-100">
              Account Recovery
            </CardTitle>
          </div>
          <CardDescription className="text-yellow-800 dark:text-yellow-200">
            Your data is safe! Select your account below and convert it to a permanent email-based account.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4">
        <h3 className="text-lg font-semibold">Found {anonymousUsers.length} Anonymous Accounts</h3>
        
        {anonymousUsers.map((account: any, index: number) => {
          const totalItems = 
            account.dataCount.timetables +
            account.dataCount.manifestations +
            account.dataCount.quotes +
            account.dataCount.prayers +
            account.dataCount.projects +
            account.dataCount.vectalTasks +
            account.dataCount.scriptures +
            account.dataCount.holyVideos +
            account.dataCount.videoLibrary +
            account.dataCount.adviceLibrary +
            account.dataCount.notToDoList +
            account.dataCount.selfDiscovery +
            account.dataCount.legendProfiles;

          const createdDate = new Date(account.createdAt).toLocaleString();
          const isSelected = selectedUserId === account.userId;
          const isCurrentUser = account.isCurrentUser;

          return (
            <Card
              key={account.userId}
              className={`cursor-pointer transition-all ${
                isSelected
                  ? "border-primary ring-2 ring-primary"
                  : isCurrentUser
                  ? "border-green-500 ring-2 ring-green-500 bg-green-50 dark:bg-green-950/20"
                  : "hover:border-primary/50"
              }`}
              onClick={() => setSelectedUserId(account.userId as Id<"users">)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Account #{index + 1}
                    {isCurrentUser && (
                      <span className="ml-2 text-xs font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900 px-2 py-1 rounded">
                        YOUR CURRENT ACCOUNT
                      </span>
                    )}
                    {isSelected && (
                      <CheckCircle2 className="inline-block ml-2 h-5 w-5 text-primary" />
                    )}
                  </CardTitle>
                  <span className="text-sm text-muted-foreground">{createdDate}</span>
                </div>
                <CardDescription>
                  Total items: {totalItems} | Streak: {account.currentStreak} days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-blue-500" />
                    <span>{account.dataCount.timetables} Timetables</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-purple-500" />
                    <span>{account.dataCount.manifestations} Manifestations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-amber-500" />
                    <span>{account.dataCount.quotes} Quotes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-pink-500" />
                    <span>{account.dataCount.prayers} Prayers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-cyan-500" />
                    <span>{account.dataCount.projects} Projects</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-green-500" />
                    <span>{account.dataCount.vectalTasks} Vectal Tasks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-indigo-500" />
                    <span>{account.dataCount.scriptures} Scriptures</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-red-500" />
                    <span>{account.dataCount.holyVideos} Holy Videos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-teal-500" />
                    <span>{account.dataCount.videoLibrary} Video Library</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-emerald-500" />
                    <span>{account.dataCount.adviceLibrary} Advice</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-orange-500" />
                    <span>{account.dataCount.notToDoList} Not-To-Do Items</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-violet-500" />
                    <span>{account.dataCount.legendProfiles} Legends</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-sky-500" />
                    <span>{account.dataCount.selfDiscovery > 0 ? "✓" : "✗"} Know Yourself</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedUserId && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Convert to Email Account</CardTitle>
            <CardDescription>
              Enter your email to permanently secure this account. You'll be able to log in with this email from any device.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  disabled={isConverting}
                />
              </div>
              <Button
                onClick={handleConvert}
                disabled={isConverting || !email}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                {isConverting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Converting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Recover Account
                  </>
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              After conversion, log out and log back in using this email to access your recovered data.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}