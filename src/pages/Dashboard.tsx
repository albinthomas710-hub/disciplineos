import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Flame,
  Loader2,
  LogOut,
  Menu,
  Plus,
  Settings,
  Target,
  Shield,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import ActiveTimerView from "@/components/ActiveTimerView";
import TimetableManager from "@/components/TimetableManager";
import AnalyticsView from "@/components/AnalyticsView";
import ReflectionDialog from "@/components/ReflectionDialog";
import DopamineShieldView from "@/components/DopamineShieldView";

export default function Dashboard() {
  const { isLoading, isAuthenticated, user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"timer" | "timetables" | "analytics" | "shield">("timer");
  const [showReflection, setShowReflection] = useState(false);

  const activeTimetable = useQuery(api.timetables.getActive);
  const seedData = useMutation(api.seedData.seedDefaultTimetable);
  const todayLogs = useQuery(api.completionLogs.getToday);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, navigate]);

  useEffect(() => {
    // Seed default timetable if none exists
    if (user && activeTimetable === null) {
      seedData().then(() => {
        toast.success("Welcome! Your default timetable has been created.");
      });
    }
  }, [user, activeTimetable, seedData]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const completionRate = todayLogs
    ? Math.round(
        (todayLogs.filter((log) => log.completed).length / todayLogs.length) *
          100
      ) || 0
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2 rounded-xl">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">DisciplineOS</h1>
                <p className="text-sm text-muted-foreground">
                  {user.name || user.email || "Welcome"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowReflection(true)}
                className="cursor-pointer"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                className="cursor-pointer"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Stats Bar */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-lg">
                <Flame className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Streak</p>
                <p className="text-2xl font-bold">
                  {user.currentStreak || 0} days
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Today's Progress</p>
                <p className="text-2xl font-bold">{completionRate}%</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Longest Streak</p>
                <p className="text-2xl font-bold">
                  {user.longestStreak || 0} days
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
                <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Days</p>
                <p className="text-2xl font-bold">
                  {user.totalDaysCompleted || 0}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex gap-2 bg-white/50 dark:bg-gray-900/50 p-1 rounded-lg w-fit">
          <Button
            variant={activeTab === "timer" ? "default" : "ghost"}
            onClick={() => setActiveTab("timer")}
            className="cursor-pointer"
          >
            <Clock className="h-4 w-4 mr-2" />
            Timer
          </Button>
          <Button
            variant={activeTab === "timetables" ? "default" : "ghost"}
            onClick={() => setActiveTab("timetables")}
            className="cursor-pointer"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Timetables
          </Button>
          <Button
            variant={activeTab === "analytics" ? "default" : "ghost"}
            onClick={() => setActiveTab("analytics")}
            className="cursor-pointer"
          >
            <Target className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button
            variant={activeTab === "shield" ? "default" : "ghost"}
            onClick={() => setActiveTab("shield")}
            className="cursor-pointer bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700"
          >
            <Shield className="h-4 w-4 mr-2" />
            Shield
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {activeTab === "timer" && <ActiveTimerView />}
        {activeTab === "timetables" && <TimetableManager />}
        {activeTab === "analytics" && <AnalyticsView />}
        {activeTab === "shield" && <DopamineShieldView />}
      </div>

      {/* Reflection Dialog */}
      <ReflectionDialog
        open={showReflection}
        onOpenChange={setShowReflection}
      />
    </div>
  );
}