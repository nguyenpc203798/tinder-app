import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface Conversation {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
}

interface ConversationListProps {
  conversations: Conversation[];
  onSelectConversation: (id: number) => void;
}

export const ConversationList = ({ conversations, onSelectConversation }: ConversationListProps) => {
  return (
    <div className="p-4 space-y-3 overflow-y-auto max-h-full">
      {conversations.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No messages yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Start swiping to get matches!
          </p>
        </div>
      ) : (
        conversations.map((conversation) => (
          <div
            key={conversation.id}
            onClick={() => onSelectConversation(conversation.id)}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
          >
            <Avatar className="w-12 h-12 ring-2 ring-primary/20">
              <AvatarImage src={conversation.avatar} alt={conversation.name} />
              <AvatarFallback>{conversation.name[0]}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm truncate">
                  {conversation.name}
                </h4>
                <span className="text-xs text-muted-foreground">
                  {conversation.timestamp}
                </span>
              </div>
              <p className="text-sm text-muted-foreground truncate mt-1">
                {conversation.lastMessage}
              </p>
            </div>
            
            {conversation.unread && (
              <Badge className="w-2 h-2 p-0 bg-primary rounded-full" />
            )}
          </div>
        ))
      )}
    </div>
  );
};