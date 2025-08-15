// Types for Tinder-like features: likes, matches, notifications, messages
// Following Clean Architecture principles

export interface Like {
  id: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
}

export interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  matched_at: string;
}

export interface Pass {
  id: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'like' | 'match' | 'message';
  data: {
    from?: string;
    with?: string;
    match_id?: string;
    message?: string;
  };
  created_at: string;
  is_read: boolean;
}

export interface Message {
  id: string;
  match_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  message_type: 'text' | 'image' | 'emoji';
  created_at: string;
  updated_at: string;
  is_read: boolean;
  is_deleted: boolean;
}

// Extended types for UI components
export interface MatchWithProfiles extends Match {
  user1_profile?: {
    id: string;
    name: string;
    photos: string[];
    age: number;
  };
  user2_profile?: {
    id: string;
    name: string;
    photos: string[];
    age: number;
  };
}

export interface NotificationWithProfile extends Notification {
  from_profile?: {
    id: string;
    name: string;
    image: string;
    age: number;
  };
}

// Service interfaces
export interface ILikeService {
  sendLike(receiverId: string): Promise<Like>;
  getLikesReceived(): Promise<Like[]>;
  getLikesSent(): Promise<Like[]>;
  removeLike(receiverId: string): Promise<void>;
  hasLiked(receiverId: string): Promise<boolean>;
}

export interface IMatchService {
  getMatches(): Promise<MatchWithProfiles[]>;
  getMatchById(matchId: string): Promise<MatchWithProfiles | null>;
  checkMatch(userId1: string, userId2: string): Promise<Match | null>;
  getMatchedUserIds(): Promise<string[]>;
}

export interface INotificationService {
  getNotifications(): Promise<NotificationWithProfile[]>;
  markAsRead(notificationId: string): Promise<void>;
  markAllAsRead(): Promise<void>;
  getUnreadCount(): Promise<number>;
  subscribeToNotifications(callback: (notification: Notification) => void): () => void;
}

export interface IMessageService {
  getMessages(matchId: string): Promise<Message[]>;
  sendMessage(matchId: string, content: string, messageType?: 'text' | 'image' | 'emoji'): Promise<Message>;
  markAsRead(messageId: string): Promise<void>;
  markMatchMessagesAsRead(matchId: string): Promise<void>;
  subscribeToMessages(matchId: string, callback: (message: Message) => void): () => void;
}

export interface IPassService {
  sendPass(receiverId: string): Promise<Pass>;
  getPassesSent(): Promise<Pass[]>;
  getPassedUserIds(): Promise<string[]>;
  hasPassedUser(receiverId: string): Promise<boolean>;
}

// Hook return types
export interface UseLikeReturn {
  sendLike: (receiverId: string) => Promise<void>;
  removeLike: (receiverId: string) => Promise<void>;
  hasLiked: (receiverId: string) => boolean;
  likesReceived: Like[];
  likesSent: Like[];
  isLoading: boolean;
  error: string | null;
  refreshLikes: () => Promise<void>;
  getUsersWhoLikedMe: () => Promise<string[]>;
}

export interface UseMatchReturn {
  matches: MatchWithProfiles[];
  isLoading: boolean;
  error: string | null;
  refreshMatches: () => Promise<void>;
  getMatchById: (matchId: string) => MatchWithProfiles | null;
  handleNewMatch: (match: MatchWithProfiles) => void;
  getMatchedUserIds: () => Promise<string[]>;
}

export type UseNotificationReturn = {
  notifications: NotificationWithProfile[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  subscribeToNotifications: () => () => void;
  handleNewNotification: (notification: NotificationWithProfile) => void;
  getNotificationMessage: (notification: NotificationWithProfile) => string;
  handleNotificationClick: (notification: NotificationWithProfile) => Promise<void>;
};

export interface UseMessageReturn {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string, messageType?: 'text' | 'image' | 'emoji') => Promise<void>;
  markAsRead: (messageId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshMessages: () => Promise<void>;
  handleNewMessage: (message: Message) => void;
}

export interface UsePassReturn {
  sendPass: (receiverId: string) => Promise<void>;
  hasPassedUser: (receiverId: string) => boolean;
  passesSent: Pass[];
  passedUserIds: string[];
  isLoading: boolean;
  error: string | null;
  refreshPasses: () => Promise<void>;
}
