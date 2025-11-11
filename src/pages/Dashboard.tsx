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
  BookOpen,
  FolderOpen,
  Sparkles,
  Brain,
  Heart,
  Video,
  Lightbulb,
  Ban,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import ActiveTimerView from "@/components/ActiveTimerView";
import TimetableManager from "@/components/TimetableManager";
import AnalyticsView from "@/components/AnalyticsView";
import ReflectionDialog from "@/components/ReflectionDialog";
import DopamineShieldView from "@/components/DopamineShieldView";
import VectalView from "@/components/VectalView";
import QuotesView from "@/components/QuotesView";
import ProjectsView from "@/components/ProjectsView";
import ManifestationView from "@/components/ManifestationView";
import FutureTimelineView from "@/components/FutureTimelineView";
import KnowYourselfView from "@/components/KnowYourselfView";
import PrayerView from "@/components/PrayerView";
import VideoLibraryView from "@/components/VideoLibraryView";
import AdviceView from "@/components/AdviceView";
import NotToDoListView from "@/components/NotToDoListView";

export default function Dashboard() {
  const { isLoading, isAuthenticated, user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"timer" | "timetables" | "analytics" | "shield" | "vectal" | "quotes" | "projects" | "manifest" | "future" | "knowyourself" | "prayer" | "videos" | "advice" | "nottodo">("timer");
  const [showReflection, setShowReflection] = useState(false);

  const activeTimetable = useQuery((api as any).timetables.getActive);
  const todayLogs = useQuery((api as any).completionLogs.getToday);
  const reflectionCheck = useQuery((api as any).reflectionTriggers.shouldShowReflection);
  const vectalCheck = useQuery((api as any).vectal.checkDailyCompletion);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, navigate]);

  // Removed automatic timetable seeding - users create their own
  // useEffect for seedData removed

  // New: Auto-show reflection dialog when appropriate
  useEffect(() => {
    if (reflectionCheck?.shouldShow && !showReflection) {
      // Small delay to avoid showing immediately on page load
      const timer = setTimeout(() => {
        setShowReflection(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [reflectionCheck, showReflection]);

  // New: Show alert if Vectal tasks are not completed
  useEffect(() => {
    if (vectalCheck && !vectalCheck.allCompleted && vectalCheck.totalTasks > 0) {
      const incompleteTasks = vectalCheck.totalTasks - vectalCheck.completedTasks;
      if (incompleteTasks > 0) {
        toast.info(
          `⚠️ Vectal Check: ${incompleteTasks} task${incompleteTasks > 1 ? 's' : ''} remaining today`,
          { duration: 5000 }
        );
      }
    }
  }, [vectalCheck]);

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
        (todayLogs.filter((log: any) => log.completed).length / todayLogs.length) *
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
        <div className="flex flex-wrap gap-2 bg-white/50 dark:bg-gray-900/50 p-1 rounded-lg">
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
          <Button
            variant={activeTab === "vectal" ? "default" : "ghost"}
            onClick={() => setActiveTab("vectal")}
            className="cursor-pointer bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-700 hover:to-blue-700"
          >
            <Target className="h-4 w-4 mr-2" />
            Vectal
          </Button>
          <Button
            variant={activeTab === "quotes" ? "default" : "ghost"}
            onClick={() => setActiveTab("quotes")}
            className="cursor-pointer bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:from-amber-700 hover:to-orange-700"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Quotes
          </Button>
          <Button
            variant={activeTab === "projects" ? "default" : "ghost"}
            onClick={() => setActiveTab("projects")}
            className="cursor-pointer bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700"
          >
            <FolderOpen className="h-4 w-4 mr-2" />
            Projects
          </Button>
          <Button
            variant={activeTab === "manifest" ? "default" : "ghost"}
            onClick={() => setActiveTab("manifest")}
            className="cursor-pointer bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Manifest
          </Button>
          <Button
            variant={activeTab === "future" ? "default" : "ghost"}
            onClick={() => setActiveTab("future")}
            className="cursor-pointer bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Future
          </Button>
          <Button
            variant={activeTab === "knowyourself" ? "default" : "ghost"}
            onClick={() => setActiveTab("knowyourself")}
            className="cursor-pointer bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-700 hover:to-blue-700"
          >
            <Brain className="h-4 w-4 mr-2" />
            Know Yourself
          </Button>
          <Button
            variant={activeTab === "prayer" ? "default" : "ghost"}
            onClick={() => setActiveTab("prayer")}
            className="cursor-pointer bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700"
          >
            <Heart className="h-4 w-4 mr-2" />
            Prayer
          </Button>
          <Button
            variant={activeTab === "videos" ? "default" : "ghost"}
            onClick={() => setActiveTab("videos")}
            className="cursor-pointer bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-700 hover:to-blue-700"
          >
            <Video className="h-4 w-4 mr-2" />
            Videos
          </Button>
          <Button
            variant={activeTab === "advice" ? "default" : "ghost"}
            onClick={() => setActiveTab("advice")}
            className="cursor-pointer bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700"
          >
            <Lightbulb className="h-4 w-4 mr-2" />
            Advice
          </Button>
          <Button
            variant={activeTab === "nottodo" ? "default" : "ghost"}
            onClick={() => setActiveTab("nottodo")}
            className="cursor-pointer bg-gradient-to-r from-red-600 to-orange-600 text-white hover:from-red-700 hover:to-orange-700"
          >
            <Ban className="h-4 w-4 mr-2" />
            Not To Do
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {activeTab === "timer" && <ActiveTimerView />}
        {activeTab === "timetables" && <TimetableManager />}
        {activeTab === "analytics" && <AnalyticsView />}
        {activeTab === "shield" && <DopamineShieldView />}
        {activeTab === "vectal" && <VectalView />}
        {activeTab === "quotes" && <QuotesView />}
        {activeTab === "projects" && <ProjectsView />}
        {activeTab === "manifest" && <ManifestationView />}
        {activeTab === "future" && <FutureTimelineView />}
        {activeTab === "knowyourself" && <KnowYourselfView />}
        {activeTab === "prayer" && <PrayerView />}
        {activeTab === "videos" && <VideoLibraryView />}
        {activeTab === "advice" && <AdviceView />}
        {activeTab === "nottodo" && <NotToDoListView />}
      </div>

      {/* Reflection Dialog */}
      <ReflectionDialog
        open={showReflection}
        onOpenChange={setShowReflection}
      />
    </div>
  );
}