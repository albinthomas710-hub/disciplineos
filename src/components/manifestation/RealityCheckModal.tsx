import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { AlertTriangle, TrendingDown, Calendar } from "lucide-react";

interface RealityCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  manifestation: any;
  daysSinceLastAction: number;
}

export function RealityCheckModal({ isOpen, onClose, manifestation, daysSinceLastAction }: RealityCheckModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl border-4 border-red-500 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/50 dark:to-orange-950/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 0.5 }}
            >
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </motion.div>
            <span className="text-red-700 dark:text-red-300 font-black">REALITY CHECK</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Days Wasted Counter */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-6 bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl shadow-2xl text-white text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-2">
              <TrendingDown className="h-8 w-8" />
              <p className="text-5xl font-black">{daysSinceLastAction}</p>
              <Calendar className="h-8 w-8" />
            </div>
            <p className="text-2xl font-bold">DAYS WITHOUT ACTION</p>
            <p className="text-sm opacity-90 mt-2">Your momentum is dying. Every day you wait makes it harder.</p>
          </motion.div>

          {/* Identity Reminder */}
          {manifestation.identityStatement && (
            <div className="p-4 bg-red-100 dark:bg-red-950/40 border-l-4 border-red-600 rounded">
              <p className="text-sm font-bold text-red-700 dark:text-red-300 mb-2">
                🔥 YOU SAID YOU WERE:
              </p>
              <p className="text-lg font-bold text-red-800 dark:text-red-200">
                "{manifestation.identityStatement}"
              </p>
              <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                But your actions say otherwise. Who are you really?
              </p>
            </div>
          )}

          {/* Pain Leverage */}
          {manifestation.painLeverage && (
            <div className="p-4 bg-orange-100 dark:bg-orange-950/40 border-l-4 border-orange-600 rounded">
              <p className="text-sm font-bold text-orange-700 dark:text-orange-300 mb-2">
                ⚡ THE COST OF INACTION:
              </p>
              <p className="text-base text-orange-800 dark:text-orange-200">
                {manifestation.painLeverage}
              </p>
              <p className="text-sm text-orange-600 dark:text-orange-400 mt-2 font-bold">
                Is this the future you want? Act NOW or accept this reality.
              </p>
            </div>
          )}

          {/* Call to Action */}
          <div className="text-center space-y-3">
            <p className="text-lg font-bold text-gray-700 dark:text-gray-300">
              The gap between who you want to be and who you are is measured in ACTIONS, not intentions.
            </p>
            <Button
              onClick={onClose}
              className="cursor-pointer w-full h-14 text-lg font-black bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-xl"
            >
              I'M TAKING ACTION TODAY
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
