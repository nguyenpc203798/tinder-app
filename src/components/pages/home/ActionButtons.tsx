import { Button } from "@/components/ui/button";
import { Heart, X, Star, RotateCcw } from 'lucide-react';

interface ActionButtonsProps {
  onPass: () => void;
  onLike: () => void;
  onSuperLike: () => void;
  onRewind: () => void;
}

export const ActionButtons = ({ onPass, onLike, onSuperLike, onRewind }: ActionButtonsProps) => {
  return (
    <div className="flex justify-center items-center gap-4 mt-8">
      {/* Rewind */}
      <Button
        onClick={onRewind}
        variant="outline"
        size="icon"
        className="w-12 h-12 rounded-full border-2 border-muted hover:border-accent hover:bg-accent/10 transition-all duration-200"
      >
        <RotateCcw className="w-5 h-5 text-muted-foreground" />
      </Button>
      
      {/* Pass */}
      <Button
        onClick={onPass}
        variant="outline"
        size="icon"
        className="w-16 h-16 rounded-full border-2 border-destructive hover:border-destructive hover:bg-destructive/10 transition-all duration-200 hover:scale-110"
      >
        <X className="w-6 h-6 text-destructive" />
      </Button>
      
      {/* Super Like */}
      <Button
        onClick={onSuperLike}
        variant="outline"
        size="icon"
        className="w-12 h-12 rounded-full border-2 border-blue-500 hover:border-blue-500 hover:bg-blue-500/10 transition-all duration-200"
      >
        <Star className="w-5 h-5 text-blue-500" />
      </Button>
      
      {/* Like */}
      <Button
        onClick={onLike}
        variant="outline"
        size="icon"
        className="w-16 h-16 rounded-full border-2 border-primary hover:border-primary hover:bg-primary/10 transition-all duration-200 hover:scale-110"
      >
        <Heart className="w-6 h-6 text-primary" />
      </Button>
      
      {/* Boost */}
      <Button
        variant="outline"
        size="icon"
        className="w-12 h-12 rounded-full border-2 border-accent hover:border-accent hover:bg-accent/10 transition-all duration-200"
      >
        <div className="w-5 h-5 bg-gradient-primary rounded-full" />
      </Button>
    </div>
  );
};