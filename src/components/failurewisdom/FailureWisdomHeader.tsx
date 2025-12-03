import { motion } from "framer-motion";

export function FailureWisdomHeader() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="mb-20 space-y-8"
    >
      <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-red-500/30 bg-red-500/10 backdrop-blur-sm">
        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        <span className="text-sm font-medium tracking-wide text-red-600 dark:text-red-400">Learning Archive</span>
      </div>
      
      <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] bg-gradient-to-b from-gray-900 via-red-800 to-orange-700 dark:from-white dark:via-neutral-200 dark:to-neutral-500 bg-clip-text text-transparent">
        Mistake<br />Vault
      </h1>
      
      <div className="max-w-3xl space-y-8">
        <div>
          <p className="text-xl md:text-2xl text-gray-700 dark:text-neutral-400 leading-relaxed font-light border-l-2 border-red-600 pl-8 py-3">
            "Everyone else is chasing every business model, every skill. True successful people know they can't do everything at once. They understand if you do one thing so well, it can fund the other nine. Choose one goal and commit to it fully—that's what separates them from the majority."
          </p>
          <p className="text-sm text-gray-600 dark:text-neutral-600 mt-4 pl-8">— Focus Principle</p>
        </div>
        
        <div>
          <p className="text-xl md:text-2xl text-gray-700 dark:text-neutral-400 leading-relaxed font-light border-l-2 border-orange-600 pl-8 py-3">
            "A fool never learns from their mistakes. A wise person learns from their own. But the wisest learn from the mistakes of others."
          </p>
          <p className="text-sm text-gray-600 dark:text-neutral-600 mt-4 pl-8">— Ancient Wisdom</p>
        </div>
        
        <div>
          <p className="text-xl md:text-2xl text-gray-700 dark:text-neutral-400 leading-relaxed font-light border-l-2 border-purple-600 pl-8 py-3">
            "Some of the most successful people I know have had the most failures. Michael Jordan failed over and over again, and that's why he succeeded."
          </p>
          <p className="text-sm text-gray-600 dark:text-neutral-600 mt-4 pl-8">— Barack Obama</p>
        </div>
      </div>
    </motion.div>
  );
}
