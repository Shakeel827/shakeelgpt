import { useState, useEffect } from "react";
import PandaLogo from "./PandaLogo";

interface ChatMessageProps {
  message: {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: Date;
    model?: string;
    image?: string;
    imageUrl?: string;
  };
  isTyping?: boolean;
}

const ChatMessage = ({ message, isTyping = false }: ChatMessageProps) => {
  const [displayedContent, setDisplayedContent] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  
  useEffect(() => {
    if (message.role === 'assistant' && !isTyping) {
      setDisplayedContent("");
      let index = 0;
      const text = message.content;
      
      const typeWriter = () => {
        if (index < text.length) {
          setDisplayedContent(text.slice(0, index + 1));
          index++;
          setTimeout(typeWriter, 15); // Slightly slower for better readability
        } else {
          setShowCursor(false);
        }
      };
      
      setTimeout(typeWriter, 100);
    } else {
      setDisplayedContent(message.content);
      setShowCursor(false);
    }
  }, [message.content, message.role, isTyping]);

  const isCodeBlock = message.content.includes('```');
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 p-3 md:p-4 animate-fade-in ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow">
            <PandaLogo className="w-4 h-4 md:w-6 md:h-6" animate={isTyping} />
          </div>
        </div>
      )}
      
      <div className={`max-w-[85%] md:max-w-[75%] ${isUser ? 'order-first' : ''}`}>
        <div className={`
          backdrop-blur-xl border border-glass-border shadow-glass
          ${isUser 
            ? 'bg-gradient-primary text-primary-foreground ml-auto rounded-l-2xl rounded-tr-2xl' 
            : 'bg-gradient-glass text-foreground rounded-r-2xl rounded-tl-2xl'
          }
          p-3 md:p-4 transition-all duration-300 hover:shadow-glow
        `}>
          {/* User uploaded image */}
          {message.image && (
            <div className="mb-3 group">
              <img 
                src={message.image} 
                alt="User uploaded" 
                className="max-w-full max-h-64 rounded-lg transition-transform duration-300 hover:scale-105 cursor-pointer object-cover" 
              />
            </div>
          )}

          {/* AI generated image */}
          {message.imageUrl && (
            <div className="mb-3 group">
              <img 
                src={message.imageUrl} 
                alt="AI generated" 
                className="max-w-full max-h-64 rounded-lg transition-transform duration-300 hover:scale-105 cursor-pointer object-cover" 
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
          
          {isCodeBlock ? (
            <pre className={`
              font-mono text-xs sm:text-sm overflow-x-auto p-3 rounded-lg border max-h-80
              ${isUser ? 'bg-black/20 border-white/20' : 'bg-muted border-border'}
            `}>
              <code>{displayedContent}</code>
            </pre>
          ) : (
            <div className="prose prose-invert max-w-none">
              <div className="whitespace-pre-wrap leading-relaxed text-sm md:text-base">
                {displayedContent
                  .split('\n').map((line, index) => {
                    if (!line.trim()) return <br key={index} />;
                    
                    // Handle bullet points
                    if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
                      return (
                        <div key={index} className="flex items-start gap-2 ml-2 mb-1">
                          <span className="text-primary mt-1 text-xs">•</span>
                          <span className="flex-1 break-words">{line.replace(/^[•\-]\s*/, '')}</span>
                        </div>
                      );
                    }
                    
                    return <div key={index} className="mb-1 break-words">{line}</div>;
                  })}
                {message.role === 'assistant' && showCursor && (
                  <span className="animate-pulse ml-1 text-primary">▋</span>
                )}
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-glass-border opacity-70">
            <span className="text-xs">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            {message.model && (
              <span className="text-xs text-muted-foreground truncate ml-2">
                {message.model}
              </span>
            )}
          </div>
        </div>
      </div>
      
      {isUser && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-secondary flex items-center justify-center border border-border">
            <span className="text-sm font-medium">👤</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatMessage;