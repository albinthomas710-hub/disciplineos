import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import { Shield, Clock, AlertTriangle, CheckCircle2, Loader2, Lock, Unlock } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import TemptationInterceptorModal from "./TemptationInterceptorModal";
import UrgeModal from "./UrgeModal";
import RealityAnchorModal from "./RealityAnchorModal";
import KitchenReclaimModal from "./KitchenReclaimModal";
import EmergencyDashboard from "./EmergencyDashboard";
import DopamineShieldOnboarding from "./DopamineShieldOnboarding";
import { useAuth } from "@/hooks/use-auth";

export default function DopamineShieldView() {
  const { user } = useAuth();
  const shieldStatus = useQuery(api.dopamineShield.getStatus);
  const initializeStatus = useMutation(api.dopamineShield.initializeStatus);
  const triggers = useQuery(api.emergencyTriggers.getUserTriggers);
  const [showInterceptor, setShowInterceptor] = useState(false);
  const [showUrgeModal, setShowUrgeModal] = useState(false);
  const [showRealityAnchor, setShowRealityAnchor] = useState(false);
  const [showKitchenReclaim, setShowKitchenReclaim] = useState(false);
  const [showEmergencyDashboard, setShowEmergencyDashboard] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  useEffect(() => {
    if (shieldStatus === null) {
      initializeStatus();
    }
  }, [shieldStatus, initializeStatus]);

  // Check if user needs onboarding
  useEffect(() => {
    if (user && !user.hasCompletedShieldOnboarding && triggers && triggers.length === 0) {
      setShowOnboarding(true);
    }
  }, [user, triggers]);

  useEffect(() => {
    if (!shieldStatus) return;

    const updateCooldown = () => {
      if (shieldStatus.cooldownExpiresAt) {
        const remaining = Math.max(0, shieldStatus.cooldownExpiresAt - Date.now());
        setCooldownRemaining(remaining);
      } else {
        setCooldownRemaining(0);
      }
    };

    updateCooldown();
    const interval = setInterval(updateCooldown, 1000);
    return () => clearInterval(interval);
  }, [shieldStatus]);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const handleAccessShorts = () => {
    if (cooldownRemaining > 0) {
      setShowUrgeModal(true);
    } else {
      toast.success("Access granted - no cooldown active");
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    toast.success("Your personalized Dopamine Shield is ready! 🛡️");
  };

  if (!shieldStatus) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show onboarding for new users
  if (showOnboarding) {
    return <DopamineShieldOnboarding onComplete={handleOnboardingComplete} />;
  }

  const isStrictBlock = shieldStatus.bypassAttemptsToday >= 3;
  const cooldownProgress = shieldStatus.cooldownExpiresAt
    ? Math.max(0, 100 - (cooldownRemaining / (60 * 60 * 1000)) * 100)
    : 100;

  return (
    <div className="space-y-6">
      {/* Emergency Button - NEW */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <Card className="border-2 border-red-500 dark:border-red-700 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-red-600 to-orange-600 p-3 rounded-xl animate-pulse">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">
                  Emergency Support
                </h2>
                <p className="text-sm text-muted-foreground font-normal">
                  Feeling tempted? Click here for immediate support
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => setShowEmergencyDashboard(true)}
              className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white cursor-pointer text-lg py-6"
              size="lg"
            >
              <Shield className="h-5 w-5 mr-2" />
              I Need Help Right Now
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Header Card */}
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
                <h2 className="text-2xl font-bold">Dopamine Shield Mode</h2>
                <p className="text-sm text-muted-foreground font-normal">
                  Protect your focus from short-form content temptations
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {cooldownRemaining > 0 ? (
                  <>
                    <Lock className="h-5 w-5 text-orange-600" />
                    <span className="font-semibold text-orange-600">
                      Cooldown Active: {formatTime(cooldownRemaining)}
                    </span>
                  </>
                ) : (
                  <>
                    <Unlock className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-green-600">
                      No Active Cooldown
                    </span>
                  </>
                )}
              </div>
              {isStrictBlock && (
                <Badge variant="destructive" className="text-sm">
                  Strict Block Active (24h)
                </Badge>
              )}
            </div>
            {cooldownRemaining > 0 && (
              <div className="mt-4">
                <Progress value={cooldownProgress} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-4">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Bypass Attempts Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {shieldStatus.bypassAttemptsToday} / 3
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {3 - shieldStatus.bypassAttemptsToday} attempts remaining before strict block
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Challenges Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {shieldStatus.microChallengeHistory?.length || 0}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Total micro-challenges completed
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                Last Learning Session
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                {shieldStatus.lastLearningEnd
                  ? new Date(shieldStatus.lastLearningEnd).toLocaleTimeString()
                  : "No sessions yet"}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Complete learning to activate shield
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Action Buttons - Temptation Interceptor */}
      <Card>
        <CardHeader>
          <CardTitle>Temptation Interceptor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The Temptation Interceptor helps you avoid cascade-scrolling after useful content.
            When you finish a learning session, a cooldown period prevents immediate access to
            short-form content unless you complete a micro-task.
          </p>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowInterceptor(true)}
              className="cursor-pointer"
            >
              Mark Learning Complete
            </Button>
            <Button
              variant="outline"
              onClick={handleAccessShorts}
              className="cursor-pointer"
            >
              {cooldownRemaining > 0 ? "Request Shorts Access" : "Access Shorts"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reality Anchor - Fantasy To Plan Converter */}
      <Card className="border-2 border-yellow-200 dark:border-yellow-800 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-yellow-600 to-orange-600 p-2 rounded-lg">
              <Shield className="h-5 w-5 text-white" />
            </div>
            Reality Anchor — Fantasy To Plan Converter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Stop long fantasy loops where you imagine success and then do nothing. 
            This feature captures the fantasy moment and immediately converts that mental 
            energy into a short, concrete action plan (5–20 minutes) so the fantasy becomes fuel, not escape.
          </p>
          <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg border border-yellow-300 dark:border-yellow-700">
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              💡 Caught yourself daydreaming about success? Convert it into action right now.
            </p>
          </div>
          <Button
            onClick={() => setShowRealityAnchor(true)}
            className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 cursor-pointer"
            size="lg"
          >
            I'm Zoning Out — Anchor Me
          </Button>
        </CardContent>
      </Card>

      {/* Kitchen Micro-Reclaim & Mindful Eats */}
      <Card className="border-2 border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-orange-600 to-red-600 p-2 rounded-lg">
              <Shield className="h-5 w-5 text-white" />
            </div>
            Kitchen Micro-Reclaim & Mindful Eats
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Stop wasting time waiting for food. Turn those 20-30 minutes into productive 
            micro-tasks, then eat mindfully to prevent overeating.
          </p>
          <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg border border-orange-300 dark:border-orange-700">
            <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
              🍽️ Waiting for food? Reclaim this time and eat with awareness.
            </p>
          </div>
          <Button
            onClick={() => setShowKitchenReclaim(true)}
            className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 cursor-pointer"
            size="lg"
          >
            Start Kitchen Timer
          </Button>
        </CardContent>
      </Card>

      {/* Challenge History */}
      {shieldStatus.microChallengeHistory && shieldStatus.microChallengeHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Challenges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {shieldStatus.microChallengeHistory.slice(-5).reverse().map((challenge: any, i: number) => (
                <motion.div
                  key={i}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{challenge.type}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(challenge.completedAt).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant={challenge.success ? "default" : "destructive"}>
                    {challenge.success ? "Success" : "Failed"}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <TemptationInterceptorModal
        open={showInterceptor}
        onOpenChange={setShowInterceptor}
      />
      <UrgeModal
        open={showUrgeModal}
        onOpenChange={setShowUrgeModal}
      />
      <RealityAnchorModal
        open={showRealityAnchor}
        onOpenChange={setShowRealityAnchor}
      />
      <KitchenReclaimModal
        open={showKitchenReclaim}
        onOpenChange={setShowKitchenReclaim}
      />
      <EmergencyDashboard
        open={showEmergencyDashboard}
        onOpenChange={setShowEmergencyDashboard}
      />
    </div>
  );
}