import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Briefcase, GraduationCap } from "lucide-react";
import type { StaticImageData } from "next/image";
import Image from "next/image";
import type { UserProfile } from "@/types/profile";


interface SwipeCardProps {
  profile: UserProfile & { image: string | StaticImageData };
  onSwipe: (direction: "left" | "right", profileId: string | number) => void;
  style?: React.CSSProperties;
}

export const SwipeCard = ({ profile, onSwipe, style }: SwipeCardProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  // Reset card state khi profile thay đổi để tránh lỗi chỉ vuốt được 2 card
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    if (cardRef.current) {
      cardRef.current.style.transition = "all 0.5s";
    }
    const rect = cardRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left - rect.width / 2,
        y: e.clientY - rect.top - rect.height / 2,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = e.clientX - centerX - dragOffset.x;
    const deltaY = e.clientY - centerY - dragOffset.y;

    const rotation = Math.min(Math.max(deltaX / 10, -15), 15);

    cardRef.current.style.transform = `translate(${deltaX}px, ${deltaY}px) rotate(${rotation}deg)`;

    // Add visual feedback
    const opacity = Math.max(0, 1 - Math.abs(deltaX) / 150);
    cardRef.current.style.opacity = opacity.toString();
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging || !cardRef.current) return;

    setIsDragging(false);

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const deltaX = e.clientX - centerX - dragOffset.x;

    if (Math.abs(deltaX) > 100) {
      const direction = deltaX > 0 ? "right" : "left";
      const animationClass =
        direction === "left" ? "animate-swipe-left" : "animate-swipe-right";

      cardRef.current.classList.add(animationClass);

      setTimeout(() => {
        onSwipe(direction, profile.id || "");
      }, 1000);
    } else {
      // Snap back
      cardRef.current.style.transform = "translate(0px, 0px) rotate(0deg)";
      cardRef.current.style.opacity = "1";
    }
  };

  // Touch event handlers cho mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    if (cardRef.current) {
      cardRef.current.style.transition = "all 0.5s";
    }
    const rect = cardRef.current?.getBoundingClientRect();
    if (rect) {
      const touch = e.touches[0];
      setDragOffset({
        x: touch.clientX - rect.left - rect.width / 2,
        y: touch.clientY - rect.top - rect.height / 2,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const touch = e.touches[0];
    const deltaX = touch.clientX - centerX - dragOffset.x;
    const deltaY = touch.clientY - centerY - dragOffset.y;
    const rotation = Math.min(Math.max(deltaX / 10, -15), 15);
    cardRef.current.style.transform = `translate(${deltaX}px, ${deltaY}px) rotate(${rotation}deg)`;
    const opacity = Math.max(0, 1 - Math.abs(deltaX) / 150);
    cardRef.current.style.opacity = opacity.toString();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging || !cardRef.current) return;
    setIsDragging(false);
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - centerX - dragOffset.x;
    if (Math.abs(deltaX) > 100) {
      const direction = deltaX > 0 ? "right" : "left";
      const animationClass =
        direction === "left" ? "animate-swipe-left" : "animate-swipe-right";
      cardRef.current.classList.add(animationClass);
      setTimeout(() => {
        onSwipe(direction, profile.id || "");
      }, 1000);
    } else {
      cardRef.current.style.transform = "translate(0px, 0px) rotate(0deg)";
      cardRef.current.style.opacity = "1";
    }
  };

  return (
    <Card
      ref={cardRef}
      className="absolute w-80 h-[500px] overflow-hidden shadow-card hover:shadow-hover cursor-grab active:cursor-grabbing select-none"
      style={style}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Main Image */}
      <div className="relative h-3/4 overflow-hidden">
        <Image
          src={profile.image}
          alt={profile.name}
          fill
          className="w-full h-full object-cover"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Distance Badge */}
        <Badge className="absolute top-4 right-4 bg-white/90 text-primary border-0">
          <MapPin className="w-3 h-3 mr-1" />
          {profile.distance}km away
        </Badge>

        {/* Name and Age */}
        <div className="absolute bottom-4 left-4 text-white">
          <h3 className="text-2xl font-bold">
            {profile.name}, {profile.age}
          </h3>
        </div>
      </div>

      {/* Profile Details */}
      <div className="p-4 h-1/4 flex flex-col justify-between bg-white">
        <p className="text-foreground/80 text-sm line-clamp-2">{profile.bio}</p>

        <div className="flex flex-wrap gap-2 mt-2">
          {profile.job_title && (
            <Badge variant="secondary" className="text-xs">
              <Briefcase className="w-3 h-3 mr-1" />
              {profile.job_title}
            </Badge>
          )}
          {profile.location && (
            <Badge variant="secondary" className="text-xs">
              <MapPin className="w-3 h-3 mr-1" />
              {profile.location}
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
};
