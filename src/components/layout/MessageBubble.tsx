import { cn } from '@/lib/utils';

interface Message {
  id: number;
  text: string;
  sender: 'me' | 'other';
  timestamp: string;
}

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isMe = message.sender === 'me';

  return (
    <div className={cn(
      "flex",
      isMe ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "max-w-[70%] p-3 rounded-2xl",
        isMe 
          ? "bg-gradient-primary text-white rounded-br-md" 
          : "bg-muted text-foreground rounded-bl-md"
      )}>
        <p className="text-sm">{message.text}</p>
        <p className={cn(
          "text-xs mt-1",
          isMe ? "text-white/70" : "text-muted-foreground"
        )}>
          {message.timestamp}
        </p>
      </div>
    </div>
  );
};