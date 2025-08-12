"use client";

import { useState, useEffect, useRef } from "react";
import { SwipeCard } from "@/components/pages/home/SwipeCard";
import { ActionButtons } from "@/components/pages/home/ActionButtons";
import { MatchModal } from '@/components/pages/home/MatchModal';
import { useToast } from "@/hooks/use-toast";
import { useUserMatching } from "@/hooks/useUserMatching";
import { RankedUser } from '@/types/profile';
import { useHeaderData } from "@/hooks/useHeaderData";
import { useLike } from "@/hooks/useLike";
import { useMatch } from "@/hooks/useMatch";

import "./home.css";

interface SwipeCardHandle {
  swipe: (direction: 'left' | 'right') => void;
}

const Index = () => {
  const { rankedUsers, isLoading, error, fetchRankedUsers } = useUserMatching();
  const { sendLike, getUsersWhoLikedMe } = useLike();
  const { handleNewMatch, getMatchedUserIds } = useMatch();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState<RankedUser | null>(null);
  const [usersWhoLikedMe, setUsersWhoLikedMe] = useState<Array<string>>([]);
  const [matchedUserIds, setMatchedUserIds] = useState<Array<string>>([]);
  const { toast } = useToast();
  const { avatarUrl, photos } = useHeaderData();
  const swipeCardRef = useRef<SwipeCardHandle | null>(null); // Nếu có type SwipeCardHandle thì thay unknown bằng type đó

  // Load users who liked me for priority display
  useEffect(() => {
    const loadUsersWhoLikedMe = async () => {
      try {
        const likedMeIds = await getUsersWhoLikedMe();
        console.log("likedMeIds", likedMeIds);
        setUsersWhoLikedMe(likedMeIds);
      } catch (error) {
        console.error('Error loading users who liked me:', error);
      }
    };
    loadUsersWhoLikedMe();
  }, [getUsersWhoLikedMe]);

  // Load matched user IDs to exclude from swipe stack
  useEffect(() => {
    const loadMatchedUserIds = async () => {
      try {
        const matchedIds = await getMatchedUserIds();
        console.log("matchedUserIds", matchedIds);
        setMatchedUserIds(matchedIds);
      } catch (error) {
        console.error('Error loading matched user IDs:', error);
      }
    };
    loadMatchedUserIds();
  }, [getMatchedUserIds]);

  // Filter out matched users, prioritize users who liked me, then sort by AI compatibility score
  const profiles = rankedUsers
    .filter((user) => !matchedUserIds.includes(user.id || "")) // Lọc bỏ người đã match
    .map((user) => ({
      ...user,
      id: user.id || "", // Đảm bảo id luôn là string
      image: user.photos?.[0] || avatarUrl || "/default-avatar.png",
      hasLikedMe: usersWhoLikedMe.includes(user.id || ""),
    }))
    .sort((a, b) => {
      // Ưu tiên người đã like mình trước
      if (a.hasLikedMe && !b.hasLikedMe) return -1;
      if (!a.hasLikedMe && b.hasLikedMe) return 1;
      // Sau đó sort theo AI compatibility score
      return (b.compatibilityScore || 0) - (a.compatibilityScore || 0);
    });

  const currentProfile = profiles[currentIndex];
  const nextProfile = profiles[currentIndex + 1];

  const handleSwipe = async (
    direction: "left" | "right",
    profileId: string | number
  ) => {
    const profile = profiles.find((p) => p.id === profileId);
    if (!profile) return;

    if (direction === "right") {
      // Send like
      try {
        await sendLike(profile.id);
        
        // Check if it's a match (they already liked us)
        if (profile.hasLikedMe) {
          setMatchedProfile(profile);
          setShowMatch(true);
          
          // Handle new match notification
          handleNewMatch({
            id: `temp-${Date.now()}`,
            user1_id: profile.id,
            user2_id: "current-user", // Will be replaced by actual user ID
            matched_at: new Date().toISOString(),
            user1_profile: {
              id: profile.id,
              name: profile.name,
              photos: profile.photos,
              age: profile.age || 25,
            },
            user2_profile: undefined,
          });
        } else {
          toast({
            title: "Liked! 💖",
            description: `You liked ${profile.name}`,
          });
        }
      } catch (error) {
        console.error('Error sending like:', error);
      }
    } else {
      // Pass
      toast({
        title: "Skipped",
        description: `You skipped ${profile.name}`,
      });
    }
    
    // Chuyển sang profile tiếp theo
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
    }, 50);
  };

  const handleAction = async (action: "pass" | "like" | "superlike" | "rewind") => {
    if (!currentProfile) return;

    switch (action) {
      case "pass":
        handleSwipe("left", currentProfile.id);
        break;
      case "like":
        if (swipeCardRef.current) {
          swipeCardRef.current.swipe('right');
        } else {
          handleSwipe("right", currentProfile.id);
        }
        break;
      case "superlike":
        // Super like is also a like, but with special notification
        try {
          await sendLike(currentProfile.id);
          toast({
            title: "Super Like sent! ⭐",
            description: `You super liked ${currentProfile.name}`,
          });
          
          // Check for match
          if (currentProfile.hasLikedMe) {
            setMatchedProfile(currentProfile);
            setShowMatch(true);
          }
        } catch (error) {
          console.error('Error sending super like:', error);
        }
        setCurrentIndex((prev) => prev + 1);
        break;
      case "rewind":
        if (currentIndex > 0) {
          setCurrentIndex((prev) => prev - 1);
          toast({
            title: "Rewound!",
            description: "Brought back the last profile",
          });
        }
        break;
    }
  };

  // Setup realtime match subscription
  useEffect(() => {
    // This will automatically handle new matches via realtime
    // No need for polling, the subscription will trigger handleNewMatch
    return () => {
      // Cleanup handled by useMatch hook
    };
  }, []);

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

  // Conditional rendering để tránh vi phạm Rules of Hooks
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">
            Searching for compatible matches...
          </p>
          <p className="text-sm text-gray-500 mt-2">
            AI is analyzing and ranking profiles
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg text-red-600 mb-4">Có lỗi xảy ra: {error}</p>
          <button
            onClick={fetchRankedUsers}
            className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-4">
            No matching users found
          </p>
          <button
            onClick={fetchRankedUsers}
            className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }

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
                  key={nextProfile.id}
                  profile={nextProfile}
                  onSwipe={(dir, id) => handleSwipe(dir, id)}
                  style={{
                    zIndex: 1,
                    transform: 'scale(0.95) translateY(10px)',
                    opacity: 0.7,
                    transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)'
                  }}
                />
              )}

              {/* Current card (foreground) */}
              <SwipeCard
                key={currentProfile.id}
                profile={currentProfile}
                onSwipe={(dir, id) => handleSwipe(dir, id)}
                style={{ zIndex: 2, transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)' }}
              />
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">
                  That is everyone!
                </h3>
                <p className="text-muted-foreground">
                  Check back later for more profiles
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {currentIndex < profiles.length && (
          <ActionButtons
            onPass={() => handleAction("pass")}
            onLike={() => handleAction("like")}
            onSuperLike={() => handleAction("superlike")}
            onRewind={() => handleAction("rewind")}
          />
        )}
      </main>

      {/* Match Modal */}
      {showMatch && matchedProfile && (
        <MatchModal
          isOpen={showMatch}
          onClose={() => setShowMatch(false)}
          userImage={
            (photos && photos.length > 0 && photos[0]) ||
            avatarUrl ||
            "/default-avatar.png"
          }
          matchImage={
            (matchedProfile?.photos && matchedProfile.photos.length > 0 && matchedProfile.photos[0]) ||
            "/default-avatar.png"
          }
          matchName={matchedProfile?.name || "Someone"}
        />
      )}
    </div>
  );
};

export default Index;
