import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessagesModal } from './MessagesModal';
import { MessageCircle, User as UserIcon, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export const Header = () => {
  const [showMessages, setShowMessages] = useState(false);
  const navigate = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [fallback, setFallback] = useState("U");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setUser(data.user);
        setAvatarUrl(data.user.user_metadata?.avatar_url || "");
        setFallback(data.user.email?.[0]?.toUpperCase() || "U");
      }
    });
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    navigate.push("/");
  };

  return (
    <>
      <MessagesModal 
        isOpen={showMessages} 
        onClose={() => setShowMessages(false)} 
      />
    <header className="flex items-center justify-between p-4 border-b border-border/50">
      {/* Left - Profile */}
      <Button 
        variant="ghost" 
        size="icon" 
        className="rounded-full"
        onClick={() => navigate.push('/profile')}
      >
        <Avatar className="w-8 h-8">
          {avatarUrl ? (
            <Image src={avatarUrl} alt="Avatar" width={32} height={32} className="rounded-full" />
          ) : (
            <AvatarFallback>{user ? fallback : <UserIcon className="w-4 h-4" />}</AvatarFallback>
          )}
        </Avatar>
      </Button>
      {/* Center - Logo */}
      <Link href="/home" passHref>
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="relative">
            <Image src="/images/tinderlogo.png" className='w-8 object-contain' width={100} height={40} alt="Logo" />
            <div className="absolute inset-0 bg-gradient-primary opacity-50 blur-sm rounded-full" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Tinder
          </h1>
        </div>
      </Link>
      {/* Right - Messages and Settings */}
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full relative"
          onClick={() => setShowMessages(true)}
        >
          <MessageCircle className="w-5 h-5" />
          <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 bg-primary text-primary-foreground text-xs flex items-center justify-center">
            3
          </Badge>
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full" onClick={handleLogout} title="Đăng xuất">
          <LogOut className="w-5 h-5" />
        </Button>
      </div>
    </header>
    </>
  );
};