import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ChatMessage from "./ChatMessage";
import TypingIndicator from "./TypingIndicator";
import ServiceSelector from "./ServiceSelector";
import ContactDialog from "./ContactDialog";
import CodeInterface from "./CodeInterface";
import VercelDeploy from "./VercelDeploy";
import { aiService } from "@/services/aiService";
import { Send, Plus, Copy, Code, MessageCircle, Rocket, Image, Sparkles, Menu, X } from "lucide-react";
import PandaLogo from "./PandaLogo";
import { useTheme } from "./ThemeProvider";
import { toast } from "@/components/ui/sonner";

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  image?: string;
  imageUrl?: string;
}

type ServiceType = 'auto' | 'code' | 'creative' | 'knowledge' | 'general';

const ChatInterface = () => {
  const { theme, toggleTheme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hi! I'm PandaNexus, your advanced AI assistant created by Shakeel. I can help you with coding, creative projects, knowledge questions, and much more. What would you like to explore today?",
      role: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceType>('auto');
  const [showCodeInterface, setShowCodeInterface] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // Show code interface
  if (showCodeInterface) {
    return <CodeInterface onBack={() => setShowCodeInterface(false)} />;
  }

  // Enhanced file upload with better mobile support
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        const fileMessage: Message = {
          id: Date.now().toString(),
          content: "I've uploaded an image. Can you analyze it?",
          role: 'user',
          timestamp: new Date(),
          image: imageUrl
        };
        setMessages(prev => [...prev, fileMessage]);
        toast("Image uploaded successfully!", {
          description: "AI will analyze your image",
          duration: 2000,
        });
      };
      reader.readAsDataURL(file);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileMessage: Message = {
          id: Date.now().toString(),
          content: `File content:\n\n${e.target?.result as string}`,
          role: 'user',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, fileMessage]);
        toast("File uploaded successfully!", {
          description: "Content has been processed",
          duration: 2000,
        });
      };
      reader.readAsText(file);
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Enhanced spell check
  const handleSpellCheck = async () => {
    if (!inputValue.trim()) return;
    
    setIsLoading(true);
    try {
      const correctedText = await aiService.spellCheck(inputValue);
      setInputValue(correctedText);
      toast("Text corrected!", {
        description: "Spelling and grammar improved",
        duration: 2000,
      });
    } catch (error) {
      console.error("Spell check failed:", error);
      toast("Spell check unavailable", {
        description: "Using basic corrections",
        duration: 2000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced message submission with better error handling
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const conversationHistory = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content,
        image: m.image
      }));

      console.log('Sending message to AI service...');
      const response = await aiService.sendMessage(conversationHistory, selectedService);
      console.log('Received response:', response);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.content,
        role: 'assistant',
        timestamp: new Date(),
        imageUrl: response.imageUrl
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      toast("Response received!", {
        description: `Powered by ${response.model}`,
        duration: 2000,
      });
      
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm having trouble connecting right now. Let me try to help you anyway! What specific question do you have? I can provide general assistance even when my main AI models are unavailable.",
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      
      toast("Connection issue", {
        description: "Using offline mode",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast("Message copied!", {
        description: "Content copied to clipboard",
        duration: 2000,
      });
    } catch (err) {
      console.error('Failed to copy:', err);
      toast("Copy failed", {
        description: "Please try selecting and copying manually",
        duration: 2000,
      });
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Mobile-First Responsive Header */}
      <Card className="border-0 border-b border-glass-border bg-gradient-glass backdrop-blur-xl shrink-0">
        <div className="flex items-center justify-between p-3 md:p-4">
          {/* Logo and Title - Mobile Optimized */}
          <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
            <PandaLogo className="w-8 h-8 md:w-10 md:h-10 shrink-0" />
            <div className="min-w-0 flex-1">
              <h1 className="text-lg md:text-xl font-bold bg-gradient-text bg-clip-text text-transparent truncate">
                PandaNexus
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">AI Hub • Lightning Fast</p>
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCodeInterface(true)}
              className="bg-gradient-glass border-glass-border hover:shadow-glow transition-all duration-300"
            >
              <Code className="w-4 h-4 mr-2" />
              Code Studio
            </Button>
            
            <VercelDeploy>
              <Button
                variant="outline"
                size="sm"
                className="bg-gradient-glass border-glass-border hover:shadow-glow transition-all duration-300"
              >
                <Rocket className="w-4 h-4 mr-2" />
                Deploy
              </Button>
            </VercelDeploy>
            
            <ContactDialog>
              <Button
                variant="outline"
                size="sm"
                className="bg-gradient-glass border-glass-border hover:shadow-glow transition-all duration-300"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Contact
              </Button>
            </ContactDialog>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="h-8 w-8 px-0"
            >
              {theme === 'dark' ? "☀️" : "🌙"}
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="h-8 w-8 px-0"
            >
              {theme === 'dark' ? "☀️" : "🌙"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="h-8 w-8 px-0"
            >
              {showMobileMenu ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-glass-border p-3 space-y-2 bg-gradient-glass">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowCodeInterface(true);
                setShowMobileMenu(false);
              }}
              className="w-full justify-start bg-gradient-glass border-glass-border"
            >
              <Code className="w-4 h-4 mr-2" />
              Code Studio
            </Button>
            
            <VercelDeploy>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start bg-gradient-glass border-glass-border"
                onClick={() => setShowMobileMenu(false)}
              >
                <Rocket className="w-4 h-4 mr-2" />
                Deploy to Vercel
              </Button>
            </VercelDeploy>
            
            <ContactDialog>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start bg-gradient-glass border-glass-border"
                onClick={() => setShowMobileMenu(false)}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Contact Shakeel
              </Button>
            </ContactDialog>
          </div>
        )}
        
        {/* Service Selector - Always Visible */}
        <div className="px-3 md:px-4 pb-3">
          <ServiceSelector
            selectedService={selectedService}
            onServiceChange={setSelectedService}
            className="w-full"
          />
        </div>
      </Card>

      {/* Messages Area - Mobile Optimized */}
      <div className="flex-1 overflow-y-auto p-2 md:p-4 space-y-3 md:space-y-4 min-h-0">
        {messages.map((message) => (
          <div key={message.id} className="relative group">
            <ChatMessage message={message} />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyMessage(message.content)}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-6 w-6 p-0 bg-gradient-glass border border-glass-border hover:shadow-glow"
            >
              <Copy className="w-3 h-3" />
            </Button>
          </div>
        ))}
        {isLoading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Enhanced Input Area - Mobile First */}
      <Card className="border-0 border-t border-glass-border bg-gradient-glass backdrop-blur-xl m-2 md:m-4 md:mt-0 shrink-0">
        <form onSubmit={handleSubmit} className="p-3 md:p-4 space-y-3">
          {/* Quick Actions - Mobile Responsive */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {[
              { text: "Help me code", icon: Code },
              { text: "Generate image", icon: Image },
              { text: "Creative writing", icon: Sparkles },
              { text: "Explain concept", icon: MessageCircle }
            ].map(action => (
              <Button
                key={action.text}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setInputValue(action.text)}
                className="text-xs whitespace-nowrap bg-gradient-glass border-glass-border hover:shadow-glow shrink-0 h-8"
              >
                <action.icon className="w-3 h-3 mr-1" />
                {action.text}
              </Button>
            ))}
          </div>

          {/* Input Row - Mobile Optimized */}
          <div className="flex items-end gap-2">
            {/* Upload Button */}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*,.txt,.md,.js,.ts,.jsx,.tsx,.py,.html,.css,.json"
              onChange={handleFileUpload}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              className="shrink-0 h-10 w-10 font-bold text-lg bg-gradient-glass border-glass-border hover:shadow-glow"
            >
              <Plus className="w-4 h-4" />
            </Button>

            {/* Input Field */}
            <div className="flex-1 min-w-0">
              <Input
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder="Ask PandaNexus anything..."
                className="bg-input/50 border-glass-border backdrop-blur-sm focus:ring-2 focus:ring-primary/20 h-10"
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e as any);
                  }
                }}
              />
            </div>

            {/* Spell Check Button */}
            <Button
              type="button"
              onClick={handleSpellCheck}
              variant="outline"
              size="icon"
              disabled={isLoading || !inputValue.trim()}
              className="shrink-0 h-10 w-10 bg-gradient-glass border-glass-border hover:shadow-glow"
            >
              <Sparkles className="w-4 h-4" />
            </Button>

            {/* Send Button */}
            <Button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="bg-gradient-primary hover:shadow-glow transition-all duration-300 shrink-0 h-10 w-10"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin"></div>
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          
          {/* Helper Text - Mobile Friendly */}
          <p className="text-xs text-muted-foreground text-center">
            Press Enter to send • <Sparkles className="w-3 h-3 inline" /> for spell check • <Plus className="w-3 h-3 inline" /> to upload
          </p>
        </form>
      </Card>
    </div>
  );
};

export default ChatInterface;