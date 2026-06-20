import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

interface FavoriteFilterButtonProps {
  showFavoritesOnly: boolean;
  onToggle: () => void;
  favoriteCount: number;
  totalCount: number;
}

export function FavoriteFilterButton({
  showFavoritesOnly,
  onToggle,
  favoriteCount,
  totalCount,
}: FavoriteFilterButtonProps) {
  return (
    <Button
      variant={showFavoritesOnly ? "default" : "outline"}
      onClick={onToggle}
      className="cursor-pointer"
    >
      <Star
        className={`h-4 w-4 mr-2 ${
          showFavoritesOnly ? "fill-yellow-500 text-yellow-500" : ""
        }`}
      />
      {showFavoritesOnly
        ? `Favorites (${favoriteCount})`
        : `All (${totalCount})`}
    </Button>
  );
}
