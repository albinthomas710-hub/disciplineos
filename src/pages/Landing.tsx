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
  X,
  TrendingUp,
  Users,
  Award,
  Rocket,
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
      {/* Hero Section - REDESIGNED */}
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

          {/* Hero - Authentic & Feature-Focused */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tighter mb-8 leading-[1.05]">
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-300 dark:via-purple-300 dark:to-pink-300 bg-clip-text text-transparent drop-shadow-[0_2px_12px_rgba(99,102,241,0.3)]">
                Time-Block Productivity
              </span>
              <br />
              <span className="text-gray-900 dark:text-gray-100">
                With a Twist
              </span>
            </h2>

            <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-6 max-w-3xl mx-auto leading-relaxed">
              Create timetables, track progress, and see two parallel timelines of your future self - 
              one where you stay disciplined, one where you drift. Your daily choices determine which future becomes real.
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
                className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-700 hover:via-purple-700 hover:to-indigo-700 text-white px-10 py-7 text-lg rounded-2xl shadow-[0_8px_30px_rgba(99,102,241,0.3)] hover:shadow-[0_12px_40px_rgba(99,102,241,0.5)] transition-all duration-500 cursor-pointer hover:scale-[1.03] active:scale-[0.97] font-bold tracking-wide"
              >
                {isAuthenticated ? "Go to Dashboard" : "Start Free - No Credit Card"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Features Section - ENHANCED */}
      <div id="features" className="py-24 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-indigo-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h3 className="text-4xl sm:text-5xl font-extrabold mb-5 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 dark:from-white dark:via-gray-100 dark:to-gray-300 bg-clip-text text-transparent tracking-tighter">
              What Makes This Different
            </h3>
            <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-400 font-light tracking-wide">
              Built for execution, not endless planning
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Sparkles,
                title: "Future Self Mirror",
                description:
                  "Two parallel timelines show your future 90 days from now - one disciplined, one drifting. Your completion rate today determines which timeline becomes more vivid. No AI needed, just honest reflection.",
                color: "from-purple-500 to-pink-500",
              },
              {
                icon: Calendar,
                title: "Multi-Timetable System",
                description:
                  "Create different schedules for school days, holidays, and focus modes. Switch between them instantly. Time-block your entire day.",
                color: "from-blue-500 to-cyan-500",
              },
              {
                icon: Shield,
                title: "Dopamine Shield",
                description:
                  "Emergency support when temptation hits. Convert fantasies into 3-step action plans. Track your urges and build resistance.",
                color: "from-red-500 to-orange-500",
              },
              {
                icon: Target,
                title: "Manifestation Board",
                description:
                  "Track goals with energy scores, visualization streaks, and synchronicity logging. Break big goals into micro-steps.",
                color: "from-yellow-500 to-orange-500",
              },
              {
                icon: LineChart,
                title: "Progress Analytics",
                description:
                  "Track daily streaks, completion rates, and weekly consistency. See your discipline grow over time.",
                color: "from-green-500 to-emerald-500",
              },
              {
                icon: Brain,
                title: "Daily Reflections",
                description:
                  "End each day with guided prompts. What went well, what broke discipline, how to improve tomorrow.",
                color: "from-indigo-500 to-purple-500",
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-2 group">
                  <CardContent className="p-7">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 shadow-lg group-hover:shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3`}
                    >
                      <feature.icon className="h-7 w-7 text-white" />
                    </div>
                    <h4 className="text-xl font-bold mb-3">{feature.title}</h4>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-base">
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
      <div className="py-24 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-900 dark:to-purple-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h3 className="text-4xl sm:text-5xl font-extrabold mb-5 tracking-tighter bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 dark:from-white dark:via-gray-100 dark:to-gray-300 bg-clip-text text-transparent">How It Works</h3>
            <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-400 font-light tracking-wide">
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
                <div className="relative mb-8 group">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-extrabold shadow-xl group-hover:shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                    {step.step}
                  </div>
                  <step.icon className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-9 w-9 text-white transition-transform duration-500 group-hover:scale-125" />
                </div>
                <h4 className="text-xl font-bold mb-3 tracking-tight">{step.title}</h4>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-base">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section - ENHANCED */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        className="py-24 bg-gradient-to-r from-indigo-600 to-purple-600"
      >
        <div className="max-w-4xl mx-auto text-center px-4">
          <Rocket className="h-20 w-20 mx-auto mb-8 text-white drop-shadow-2xl" />
          <h3 className="text-4xl sm:text-5xl font-extrabold text-white mb-6 tracking-tighter drop-shadow-lg">
            Stop Wasting Time. Start Building Discipline.
          </h3>
          <p className="text-xl sm:text-2xl text-indigo-50 mb-10 font-light leading-relaxed tracking-wide">
            Join the productivity revolution. Free forever. No credit card required.
          </p>
          <Button
            size="lg"
            onClick={handleGetStarted}
            className="bg-white text-indigo-600 hover:bg-indigo-50 px-10 py-7 text-lg rounded-2xl shadow-[0_8px_30px_rgba(255,255,255,0.3)] hover:shadow-[0_12px_40px_rgba(255,255,255,0.5)] transition-all duration-500 cursor-pointer hover:scale-[1.03] active:scale-[0.97] font-bold tracking-wide"
          >
            {isAuthenticated ? "Go to Dashboard" : "Start Free Now"}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <p className="text-sm text-indigo-100 mt-6">
            ✓ No credit card required  ✓ Setup in 2 minutes  ✓ Cancel anytime
          </p>
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