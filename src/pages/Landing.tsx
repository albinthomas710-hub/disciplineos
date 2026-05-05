import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Flame,
  Loader2,
  ShieldCheck,
  Sparkles,
  Target,
  TimerReset,
} from "lucide-react";
import { useNavigate } from "react-router";

const features = [
  {
    icon: CalendarClock,
    title: "Tactical time blocks",
    description:
      "Plan the day around the work that matters, then move block by block without rebuilding your schedule.",
  },
  {
    icon: TimerReset,
    title: "Live execution loop",
    description:
      "See the current block, mark progress quickly, and keep momentum visible while the day is still in motion.",
  },
  {
    icon: ShieldCheck,
    title: "Recovery built in",
    description:
      "Missed blocks become useful data instead of dead weight, so the next move is always clear.",
  },
];

const steps = [
  { label: "Plan", icon: Target, copy: "Choose the schedule for the day." },
  { label: "Run", icon: Clock3, copy: "Work from the active block." },
  { label: "Mark", icon: CheckCircle2, copy: "Log wins and misses fast." },
  { label: "Reset", icon: Flame, copy: "Use the review to sharpen tomorrow." },
];

export default function Landing() {
  const { isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate(isAuthenticated ? "/dashboard" : "/auth");
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <section className="relative border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,var(--secondary),transparent_34%),radial-gradient(circle_at_80%_0%,var(--accent),transparent_24%)] opacity-40" />
        <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                <Target className="size-6" />
              </div>
              <span className="text-lg font-extrabold tracking-normal">
                DisciplineOS
              </span>
            </div>
            <Button
              variant="outline"
              onClick={handleGetStarted}
              className="min-h-11 border-primary/30 bg-background/80 transition-colors duration-200 hover:bg-secondary"
            >
              {isAuthenticated ? "Dashboard" : "Sign in"}
            </Button>
          </nav>

          <div className="grid min-h-[78vh] items-center gap-12 py-16 lg:grid-cols-[1fr_0.86fr] lg:py-20">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
              className="max-w-3xl"
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-semibold text-muted-foreground shadow-sm">
                <Sparkles className="size-4 text-accent" />
                New command-center landing refresh
              </div>
              <h1 className="text-4xl font-extrabold leading-tight tracking-normal sm:text-5xl lg:text-7xl">
                DisciplineOS
                <span className="mt-3 block text-primary">
                  turns the day into a mission board.
                </span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
                Build realistic timetables, execute the active block, and review
                the day with enough structure to recover fast when plans change.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  size="lg"
                  onClick={handleGetStarted}
                  className="min-h-12 px-7 text-base shadow-lg shadow-primary/20 transition-transform duration-200 hover:translate-y-[-2px]"
                >
                  {isAuthenticated ? "Open Dashboard" : "Start Free"}
                  <ArrowRight className="size-5" />
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={() => {
                    document
                      .getElementById("features")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="min-h-12 px-7 text-base transition-transform duration-200 hover:translate-y-[-2px]"
                >
                  View System
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.6 }}
              className="relative"
            >
              <Card className="overflow-hidden rounded-lg border-primary/20 bg-card/90 shadow-2xl shadow-primary/10 backdrop-blur">
                <CardContent className="space-y-6 p-5 sm:p-7">
                  <div className="flex items-center justify-between gap-4 border-b border-border pb-5">
                    <div>
                      <p className="font-mono text-xs font-bold uppercase text-muted-foreground">
                        Active block
                      </p>
                      <h2 className="mt-1 text-2xl font-extrabold">
                        Deep Work Sprint
                      </h2>
                    </div>
                    <div className="rounded-lg bg-primary px-3 py-2 font-mono text-sm font-bold text-primary-foreground">
                      42:00
                    </div>
                  </div>

                  <div className="grid gap-3">
                    {[
                      ["Prayer + setup", "done"],
                      ["Deep Work Sprint", "live"],
                      ["Sales pipeline", "next"],
                      ["Daily reflection", "queued"],
                    ].map(([name, state]) => (
                      <div
                        key={name}
                        className="flex min-h-14 items-center justify-between rounded-lg border border-border bg-background/70 px-4"
                      >
                        <div className="flex items-center gap-3">
                          <span className="size-2 rounded-full bg-primary" />
                          <span className="font-semibold">{name}</span>
                        </div>
                        <span className="rounded-md bg-secondary px-2 py-1 font-mono text-xs font-bold uppercase text-secondary-foreground">
                          {state}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      ["86%", "completion"],
                      ["12", "streak"],
                      ["4", "rescues"],
                    ].map(([value, label]) => (
                      <div
                        key={label}
                        className="rounded-lg border border-border bg-muted p-4"
                      >
                        <p className="text-2xl font-extrabold">{value}</p>
                        <p className="mt-1 font-mono text-xs font-bold uppercase text-muted-foreground">
                          {label}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="features" className="border-b border-border bg-card py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="max-w-2xl"
          >
            <p className="font-mono text-sm font-bold uppercase text-primary">
              Execution stack
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-normal sm:text-4xl">
              A quieter system for people who need to act, not decorate plans.
            </h2>
          </motion.div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.4 }}
              >
                <Card className="h-full rounded-lg transition-shadow duration-300 hover:shadow-xl">
                  <CardContent className="p-6">
                    <div className="mb-5 flex size-12 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                      <feature.icon className="size-6" />
                    </div>
                    <h3 className="text-xl font-bold">{feature.title}</h3>
                    <p className="mt-3 leading-7 text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-background py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-5 md:grid-cols-4">
            {steps.map((step, index) => (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.4 }}
                className="rounded-lg border border-border bg-card p-6 shadow-sm"
              >
                <div className="mb-6 flex items-center justify-between">
                  <step.icon className="size-6 text-primary" />
                  <span className="font-mono text-sm font-bold text-muted-foreground">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="text-lg font-extrabold">{step.label}</h3>
                <p className="mt-2 leading-7 text-muted-foreground">
                  {step.copy}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 rounded-lg border border-primary/20 bg-primary p-8 text-primary-foreground shadow-xl shadow-primary/20 sm:p-10"
          >
            <div className="grid items-center gap-8 md:grid-cols-[1fr_auto]">
              <div>
                <p className="font-mono text-sm font-bold uppercase opacity-80">
                  Ready when the day gets messy
                </p>
                <h2 className="mt-3 text-3xl font-extrabold tracking-normal">
                  Open the dashboard and run the next block.
                </h2>
              </div>
              <Button
                size="lg"
                variant="secondary"
                onClick={handleGetStarted}
                className="min-h-12 px-7 text-base transition-transform duration-200 hover:translate-y-[-2px]"
              >
                {isAuthenticated ? "Go to Dashboard" : "Create Account"}
                <ArrowRight className="size-5" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-border bg-card py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-sm text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <p>DisciplineOS</p>
          <a
            href="https://vly.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-primary underline-offset-4 transition-colors duration-200 hover:underline"
          >
            Built with vly.ai
          </a>
        </div>
      </footer>
    </main>
  );
}
