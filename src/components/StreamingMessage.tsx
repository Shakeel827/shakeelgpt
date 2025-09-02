import { useState, useEffect } from "react";
import PandaLogo from "./PandaLogo";
import { Badge } from "@/components/ui/badge";
import { Zap, Brain } from "lucide-react";

interface StreamingMessageProps {
  message: {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: Date;
    model?: string;
    image?: string;
    imageUrl?: string;
  };
  isActive?: boolean;
}

const StreamingMessage = ({ message, isActive = true }: StreamingMessageProps) => {
  const [showCursor, setShowCursor] = useState(true);
  const [displayedContent, setDisplayedContent] = useState(message.content);
  
  useEffect(() => {
    setDisplayedContent(message.content);
  }, [message.content]);

  useEffect(() => {
    if (!isActive) {
      setShowCursor(false);
      return;
    }

    const interval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => clearInterval(interval);
  }, [isActive]);

  const isCodeBlock = displayedContent.includes('```');
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-2 md:gap-3 p-2 md:p-4 animate-fade-in ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow relative">
            <PandaLogo className="w-4 h-4 md:w-6 md:h-6" animate={isActive} />
            {isActive && (
              <div className="absolute -inset-1 border-2 border-primary/30 rounded-full animate-spin"></div>
            )}
          </div>
        </div>
      )}
      
      <div className={`max-w-[85%] md:max-w-[75%] ${isUser ? 'order-first' : ''}`}>
        <div className={`
          backdrop-blur-xl border border-glass-border shadow-glass relative overflow-hidden
          ${isUser 
            ? 'bg-gradient-primary text-primary-foreground ml-auto rounded-l-2xl rounded-tr-2xl' 
            : 'bg-gradient-glass text-foreground rounded-r-2xl rounded-tl-2xl'
          }
          p-3 md:p-4 transition-all duration-300 hover:shadow-glow
        `}>
          
          {/* Streaming indicator */}
          {isActive && !isUser && (
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-primary animate-pulse"></div>
          )}

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
                className="max-w-full max-h-64 rounded-lg transition-transform duration-300 hover:scale-105 cursor-pointer object-cover shadow-glow" 
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
          
          {isCodeBlock ? (
            <pre className={`
              font-mono text-xs sm:text-sm overflow-x-auto p-3 rounded-lg border max-h-80 relative
              ${isUser ? 'bg-black/20 border-white/20' : 'bg-muted/10 border-border'}
            `}>
              <code className="relative">
                {displayedContent}
                {isActive && showCursor && (
                  <span className="animate-pulse ml-1 text-primary font-bold">▋</span>
                )}
              </code>
            </pre>
          ) : (
            <div className="prose prose-invert max-w-none">
              <div className="whitespace-pre-wrap leading-relaxed text-sm md:text-base">
                {displayedContent
                  .split('\n').map((line, index) => {
                    if (!line.trim()) return <br key={index} />;
                    
                    // Enhanced markdown-like formatting
                    if (line.trim().startsWith('**') && line.trim().endsWith('**')) {
                      return (
                        <div key={index} className="font-bold text-primary mb-2 text-base md:text-lg">
                          {line.replace(/\*\*/g, '')}
                        </div>
                      );
                    }
                    
                    if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
                      return (
                        <div key={index} className="flex items-start gap-2 ml-2 mb-1">
                          <span className="text-primary mt-1 text-xs font-bold">●</span>
                          <span className="flex-1 break-words">{line.replace(/^[•\-]\s*/, '')}</span>
                        </div>
                      );
                    }
                    
                    return <div key={index} className="mb-1 break-words">{line}</div>;
                  })}
                {isActive && showCursor && (
                  <span className="animate-pulse ml-1 text-primary font-bold text-lg">▋</span>
                )}
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-glass-border opacity-70">
            <div className="flex items-center gap-2">
              <span className="text-xs">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              {isActive && (
                <Badge variant="outline" className="bg-gradient-glass border-glass-border text-xs animate-pulse">
                  <Zap className="w-3 h-3 mr-1" />
                  Streaming
                </Badge>
              )}
            </div>
            {message.model && (
              <span className="text-xs text-muted-foreground truncate ml-2 flex items-center gap-1">
                <Brain className="w-3 h-3" />
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

export default StreamingMessage;