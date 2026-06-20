import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface FailureWisdomSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function FailureWisdomSearch({ searchQuery, onSearchChange }: FailureWisdomSearchProps) {
  return (
    <div className="relative max-w-md">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
      <Input
        type="text"
        placeholder="Search mistakes..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-12 bg-white dark:bg-neutral-900/50 border-gray-300 dark:border-neutral-800 rounded-xl h-12 focus-visible:ring-red-600 focus-visible:border-red-600"
      />
    </div>
  );
}
