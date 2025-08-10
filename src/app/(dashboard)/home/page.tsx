"use client";

import { useState, useEffect } from "react";
import { SwipeCard } from "@/components/pages/home/SwipeCard";
import { ActionButtons } from "@/components/pages/home/ActionButtons";
// import { MatchModal } from '@/components/pages/home/MatchModal';
import { useToast } from "@/hooks/use-toast";
import { useUserMatching } from "@/hooks/useUserMatching";
import { useHeaderData } from "@/hooks/useHeaderData";
import type { RankedUser } from "@/types/profile";
import type { StaticImageData } from "next/image";
import "./home.css";

const Index = () => {
  const { rankedUsers, isLoading, error, fetchRankedUsers } = useUserMatching();
  const [currentIndex, setCurrentIndex] = useState(0);
  // const [showMatch, setShowMatch] = useState(false);
  const { toast } = useToast();
  const { avatarUrl } = useHeaderData();

  // profiles là RankedUser[], chỉ format image cho UI
  const profiles = rankedUsers.map((user) => ({
    ...user,
    id: user.id || "", // Đảm bảo id luôn là string
    image: user.photos?.[0] || avatarUrl || "/default-avatar.png",
  }));

  const currentProfile = profiles[currentIndex];
  const nextProfile = profiles[currentIndex + 1];

  const handleSwipe = (
    direction: "left" | "right",
    profileId: string | number
  ) => {
    const profile = profiles.find((p) => p.id === profileId);
    if (profile) {
      toast({
        title: "Pass",
        description: `You passed on ${profile.name}`,
      });
    }
    // Chuyển sang profile tiếp theo
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
    }, 50);
  };

  const handleAction = (action: "pass" | "like" | "superlike" | "rewind") => {
    if (!currentProfile) return;

    switch (action) {
      case "pass":
        handleSwipe("left", currentProfile.id);
        break;
      case "like":
        handleSwipe("left", currentProfile.id);
        break;
      case "superlike":
        toast({
          title: "Super Like sent! ⭐",
          description: `You super liked ${currentProfile.name}`,
        });
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
            Đang tìm kiếm những người phù hợp với bạn...
          </p>
          <p className="text-sm text-gray-500 mt-2">
            AI đang phân tích và xếp hạng các profile
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
            Không tìm thấy người dùng phù hợp
          </p>
          <button
            onClick={fetchRankedUsers}
            className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
          >
            Tải lại
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
      {/* <MatchModal
        isOpen={showMatch}
        onClose={() => setShowMatch(false)}
        userImage="/api/placeholder/96/96"
        matchImage={matchedProfile?.image || ''}
        matchName={matchedProfile?.name || ''}
      /> */}
    </div>
  );
};

export default Index;
