import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConversationList } from './ConversationList';
import { ChatWindow } from './ChatWindow';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Conversation {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
}

interface Message {
  id: number;
  text: string;
  sender: 'me' | 'other';
  timestamp: string;
}

const mockConversations: Conversation[] = [
  {
    id: 1,
    name: "Emma",
    avatar: "/src/assets/profile1.jpg",
    lastMessage: "That sounds amazing! When are you free?",
    timestamp: "2m ago",
    unread: true
  },
  {
    id: 2,
    name: "Sophie",
    avatar: "/src/assets/profile3.jpg", 
    lastMessage: "I love that coffee shop too!",
    timestamp: "1h ago",
    unread: false
  },
  {
    id: 3,
    name: "Michael",
    avatar: "/src/assets/profile4.jpg",
    lastMessage: "Thanks for the match! 😊",
    timestamp: "2h ago",
    unread: true
  }
];

const mockMessages: Record<number, Message[]> = {
  1: [
    { id: 1, text: "Hey! Thanks for the match! 😊", sender: 'other', timestamp: "10:30 AM" },
    { id: 2, text: "Hi Emma! Nice to meet you!", sender: 'me', timestamp: "10:32 AM" },
    { id: 3, text: "I saw you love hiking. I just did a great trail last weekend!", sender: 'me', timestamp: "10:33 AM" },
    { id: 4, text: "That sounds amazing! When are you free?", sender: 'other', timestamp: "10:35 AM" }
  ],
  2: [
    { id: 1, text: "That coffee shop photo looks incredible!", sender: 'me', timestamp: "9:15 AM" },
    { id: 2, text: "I love that coffee shop too!", sender: 'other', timestamp: "9:20 AM" }
  ],
  3: [
    { id: 1, text: "Thanks for the match! 😊", sender: 'other', timestamp: "8:45 AM" }
  ]
};

interface MessagesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MessagesModal = ({ isOpen, onClose }: MessagesModalProps) => {
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [conversations, setConversations] = useState(mockConversations);
  const [messages, setMessages] = useState(mockMessages);

  const handleSelectConversation = (conversationId: number) => {
    setSelectedConversation(conversationId);
    // Mark as read
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, unread: false }
          : conv
      )
    );
  };

  const handleSendMessage = (text: string) => {
    if (!selectedConversation) return;
    
    const newMessage: Message = {
      id: Date.now(),
      text,
      sender: 'me',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => ({
      ...prev,
      [selectedConversation]: [...(prev[selectedConversation] || []), newMessage]
    }));

    // Update conversation last message
    setConversations(prev =>
      prev.map(conv =>
        conv.id === selectedConversation
          ? { ...conv, lastMessage: text, timestamp: "now" }
          : conv
      )
    );
  };

  const handleBack = () => {
    setSelectedConversation(null);
  };

  const selectedConv = conversations.find(c => c.id === selectedConversation);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md h-[600px] p-0 bg-background border-border/50">
        <DialogHeader className="p-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            {selectedConversation && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <DialogTitle className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              {selectedConversation ? selectedConv?.name : 'Messages'}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {selectedConversation ? (
            <ChatWindow
              messages={messages[selectedConversation] || []}
              onSendMessage={handleSendMessage}
            />
          ) : (
            <ConversationList
              conversations={conversations}
              onSelectConversation={handleSelectConversation}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};