import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Brain,
  Calendar,
  CheckCircle2,
  Clock,
  Flame,
  Focus,
  LineChart,
  Loader2,
  Shield,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router";

export default function Landing() {
  const { isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      navigate("/auth");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative overflow-hidden"
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-indigo-200/20 to-purple-200/20 dark:from-indigo-900/10 dark:to-purple-900/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [90, 0, 90],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-blue-200/20 to-indigo-200/20 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-full blur-3xl"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          {/* Logo */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center mb-8"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur-lg opacity-50" />
                <div className="relative bg-gradient-to-br from-indigo-600 to-purple-600 p-3 rounded-2xl">
                  <Target className="h-8 w-8 text-white" />
                </div>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                DisciplineOS
              </h1>
            </div>
          </motion.div>

          {/* Hero Content */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
              <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent drop-shadow-sm">
                Master Your Time.
              </span>
              <br />
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 dark:from-indigo-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent drop-shadow-sm">
                Build Discipline.
              </span>
            </h2>

            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed font-light">
              The time-block productivity system that structures every hour of
              your day and keeps you ruthlessly consistent. Break free from
              distractions and unlock your potential.
            </p>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button
                size="lg"
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer hover:scale-[1.02] active:scale-[0.98] font-semibold"
              >
                {isAuthenticated ? "Go to Dashboard" : "Start Your Journey"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-6 text-lg rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] border-2 font-medium"
                onClick={() => {
                  document
                    .getElementById("features")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Learn More
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto"
            >
              {[
                { icon: Flame, label: "Build Streaks", value: "Daily" },
                { icon: Target, label: "Hit Goals", value: "100%" },
                { icon: Zap, label: "Stay Focused", value: "24/7" },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <stat.icon className="h-8 w-8 mx-auto mb-2 text-indigo-600 dark:text-indigo-400" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Features Section */}
      <div id="features" className="py-24 bg-white/50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h3 className="text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent tracking-tight">
              Everything You Need to Win
            </h3>
            <p className="text-xl text-gray-600 dark:text-gray-400 font-light">
              Powerful features designed to keep you on track
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Calendar,
                title: "Multi-Timetable System",
                description:
                  "Create unlimited schedules for school days, holidays, and focus modes. Switch between them instantly.",
                color: "from-blue-500 to-cyan-500",
              },
              {
                icon: Clock,
                title: "Time-Block Automation",
                description:
                  "Structure every hour with precision. Get smart notifications and stay on schedule automatically.",
                color: "from-indigo-500 to-purple-500",
              },
              {
                icon: Focus,
                title: "Dopamine Shield Mode",
                description:
                  "Block distractions during focus hours. Grey out the screen until your task timer completes.",
                color: "from-purple-500 to-pink-500",
              },
              {
                icon: LineChart,
                title: "Progress Analytics",
                description:
                  "Track daily streaks, completion rates, and weekly consistency. See your discipline grow.",
                color: "from-green-500 to-emerald-500",
              },
              {
                icon: Brain,
                title: "Daily Reflections",
                description:
                  "End each day with guided prompts. Build self-awareness and continuous improvement.",
                color: "from-orange-500 to-red-500",
              },
              {
                icon: Sparkles,
                title: "Beautiful Design",
                description:
                  "Gradient backgrounds that shift with the day. Calm, minimalist interface that inspires focus.",
                color: "from-pink-500 to-rose-500",
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-2 cursor-pointer hover:scale-[1.02] hover:border-indigo-200 dark:hover:border-indigo-800 group">
                  <CardContent className="p-6">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-110`}
                    >
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="text-xl font-bold mb-2 tracking-tight">{feature.title}</h4>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h3 className="text-4xl font-bold mb-4 tracking-tight">How It Works</h3>
            <p className="text-xl text-gray-600 dark:text-gray-400 font-light">
              Four simple steps to transform your day
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Create Your Schedule",
                description: "Build your ideal timetable with hourly blocks",
                icon: Calendar,
              },
              {
                step: "2",
                title: "Follow the Timer",
                description: "Stay focused on your current task block",
                icon: Clock,
              },
              {
                step: "3",
                title: "Track Progress",
                description: "Mark blocks complete and build your streak",
                icon: CheckCircle2,
              },
              {
                step: "4",
                title: "Reflect & Improve",
                description: "End each day with growth insights",
                icon: Sparkles,
              },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center"
              >
                <div className="relative mb-6 group">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                    {step.step}
                  </div>
                  <step.icon className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-white transition-transform duration-300 group-hover:scale-110" />
                </div>
                <h4 className="text-xl font-bold mb-2 tracking-tight">{step.title}</h4>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        className="py-24 bg-gradient-to-r from-indigo-600 to-purple-600"
      >
        <div className="max-w-4xl mx-auto text-center px-4">
          <Shield className="h-16 w-16 mx-auto mb-6 text-white drop-shadow-lg" />
          <h3 className="text-4xl font-bold text-white mb-4 tracking-tight drop-shadow-md">
            Discipline is Freedom
          </h3>
          <p className="text-xl text-indigo-100 mb-8 font-light leading-relaxed">
            Break the loop. Build the life you deserve. Start today.
          </p>
          <Button
            size="lg"
            onClick={handleGetStarted}
            className="bg-white text-indigo-600 hover:bg-gray-50 px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer hover:scale-[1.02] active:scale-[0.98] font-semibold"
          >
            {isAuthenticated ? "Go to Dashboard" : "Begin Your Transformation"}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </motion.div>

      {/* Footer */}
      <div className="py-8 bg-white dark:bg-gray-900 border-t">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-600 dark:text-gray-400">
          <p>
            Built with discipline by{" "}
            <a
              href="https://vly.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              vly.ai
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}