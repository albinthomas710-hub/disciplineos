// src/components/HistoryView.tsx snippet
// ...
selectedDayData.blocks.map((block: any, i: number) => (
  <motion.div ...>
    <div className={`... ${
      block.completed 
        ? "bg-green-500 ..." 
        : "bg-gray-300 dark:bg-gray-600"
    }`} />
    
    <div className={`... ${
      block.completed 
        ? "bg-gradient-to-r ..." 
        : "bg-card border-border"
    }`}>
// ...
