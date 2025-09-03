import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ChatMessage from "./ChatMessage";
import StreamingMessage from "./StreamingMessage";
import ServiceSelector from "./ServiceSelector";
import ContactDialog from "./ContactDialog";
import CodeInterface from "./CodeInterface";
import VercelDeploy from "./VercelDeploy";
import { aiService, AIStreamChunk } from "@/services/aiService";
import { Send, Plus, Copy, Code, MessageCircle, Rocket, Image, Sparkles, Menu, X, Zap, Brain, Cpu, Wand2, Square, Trash2 } from "lucide-react";
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
  isStreaming?: boolean;
  model?: string;
}

type ServiceType = 'auto' | 'code' | 'creative' | 'knowledge' | 'general';

const ChatInterface = () => {
  const { theme, toggleTheme } = useTheme();
  const [messages, setMessages] = useState<Message[]>(() => {
    const savedMessages = localStorage.getItem('pandanexus-chat-history');
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        return parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      } catch (e) {
        console.error('Error loading chat history:', e);
      }
    }
    
    return [
      {
        id: '1',
        content: "🚀 **Welcome to PandaNexus - World's Fastest AI Platform!**\n\nI'm your quantum-powered AI companion, engineered by Shakeel to deliver:\n\n• ⚡ **Lightning Responses** - Instant AI interactions\n• 💻 **Code Studio Pro** - Advanced development environment\n• 🎨 **AI Art Engine** - Instant image generation\n• 🌐 **One-Click Deploy** - Deploy to Vercel instantly\n• 🧠 **Multi-Modal Genius** - Text, code, and image mastery\n• 🔧 **Smart Spell Check** - AI-powered text optimization\n\nReady to build something revolutionary? Let's create the impossible! 🌟",
        role: 'assistant',
        timestamp: new Date(),
        model: 'PandaNexus Quantum Engine'
      }
    ];
  });
  
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceType>('auto');
  const [showCodeInterface, setShowCodeInterface] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [isSpellChecking, setIsSpellChecking] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Save messages to localStorage
  useEffect(() => {
    localStorage.setItem('pandanexus-chat-history', JSON.stringify(messages));
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // Auto-switch to Code Studio
  useEffect(() => {
    if (selectedService === 'code') {
      const timer = setTimeout(() => {
        setShowCodeInterface(true);
        toast.success("🚀 Code Studio Pro Activated!", {
          description: "World's most advanced coding environment",
          duration: 2000,
        });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [selectedService]);

  if (showCodeInterface) {
    return <CodeInterface onBack={() => {
      setShowCodeInterface(false);
      setSelectedService('auto');
    }} />;
  }

  // Ultra-fast file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        const fileMessage: Message = {
          id: Date.now().toString(),
          content: "🖼️ I've uploaded an image for AI analysis. What would you like me to tell you about it?",
          role: 'user',
          timestamp: new Date(),
          image: imageUrl
        };
        setMessages(prev => [...prev, fileMessage]);
        toast.success("📸 Image uploaded!", {
          description: "AI will analyze with superhuman precision",
          duration: 1500,
        });
      };
      reader.readAsDataURL(file);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const fileMessage: Message = {
          id: Date.now().toString(),
          content: `📄 **File Analyzed:**\n\`\`\`\n${content.slice(0, 1500)}${content.length > 1500 ? '\n... (truncated)' : ''}\n\`\`\``,
          role: 'user',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, fileMessage]);
        toast.success("📁 File processed!", {
          description: "Content ready for AI analysis",
          duration: 1500,
        });
      };
      reader.readAsText(file);
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Revolutionary AI spell check
  const handleSpellCheck = async () => {
    if (!inputValue.trim() || isSpellChecking) return;
    
    const originalText = inputValue;
    setIsSpellChecking(true);
    setInputValue("✨ AI optimizing...");
    
    try {
      const correctedText = await aiService.spellCheck(originalText);
      setInputValue(correctedText);
      
      if (correctedText !== originalText) {
        toast.success("🎯 Text perfected!", {
          description: "Grammar and clarity optimized",
          duration: 1500,
        });
      } else {
        toast.info("✅ Perfect already!", {
          description: "No improvements needed",
          duration: 1000,
        });
      }
    } catch (error) {
      console.error("Spell check failed:", error);
      setInputValue(originalText);
      toast.error("Spell check unavailable");
    } finally {
      setIsSpellChecking(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  // Stop/Cancel streaming
  const handleStopStreaming = () => {
    if (isLoading && streamingMessageId) {
      aiService.cancelRequest();
      setIsLoading(false);
      setStreamingMessageId(null);
      
      // Update the streaming message to show it was stopped
      setMessages(prev => prev.map(msg => 
        msg.id === streamingMessageId 
          ? { ...msg, content: msg.content + '\n\n⏹️ **Stopped by user**', isStreaming: false }
          : msg
      ));
      
      toast.info("⏹️ Streaming stopped", {
        description: "Request cancelled successfully",
        duration: 1500,
      });
    }
  };

  // Ultra-fast streaming submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || (isLoading && !streamingMessageId)) return;

    // If currently streaming, stop it
    if (isLoading && streamingMessageId) {
      handleStopStreaming();
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    // Create streaming message
    const streamingId = (Date.now() + 1).toString();
    setStreamingMessageId(streamingId);
    
    const streamingMessage: Message = {
      id: streamingId,
      content: '',
      role: 'assistant',
      timestamp: new Date(),
      isStreaming: true
    };
    
    setMessages(prev => [...prev, streamingMessage]);

    try {
      const recentMessages = messages.slice(-8);
      const conversationHistory = [...recentMessages, userMessage].map(m => ({
        role: m.role,
        content: m.content,
        image: m.image
      }));

      console.log('🚀 Quantum streaming activated...');
      let streamedContent = '';
      let responseModel = 'PandaNexus-Pro';

      const onChunkCallback = (chunk: AIStreamChunk) => {
        if (chunk.error) {
          console.error("Stream error:", chunk.error);
          setMessages(prev => prev.map(msg => 
            msg.id === streamingId 
              ? { ...msg, content: chunk.chunk || 'Connection error occurred', isStreaming: false }
              : msg
          ));
          setIsLoading(false);
          setStreamingMessageId(null);
          return;
        }

        if (chunk.model) {
          responseModel = chunk.model;
        }
        
        if (!chunk.isFinal) {
          streamedContent += chunk.chunk;
          setMessages(prev => prev.map(msg => 
            msg.id === streamingId 
              ? { ...msg, content: streamedContent }
              : msg
          ));
        } else {
          // Check for image generation
          const isImageGen = /generate.*image|create.*image|make.*image|draw|picture|photo|art|visual/i.test(userMessage.content);
          let imageUrl = '';
          
          if (isImageGen) {
            const prompt = userMessage.content.replace(/generate|create|make|draw/gi, '').trim();
            imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&seed=${Date.now()}&enhance=true&model=flux`;
          }
          
          setMessages(prev => prev.map(msg => 
            msg.id === streamingId 
              ? { 
                  ...msg, 
                  content: streamedContent, 
                  isStreaming: false, 
                  model: responseModel,
                  imageUrl: imageUrl || undefined
                }
              : msg
          ));
          setIsLoading(false);
          setStreamingMessageId(null);
          
          toast.success("🎉 Response complete!", {
            description: `${responseModel} - Lightning speed!`,
            duration: 1500,
          });
        }
      };

      await aiService.sendMessageStream(
        conversationHistory, 
        selectedService,
        onChunkCallback
      );
      
    } catch (error) {
      console.error("Chat error:", error);
      
      setMessages(prev => prev.filter(msg => msg.id !== streamingId));
      setIsLoading(false);
      setStreamingMessageId(null);
      
      toast.error("Failed to send message", {
        description: "Please check API connection",
        duration: 2000,
      });
    }
  };

  const copyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success("📋 Copied!", {
        description: "Message copied to clipboard",
        duration: 1000,
      });
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error("Copy failed");
    }
  };

  const handleQuickAction = (action: string) => {
    setInputValue(action);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  // Clear chat properly
  const clearChat = () => {
    setMessages([
      {
        id: '1',
        content: "🧹 **Chat cleared! Ready for your next revolutionary project!**\n\nWhat incredible creation shall we build together?",
        role: 'assistant',
        timestamp: new Date(),
        model: 'PandaNexus Fresh Start'
      }
    ]);
    aiService.clearCache();
    toast.success("🧹 Chat cleared!", {
      description: "Ready for your next project",
      duration: 1500,
    });
  };

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* ULTRA-RESPONSIVE HEADER */}
      <Card className="border-0 border-b border-glass-border bg-gradient-glass backdrop-blur-xl shrink-0 shadow-glow">
        <div className="flex items-center justify-between p-2 sm:p-3 md:p-4">
          {/* Logo and Title */}
          <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
            <div className="relative">
              <PandaLogo className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 shrink-0" animate />
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-glow"></div>
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-lg md:text-xl font-bold bg-gradient-text bg-clip-text text-transparent truncate flex items-center gap-1">
                PandaNexus
                <Zap className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-primary animate-pulse" />
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">World's Fastest AI • Quantum Speed</p>
            </div>
          </div>

          {/* Performance Indicators */}
          <div className="hidden lg:flex items-center gap-2 mr-4">
            <Badge variant="outline" className="bg-gradient-glass border-glass-border text-xs animate-pulse">
              <Brain className="w-3 h-3 mr-1 text-green-500" />
              Quantum
            </Badge>
            <Badge variant="outline" className="bg-gradient-glass border-glass-border text-xs">
              <Cpu className="w-3 h-3 mr-1 text-blue-500" />
              {isLoading ? 'Streaming' : 'Ready'}
            </Badge>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCodeInterface(true)}
              className="bg-gradient-glass border-glass-border hover:shadow-glow transition-all duration-300 text-xs h-8 px-2 lg:px-3"
            >
              <Code className="w-3 h-3 lg:w-4 lg:h-4 lg:mr-1" />
              <span className="hidden lg:inline">Code Studio</span>
            </Button>
            
            <VercelDeploy>
              <Button
                variant="outline"
                size="sm"
                className="bg-gradient-glass border-glass-border hover:shadow-glow transition-all duration-300 text-xs h-8 px-2 lg:px-3"
              >
                <Rocket className="w-3 h-3 lg:w-4 lg:h-4 lg:mr-1" />
                <span className="hidden lg:inline">Deploy</span>
              </Button>
            </VercelDeploy>
            
            <ContactDialog>
              <Button
                variant="outline"
                size="sm"
                className="bg-gradient-glass border-glass-border hover:shadow-glow transition-all duration-300 text-xs h-8 px-2 lg:px-3"
              >
                <MessageCircle className="w-3 h-3 lg:w-4 lg:h-4 lg:mr-1" />
                <span className="hidden lg:inline">Contact</span>
              </Button>
            </ContactDialog>
            
            <Button
              variant="outline"
              size="sm"
              onClick={clearChat}
              className="bg-gradient-glass border-glass-border hover:shadow-glow transition-all duration-300 text-xs h-8 px-2 lg:px-3"
            >
              <Trash2 className="w-3 h-3 lg:w-4 lg:h-4 lg:mr-1" />
              <span className="hidden lg:inline">Clear</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="h-8 w-8 px-0"
            >
              {theme === 'dark' ? "☀️" : "🌙"}
            </Button>
          </div>

          {/* Mobile Actions */}
          <div className="flex md:hidden items-center gap-1">
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

        {/* Enhanced Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-glass-border p-3 space-y-2 bg-gradient-glass backdrop-blur-xl">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowCodeInterface(true);
                  setShowMobileMenu(false);
                }}
                className="justify-start bg-gradient-glass border-glass-border text-sm hover:shadow-glow h-10"
              >
                <Code className="w-4 h-4 mr-2" />
                Code Studio
              </Button>
              
              <VercelDeploy>
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start bg-gradient-glass border-glass-border text-sm hover:shadow-glow h-10"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <Rocket className="w-4 h-4 mr-2" />
                  Deploy
                </Button>
              </VercelDeploy>
              
              <ContactDialog>
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start bg-gradient-glass border-glass-border text-sm hover:shadow-glow h-10"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contact
                </Button>
              </ContactDialog>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  clearChat();
                  setShowMobileMenu(false);
                }}
                className="justify-start bg-gradient-glass border-glass-border text-sm hover:shadow-glow h-10"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Chat
              </Button>
            </div>
          </div>
        )}
        
        {/* Service Selector */}
        <div className="px-2 sm:px-3 md:px-4 pb-2 sm:pb-3">
          <ServiceSelector
            selectedService={selectedService}
            onServiceChange={setSelectedService}
            className="w-full"
          />
        </div>
      </Card>

      {/* ULTRA-FAST MESSAGES AREA */}
      <div className="flex-1 overflow-y-auto p-2 md:p-4 space-y-2 md:space-y-3 min-h-0">
        {messages.map((message) => (
          <div key={message.id} className="relative group">
            {message.isStreaming ? (
              <StreamingMessage 
                message={message}
                isActive={streamingMessageId === message.id}
              />
            ) : (
              <ChatMessage message={message} />
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyMessage(message.content)}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-200 h-6 w-6 p-0 bg-gradient-glass border border-glass-border hover:shadow-glow rounded-full"
            >
              <Copy className="w-3 h-3" />
            </Button>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* REVOLUTIONARY INPUT SYSTEM */}
      <Card className="border-0 border-t border-glass-border bg-gradient-glass backdrop-blur-xl m-2 md:m-4 md:mt-0 shrink-0 shadow-glow">
        <form onSubmit={handleSubmit} className="p-2 sm:p-3 md:p-4 space-y-2 sm:space-y-3">
          {/* LIGHTNING QUICK ACTIONS */}
          <div className="flex gap-1 md:gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {[
              { text: "Build React app", icon: Code, color: "text-blue-500", mobile: "React" },
              { text: "Generate AI image", icon: Image, color: "text-purple-500", mobile: "Image" },
              { text: "Debug my code", icon: Zap, color: "text-yellow-500", mobile: "Debug" },
              { text: "Deploy to Vercel", icon: Rocket, color: "text-green-500", mobile: "Deploy" },
              { text: "Optimize code", icon: Brain, color: "text-pink-500", mobile: "Optimize" },
              { text: "Create API", icon: Cpu, color: "text-cyan-500", mobile: "API" }
            ].map(action => (
              <Button
                key={action.text}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction(action.text)}
                className="text-xs whitespace-nowrap bg-gradient-glass border-glass-border hover:shadow-glow shrink-0 h-7 sm:h-8 px-2 sm:px-3 transition-all duration-200"
              >
                <action.icon className={`w-3 h-3 mr-1 ${action.color}`} />
                <span className="hidden sm:inline">{action.text}</span>
                <span className="sm:hidden">{action.mobile}</span>
              </Button>
            ))}
          </div>

          {/* ULTRA-RESPONSIVE INPUT ROW */}
          <div className="flex items-end gap-2">
            {/* Upload Button */}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*,.txt,.md,.js,.ts,.jsx,.tsx,.py,.html,.css,.json,.sql,.php,.java,.cpp,.c,.go,.rs,.swift,.kt"
              onChange={handleFileUpload}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              className="shrink-0 h-9 sm:h-10 w-9 sm:w-10 bg-gradient-glass border-glass-border hover:shadow-glow transition-all duration-200"
              title="Upload file or image"
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>

            {/* INPUT FIELD */}
            <div className="flex-1 min-w-0">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder="Ask PandaNexus anything... ⚡ World's fastest AI!"
                className="bg-input/50 border-glass-border backdrop-blur-sm focus:ring-2 focus:ring-primary/20 h-9 sm:h-10 text-sm md:text-base transition-all duration-200 font-medium"
                disabled={isSpellChecking}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e as any);
                  }
                  if (e.key === 'Escape') {
                    if (isLoading) {
                      handleStopStreaming();
                    } else {
                      setInputValue('');
                    }
                  }
                }}
              />
            </div>

            {/* AI SPELL CHECK */}
            <Button
              type="button"
              onClick={handleSpellCheck}
              variant="outline"
              size="icon"
              disabled={!inputValue.trim() || isSpellChecking}
              className="shrink-0 h-9 sm:h-10 w-9 sm:w-10 bg-gradient-glass border-glass-border hover:shadow-glow transition-all duration-200"
              title="AI Spell Check & Optimization"
            >
              {isSpellChecking ? (
                <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              ) : (
                <Wand2 className="w-3 h-3 sm:w-4 sm:h-4" />
              )}
            </Button>

            {/* SEND/STOP BUTTON */}
            <Button
              type="submit"
              disabled={isSpellChecking}
              className={`transition-all duration-300 shrink-0 h-9 sm:h-10 w-9 sm:w-10 relative overflow-hidden ${
                isLoading 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-gradient-primary hover:shadow-glow'
              }`}
              title={isLoading ? "Stop streaming" : "Send message"}
            >
              {isLoading ? (
                <Square className="w-3 h-3 sm:w-4 sm:h-4" />
              ) : (
                <>
                  <Send className="w-3 h-3 sm:w-4 sm:h-4 relative z-10" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
                </>
              )}
            </Button>
          </div>
          
          {/* ENHANCED HELPER TEXT */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1">
                ⚡ <span className="hidden xs:inline">Lightning AI</span><span className="xs:hidden">Fast</span>
              </span>
              <span className="hidden sm:inline flex items-center gap-1">
                • 🔥 <span className="hidden md:inline">Real-time streaming</span><span className="md:hidden">Live</span>
              </span>
              <span className="hidden md:inline">• 🚀 Instant deploy</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted/20 rounded text-xs border border-glass-border">Enter</kbd>
              <span className="hidden sm:inline">send</span>
              <span className="text-xs ml-2">ESC stop</span>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ChatInterface;