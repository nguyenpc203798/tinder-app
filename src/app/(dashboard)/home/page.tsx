"use client";

import { useState, useEffect } from 'react';
import { SwipeCard } from '@/components/pages/home/SwipeCard';
import { ActionButtons } from '@/components/pages/home/ActionButtons';
import { MatchModal } from '@/components/pages/home/MatchModal';
import { useToast } from '@/hooks/use-toast';
import profile1 from '@/assets/profile1.jpg';
import profile2 from '@/assets/profile2.jpg';
import profile3 from '@/assets/profile3.jpg';
import profile4 from '@/assets/profile4.jpg';
import type { StaticImageData } from "next/image";
import './home.css'

interface Profile {
  id: number;
  name: string;
  age: number;
  image: string | StaticImageData;
  distance: number;
  bio: string;
  job?: string;
  education?: string;
  location: string;
}

const sampleProfiles: Profile[] = [
  {
    id: 1,
    name: "Emma",
    age: 25,
    image: profile1,
    distance: 2,
    bio: "Love hiking, good coffee, and spontaneous adventures. Looking for someone to explore the city with! 🌟",
    job: "Marketing Manager",
    education: "UC Berkeley",
    location: "San Francisco"
  },
  {
    id: 2,
    name: "James",
    age: 27,
    image: profile2,
    distance: 5,
    bio: "Software engineer by day, chef by night. Let's cook something amazing together! 👨‍🍳",
    job: "Software Engineer",
    education: "Stanford",
    location: "Palo Alto"
  },
  {
    id: 3,
    name: "Sophie",
    age: 23,
    image: profile3,
    distance: 3,
    bio: "Art student with a passion for photography and travel. Always looking for the next great shot! 📸",
    job: "Art Student",
    education: "RISD",
    location: "San Francisco"
  },
  {
    id: 4,
    name: "Michael",
    age: 26,
    image: profile4,
    distance: 7,
    bio: "Fitness enthusiast and dog lover. Weekend warrior who enjoys rock climbing and beach volleyball 🏐",
    job: "Personal Trainer",
    education: "UCLA",
    location: "Los Angeles"
  }
];

const Index = () => {
  const [profiles] = useState<Profile[]>(sampleProfiles);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState<Profile | null>(null);
  const { toast } = useToast();

  const currentProfile = profiles[currentIndex];
  const nextProfile = profiles[currentIndex + 1];

  const handleSwipe = (direction: 'left' | 'right', profileId: number) => {
    const profile = profiles.find(p => p.id === profileId);
    
    if (direction === 'right' && profile) {
      // Simulate match probability (30% chance)
      const isMatch = Math.random() < 0.3;
      
      if (isMatch) {
        setMatchedProfile(profile);
        setShowMatch(true);
      } else {
        toast({
          title: "Like sent!",
          description: `You liked ${profile.name}`,
        });
      }
    } else if (direction === 'left' && profile) {
      toast({
        title: "Pass",
        description: `You passed on ${profile.name}`,
      });
    }
    
    // Move to next profile
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
    }, 100);
  };

  const handleAction = (action: 'pass' | 'like' | 'superlike' | 'rewind') => {
    if (!currentProfile) return;
    
    switch (action) {
      case 'pass':
        handleSwipe('left', currentProfile.id);
        break;
      case 'like':
        handleSwipe('right', currentProfile.id);
        break;
      case 'superlike':
        toast({
          title: "Super Like sent! ⭐",
          description: `You super liked ${currentProfile.name}`,
        });
        setCurrentIndex(prev => prev + 1);
        break;
      case 'rewind':
        if (currentIndex > 0) {
          setCurrentIndex(prev => prev - 1);
          toast({
            title: "Rewound!",
            description: "Brought back the last profile",
          });
        }
        break;
    }
  };

  // Reset profiles when we run out
  useEffect(() => {
    if (currentIndex >= profiles.length) {
      setTimeout(() => {
        setCurrentIndex(0);
        toast({
          title: "That's everyone for now!",
          description: "Check back later for more profiles",
        });
      }, 1000);
    }
  }, [currentIndex, profiles.length, toast]);

  return (
    <div className="min-h-screen bg-gradient-bg">
      <main className="container mx-auto px-4 py-8 flex flex-col items-center">
        {/* Card Stack */}
        <div className="relative w-80 h-[500px] mb-8">
          {currentIndex < profiles.length ? (
            <>
              {/* Next card (background) */}
              {nextProfile && (
                <SwipeCard 
                  profile={nextProfile}
                  onSwipe={handleSwipe}
                  style={{ 
                    zIndex: 1,
                    transform: 'scale(0.95) translateY(10px)',
                    opacity: 0.7
                  }}
                />
              )}
              
              {/* Current card (foreground) */}
              <SwipeCard 
                profile={currentProfile}
                onSwipe={handleSwipe}
                style={{ zIndex: 2 }}
              />
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">That is everyone!</h3>
                <p className="text-muted-foreground">Check back later for more profiles</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        {currentIndex < profiles.length && (
          <ActionButtons
            onPass={() => handleAction('pass')}
            onLike={() => handleAction('like')}
            onSuperLike={() => handleAction('superlike')}
            onRewind={() => handleAction('rewind')}
          />
        )}
      </main>
      
      {/* Match Modal */}
      <MatchModal
        isOpen={showMatch}
        onClose={() => setShowMatch(false)}
        userImage="/api/placeholder/96/96"
        matchImage={matchedProfile?.image || ''}
        matchName={matchedProfile?.name || ''}
      />
    </div>
  );
};

export default Index;
