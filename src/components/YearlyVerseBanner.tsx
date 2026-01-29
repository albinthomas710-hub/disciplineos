import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

export default function YearlyVerseBanner() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full mb-6"
    >
      <Card className="overflow-hidden border-0 shadow-2xl rounded-2xl bg-black/5 dark:bg-white/5">
        <CardContent className="p-0 relative aspect-[21/9] md:aspect-[3/1] w-full">
          <img 
            src="https://harmless-tapir-303.convex.cloud/api/storage/a50a28b6-1f75-45cc-848e-afa20cde31ef" 
            alt="Yearly Verse - Daniel 12:3"
            className="w-full h-full object-cover"
          />
          {/* Overlay gradient for subtle depth, but no text */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
        </CardContent>
      </Card>
    </motion.div>
  );
}