import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle } from 'lucide-react';
import Image from "next/image"
import type { StaticImageData } from "next/image";

interface MatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  userImage: string;
  matchImage: string | StaticImageData;
  matchName: string;
}

export const MatchModal = ({ isOpen, onClose, userImage, matchImage, matchName }: MatchModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto bg-gradient-primary border-0 text-white text-center">
        <div className="relative py-8">
          {/* It's a Match text */}
          <div className="mb-8">
            <h2 className="text-4xl font-bold mb-2 animate-bounce-in">It is a Match!</h2>
            <p className="text-white/90">You and {matchName} liked each other</p>
          </div>
          
          {/* Profile Images */}
          <div className="flex justify-center items-center mb-8 relative">
            <div className="relative">
              <Image 
                src={userImage} 
                alt="Your profile"
                width={96}
                height={96}
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
              />
            </div>
            
            <div className="mx-4 animate-heart-beat">
              <Heart className="w-8 h-8 text-white fill-white" />
            </div>
            
            <div className="relative">
              <Image 
                src={matchImage} 
                alt={matchName}
                width={96}
                height={96}
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
              />
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <Button
              onClick={onClose}
              variant="outline"
              className="bg-white/20 border-white/30 text-white hover:bg-white/30 px-8"
            >
              Keep Swiping
            </Button>
            
            <Button
              className="bg-white text-primary hover:bg-white/90 px-8"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Send Message
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};