import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HelpCircle, Target, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function MonthlyObjectivesGuide() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-muted">
          <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
          <span className="sr-only">Guide</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Target className="h-5 w-5 text-primary" />
            Mastering Monthly Objectives
          </DialogTitle>
          <DialogDescription>
            How to set execution targets that actually move the needle.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6 text-sm">
            <section className="space-y-2">
              <h3 className="font-bold text-base text-primary">What They Are (No Fluff)</h3>
              <p className="text-muted-foreground leading-relaxed">
                Monthly objectives are the specific, measurable outcomes you commit to achieving within a single month. 
                They are not wishes. They are execution targets tied directly to growth, revenue, or leverage.
              </p>
              <div className="bg-muted/50 p-4 rounded-lg border-l-4 border-primary mt-2">
                <p className="font-medium italic text-foreground">
                  "If this is the only thing I achieve this month, will my position be meaningfully better next month?"
                </p>
                <p className="mt-2 text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  If the answer is no → it’s not an objective, it’s noise.
                </p>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="font-bold text-base">Core Characteristics</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 border rounded-lg bg-card hover:bg-accent/5 transition-colors">
                  <p className="font-bold flex items-center gap-2 text-foreground"><span className="text-blue-500 font-mono">01</span> Time-bound</p>
                  <p className="text-xs text-muted-foreground mt-1">Must be completed within 30 days.</p>
                </div>
                <div className="p-3 border rounded-lg bg-card hover:bg-accent/5 transition-colors">
                  <p className="font-bold flex items-center gap-2 text-foreground"><span className="text-green-500 font-mono">02</span> Outcome-based</p>
                  <p className="text-xs text-muted-foreground mt-1">Focuses on results, not activity.</p>
                </div>
                <div className="p-3 border rounded-lg bg-card hover:bg-accent/5 transition-colors">
                  <p className="font-bold flex items-center gap-2 text-foreground"><span className="text-orange-500 font-mono">03</span> Measurable</p>
                  <p className="text-xs text-muted-foreground mt-1">Binary win or loss (hit / didn’t hit).</p>
                </div>
                <div className="p-3 border rounded-lg bg-card hover:bg-accent/5 transition-colors">
                  <p className="font-bold flex items-center gap-2 text-foreground"><span className="text-purple-500 font-mono">04</span> Leverage-driven</p>
                  <p className="text-xs text-muted-foreground mt-1">Compounds future results.</p>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="font-bold text-base">Good vs. Bad Examples</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 p-4 rounded-lg bg-red-500/5 border border-red-500/20">
                  <h4 className="font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                    <XCircle className="h-4 w-4" /> Bad (Vague/Activity)
                  </h4>
                  <ul className="space-y-2 text-xs text-muted-foreground list-disc pl-4 marker:text-red-500/50">
                    <li>"Work on my AI agency"</li>
                    <li>"Post more content"</li>
                    <li>"Learn automation"</li>
                  </ul>
                </div>
                <div className="space-y-2 p-4 rounded-lg bg-green-500/5 border border-green-500/20">
                  <h4 className="font-bold text-green-600 dark:text-green-400 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" /> Good (Specific/Outcome)
                  </h4>
                  <ul className="space-y-2 text-xs text-muted-foreground list-disc pl-4 marker:text-green-500/50">
                    <li>"Close 3 clients at $3k/month"</li>
                    <li>"Publish 30 videos & generate 100 leads"</li>
                    <li>"Deploy 1 automation saving 20+ hrs"</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="space-y-2 pt-2 border-t">
              <h3 className="font-bold text-base flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="h-4 w-4" /> The Trap You Must Avoid
              </h3>
              <p className="text-muted-foreground text-sm">
                If your monthly objective can be achieved without discomfort, it’s too small.
                If it doesn’t increase revenue, reach, or leverage, it’s a distraction.
              </p>
              <p className="font-bold text-foreground text-sm mt-2">
                Monthly objectives = your non-negotiable outcomes for the next 30 days.
              </p>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
