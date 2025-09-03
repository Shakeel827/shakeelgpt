import { useState, useEffect } from "react";
import PandaLogo from "./PandaLogo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap, Brain, Cpu, Sparkles, Copy, ExternalLink } from "lucide-react";
import { toast } from "@/components/ui/sonner";

interface ChatMessageProps {
  message: {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: Date;
    model?: string;
    image?: string;
    imageUrl?: string;
    isStreaming?: boolean;
  };
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isCodeBlock = message.content.includes('```');
  const isUser = message.role === 'user';

  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      toast.success("📋 Copied!", {
        description: "Message copied to clipboard",
        duration: 1000,
      });
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error("Copy failed");
    }
  };

  const openImageInNewTab = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className={`flex gap-2 sm:gap-3 md:gap-4 p-2 sm:p-3 md:p-4 animate-fade-in ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex-shrink-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow relative overflow-hidden">
            <PandaLogo className="w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6" />
            <div className="absolute -inset-1 border border-primary/30 rounded-full animate-pulse"></div>
          </div>
        </div>
      )}
      
      <div className={`max-w-[85%] sm:max-w-[80%] md:max-w-[75%] ${isUser ? 'order-first' : ''}`}>
        <div className={`
          backdrop-blur-xl border border-glass-border shadow-glass relative overflow-hidden
          ${isUser 
            ? 'bg-gradient-primary text-primary-foreground ml-auto rounded-l-2xl rounded-tr-2xl' 
            : 'bg-gradient-glass text-foreground rounded-r-2xl rounded-tl-2xl'
          }
          p-3 sm:p-4 md:p-4 transition-all duration-300 hover:shadow-glow
        `}>
          
          {/* User uploaded image */}
          {message.image && (
            <div className="mb-3 group relative">
              <img 
                src={message.image} 
                alt="User uploaded" 
                className="max-w-full max-h-48 sm:max-h-64 rounded-lg transition-transform duration-300 hover:scale-105 cursor-pointer object-cover shadow-glow" 
                onClick={() => openImageInNewTab(message.image!)}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openImageInNewTab(message.image!)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-8 w-8 p-0 bg-black/50 hover:bg-black/70 rounded-full"
              >
                <ExternalLink className="w-4 h-4 text-white" />
              </Button>
            </div>
          )}

          {/* AI generated image */}
          {message.imageUrl && (
            <div className="mb-3 group relative">
              <div className="relative">
                {!imageLoaded && !imageError && (
                  <div className="w-full h-48 sm:h-64 bg-muted/20 rounded-lg flex items-center justify-center">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                      <span className="text-sm">Generating masterpiece...</span>
                    </div>
                  </div>
                )}
                
                <img 
                  src={message.imageUrl} 
                  alt="AI generated masterpiece" 
                  className={`max-w-full max-h-48 sm:max-h-64 rounded-lg transition-all duration-300 hover:scale-105 cursor-pointer object-cover shadow-intense ${
                    imageLoaded ? 'opacity-100' : 'opacity-0 absolute inset-0'
                  }`}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => {
                    setImageError(true);
                    setImageLoaded(false);
                  }}
                  onClick={() => openImageInNewTab(message.imageUrl!)}
                />
                
                {imageError && (
                  <div className="w-full h-48 sm:h-64 bg-muted/20 rounded-lg flex items-center justify-center">
                    <span className="text-sm text-muted-foreground">Image generation in progress...</span>
                  </div>
                )}
              </div>
              
              {imageLoaded && (
                <>
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-gradient-primary text-primary-foreground text-xs">
                      <Sparkles className="w-3 h-3 mr-1" />
                      AI Generated
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openImageInNewTab(message.imageUrl!)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-8 w-8 p-0 bg-black/50 hover:bg-black/70 rounded-full"
                  >
                    <ExternalLink className="w-4 h-4 text-white" />
                  </Button>
                </>
              )}
            </div>
          )}
          
          {isCodeBlock ? (
            <pre className={`
              font-mono text-xs sm:text-sm overflow-x-auto p-2 sm:p-3 rounded-lg border max-h-64 sm:max-h-80 relative
              ${isUser ? 'bg-black/20 border-white/20' : 'bg-muted/10 border-border'}
            `}>
              <code className="relative">
                {message.content}
              </code>
            </pre>
          ) : (
            <div className="prose prose-invert max-w-none">
              <div className="whitespace-pre-wrap leading-relaxed text-sm md:text-base">
                {message.content
                  .split('\n').map((line, index) => {
                    if (!line.trim()) return <br key={index} />;
                    
                    // Enhanced markdown formatting
                    if (line.trim().startsWith('**') && line.trim().endsWith('**')) {
                      return (
                        <div key={index} className="font-bold text-primary mb-2 text-base md:text-lg flex items-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          {line.replace(/\*\*/g, '')}
                        </div>
                      );
                    }
                    
                    if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
                      return (
                        <div key={index} className="flex items-start gap-2 ml-2 mb-1">
                          <span className="text-primary mt-1 text-xs font-bold animate-pulse">●</span>
                          <span className="flex-1 break-words">{line.replace(/^[•\-]\s*/, '')}</span>
                        </div>
                      );
                    }
                    
                    return <div key={index} className="mb-1 break-words">{line}</div>;
                  })}
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-glass-border opacity-70">
            <div className="flex items-center gap-2">
              <span className="text-xs">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              {message.content.length > 0 && (
                <Badge variant="outline" className="bg-gradient-glass border-glass-border text-xs">
                  {message.content.length} chars
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={copyMessage}
                className="h-6 w-6 p-0 opacity-70 hover:opacity-100 transition-opacity"
              >
                <Copy className="w-3 h-3" />
              </Button>
              {message.model && (
                <span className="text-xs text-muted-foreground truncate ml-2 flex items-center gap-1">
                  <Brain className="w-3 h-3" />
                  <span className="hidden sm:inline">{message.model}</span>
                  <span className="sm:hidden">{message.model.split(' ')[0]}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {isUser && (
        <div className="flex-shrink-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full bg-secondary flex items-center justify-center border border-border shadow-glow">
            <span className="text-sm font-medium">👤</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatMessage;