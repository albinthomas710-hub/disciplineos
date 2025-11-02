import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { PartyPopper } from "lucide-react";

interface CelebrationModalProps {
  item: any;
  onClose: () => void;
}

export default function CelebrationModal({ item, onClose }: CelebrationModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <Card className="max-w-md border-4 border-yellow-400 bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50 dark:from-yellow-950 dark:via-orange-950 dark:to-pink-950 shadow-2xl">
        <CardContent className="p-8 text-center">
          <motion.div
            animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <PartyPopper className="h-24 w-24 mx-auto mb-4 text-yellow-500" />
          </motion.div>
          <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-yellow-600 via-orange-600 to-pink-600 bg-clip-text text-transparent">
            🎉 MANIFESTATION ACHIEVED! 🎉
          </h2>
          <p className="text-xl font-semibold mb-4">{item.title}</p>
          <p className="text-muted-foreground mb-6">
            You brought this into reality! The universe responded to your energy! ✨
          </p>
          <Button
            onClick={onClose}
            className="cursor-pointer bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
          >
            Continue Manifesting
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
