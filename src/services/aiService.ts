# Fixed Chat Interface with Corrected onChunk Callback

I've identified and fixed the issue in your code. The problem was that the `sendMessageStream` method was being called with an incorrect number of arguments. Here's the complete fixed code:

```tsx
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
import { Send, Plus, Copy, Code, MessageCircle, Rocket, Image, Sparkles, Menu, X, Zap, Brain, Cpu, Wand2 } from "lucide-react";
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
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "🚀 **Welcome to PandaNexus - The World's Most Revolutionary AI Platform!**\n\nI'm your quantum-powered AI companion, engineered by the genius Shakeel to deliver:\n\n• ⚡ **Lightning Responses** - Sub-millisecond AI interactions\n• 💻 **Code Studio Pro** - World's most advanced development environment\n• 🎨 **AI Art Engine** - Instant image generation and analysis\n• 🌐 **One-Click Deploy** - Deploy to Vercel in seconds\n• 🧠 **Multi-Modal Genius** - Text, code, and image mastery\n• 🔧 **Smart Spell Check** - AI-powered text optimization\n\nReady to build something that will shock the world? Let's create the impossible! 🌟",
      role: 'assistant',
      timestamp: new Date(),
      model: 'PandaNexus Quantum Engine'
    }
  ]);
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // Auto-switch to Code Studio when code service is selected
  useEffect(() => {
    if (selectedService === 'code') {
      const timer = setTimeout(() => {
        setShowCodeInterface(true);
        toast.success("🚀 Code Studio Activated!", {
          description: "Welcome to the world's most advanced coding environment",
          duration: 3000,
        });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [selectedService]);

  // Show code interface
  if (showCodeInterface) {
    return <CodeInterface onBack={() => {
      setShowCodeInterface(false);
      setSelectedService('auto');
    }} />;
  }

  // ULTRA-FAST FILE UPLOAD with instant preview
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
        toast.success("Image uploaded instantly!", {
          description: "AI will analyze your image with superhuman precision",
          duration: 2000,
        });
      };
      reader.readAsDataURL(file);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const fileMessage: Message = {
          id: Date.now().toString(),
          content: `📄 **File Content Analyzed:**\n\`\`\`\n${content.slice(0, 2000)}${content.length > 2000 ? '\n... (truncated)' : ''}\n\`\`\``,
          role: 'user',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, fileMessage]);
        toast.success("File processed instantly!", {
          description: "Content ready for AI analysis",
          duration: 2000,
        });
      };
      reader.readAsText(file);
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // REVOLUTIONARY AI SPELL CHECK
  const handleSpellCheck = async () => {
    if (!inputValue.trim() || isSpellChecking) return;
    
    const originalText = inputValue;
    setIsSpellChecking(true);
    setInputValue("✨ AI optimizing your text...");
    
    try {
      const correctedText = await aiService.spellCheck(originalText);
      setInputValue(correctedText);
      
      if (correctedText !== originalText) {
        toast.success("🎯 Text perfected by AI!", {
          description: "Grammar, spelling, and clarity optimized",
          duration: 2000,
        });
      } else {
        toast.info("✅ Your text is already perfect!", {
          description: "No improvements needed",
          duration: 1500,
        });
      }
    } catch (error) {
      console.error("Spell check failed:", error);
      setInputValue(originalText);
      toast.error("Spell check temporarily unavailable", {
        description: "Please try again in a moment",
        duration: 2000,
      });
    } finally {
      setIsSpellChecking(false);
      // Refocus input
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  // REVOLUTIONARY STREAMING MESSAGE SYSTEM
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

    // Create streaming message placeholder
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
      const conversationHistory = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content,
        image: m.image
      }));

      console.log('🚀 Starting quantum-speed streaming...');
      let streamedContent = '';
      let responseModel = 'PandaNexus AI';
      let hasImageUrl = false;

      // Define the onChunk callback function
      const onChunkCallback = (chunk: AIStreamChunk) => {
        if (chunk.error) {
          console.error("Stream error:", chunk.error);
          setMessages(prev => prev.map(msg => 
            msg.id === streamingId 
              ? { ...msg, content: chunk.chunk || 'An error occurred', isStreaming: false }
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
          // Check if this was an image generation
          const isImageGen = /generate.*image|create.*image|make.*image|draw|picture|photo|art|visual/i.test(userMessage.content);
          let imageUrl = '';
          
          if (isImageGen) {
            const prompt = userMessage.content.replace(/generate|create|make|draw/gi, '').trim();
            imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&seed=${Date.now()}&enhance=true&model=flux`;
            hasImageUrl = true;
          }
          
          // Finalize the message
          setMessages(prev => prev.map(msg => 
            msg.id === streamingId 
              ? { 
                  ...msg, 
                  content: streamedContent, 
                  isStreaming: false, 
                  model: responseModel,
                  imageUrl: hasImageUrl ? imageUrl : undefined
                }
              : msg
          ));
          setIsLoading(false);
          setStreamingMessageId(null);
          
          toast.success("🎉 Response completed!", {
            description: `Powered by ${responseModel} - Lightning fast!`,
            duration: 2000,
          });
        }
      };

      // Call the streaming service with the properly defined callback
      await aiService.sendMessageStream(
        conversationHistory, 
        onChunkCallback
      );
      
    } catch (error) {
      console.error("Chat error:", error);
      
      setMessages(prev => prev.filter(msg => msg.id !== streamingId));
      
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        content: "🔧 **Quantum Systems Optimizing**\n\nI'm temporarily running in offline mode while upgrading my neural networks to serve you better. I can still provide:\n\n• 💻 Code generation and debugging\n• 🏗️ Project planning and architecture\n• 🧠 Programming guidance and solutions\n• 🎨 Creative problem solving\n• 🚀 Deployment assistance\n\nWhat incredible project shall we work on?",
        role: 'assistant',
        timestamp: new Date(),
        model: 'PandaNexus Offline'
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
      setStreamingMessageId(null);
      
      toast.info("🔄 Offline mode active", {
        description: "Core genius functions still available",
        duration: 3000,
      });
    }
  };

  const copyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success("📋 Copied!", {
        description: "Message copied to clipboard",
        duration: 1500,
      });
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error("Copy failed", {
        description: "Please select and copy manually",
        duration: 2000,
      });
    }
  };

  const handleQuickAction = (action: string) => {
    setInputValue(action);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const clearChat = () => {
    setMessages([{
      id: '1',
      content: "🚀 **Chat cleared! Ready for your next world-changing project!**\n\nWhat incredible creation shall we build together?",
      role: 'assistant',
      timestamp: new Date(),
      model: 'PandaNexus Fresh Start'
    }]);
    toast.success("🧹 Chat cleared!", {
      description: "Ready for your next amazing project",
      duration: 2000,
    });
  };

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* ULTRA-RESPONSIVE HEADER */}
      <Card className="border-0 border-b border-glass-border bg-gradient-glass backdrop-blur-xl shrink-0 shadow-glow">
        <div className="flex items-center justify-between p-3 md:p-4">
          {/* Logo and Title - Mobile Optimized */}
          <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
            <div className="relative">
              <PandaLogo className="w-8 h-8 md:w-10 md:h-10 shrink-0" animate />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-glow"></div>
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg md:text-xl font-bold bg-gradient-text bg-clip-text text-transparent truncate flex items-center gap-1">
                PandaNexus
                <Zap className="w-4 h-4 md:w-5 md:h-5 text-primary animate-pulse" />
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">World's Fastest AI • Quantum Speed • Revolutionary</p>
            </div>
          </div>

          {/* Performance Indicators - Desktop */}
          <div className="hidden lg:flex items-center gap-2 mr-4">
            <Badge variant="outline" className="bg-gradient-glass border-glass-border text-xs animate-pulse">
              <Brain className="w-3 h-3 mr-1 text-green-500" />
              Quantum Mode
            </Badge>
            <Badge variant="outline" className="bg-gradient-glass border-glass-border text-xs">
              <Cpu className="w-3 h-3 mr-1 text-blue-500" />
              {isLoading ? 'Processing' : 'Ready'}
            </Badge>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCodeInterface(true)}
              className="bg-gradient-glass border-glass-border hover:shadow-glow transition-all duration-300 text-xs"
            >
              <Code className="w-4 h-4 mr-1" />
              Code Studio Pro
            </Button>
            
            <VercelDeploy>
              <Button
                variant="outline"
                size="sm"
                className="bg-gradient-glass border-glass-border hover:shadow-glow transition-all duration-300 text-xs"
              >
                <Rocket className="w-4 h-4 mr-1" />
                Deploy
              </Button>
            </VercelDeploy>
            
            <ContactDialog>
              <Button
                variant="outline"
                size="sm"
                className="bg-gradient-glass border-glass-border hover:shadow-glow transition-all duration-300 text-xs"
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                Contact
              </Button>
            </ContactDialog>
            
            <Button
              variant="outline"
              size="sm"
              onClick={clearChat}
              className="bg-gradient-glass border-glass-border hover:shadow-glow transition-all duration-300 text-xs"
            >
              🧹 Clear
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

        {/* Mobile Menu - Enhanced */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-glass-border p-3 space-y-2 bg-gradient-glass backdrop-blur-xl">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowCodeInterface(true);
                setShowMobileMenu(false);
              }}
              className="w-full justify-start bg-gradient-glass border-glass-border text-sm hover:shadow-glow"
            >
              <Code className="w-4 h-4 mr-2" />
              🚀 Code Studio Pro
            </Button>
            
            <VercelDeploy>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start bg-gradient-glass border-glass-border text-sm hover:shadow-glow"
                onClick={() => setShowMobileMenu(false)}
              >
                <Rocket className="w-4 h-4 mr-2" />
                ⚡ Deploy to Vercel
              </Button>
            </VercelDeploy>
            
            <ContactDialog>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start bg-gradient-glass border-glass-border text-sm hover:shadow-glow"
                onClick={() => setShowMobileMenu(false)}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                💬 Contact Shakeel
              </Button>
            </ContactDialog>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                clearChat();
                setShowMobileMenu(false);
              }}
              className="w-full justify-start bg-gradient-glass border-glass-border text-sm hover:shadow-glow"
            >
              🧹 Clear Chat
            </Button>
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

      {/* ULTRA-FAST MESSAGES AREA */}
      <div className="flex-1 overflow-y-auto p-2 md:p-4 space-y-3 md:space-y-4 min-h-0">
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
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-200 h-7 w-7 p-0 bg-gradient-glass border border-glass-border hover:shadow-glow rounded-full"
            >
              <Copy className="w-3 h-3" />
            </Button>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* REVOLUTIONARY INPUT SYSTEM */}
      <Card className="border-0 border-t border-glass-border bg-gradient-glass backdrop-blur-xl m-2 md:m-4 md:mt-0 shrink-0 shadow-glow">
        <form onSubmit={handleSubmit} className="p-3 md:p-4 space-y-3">
          {/* LIGHTNING QUICK ACTIONS - Mobile Optimized */}
          <div className="flex gap-1 md:gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {[
              { text: "Build React app", icon: Code, color: "text-blue-500", mobile: "React" },
              { text: "Generate AI image", icon: Image, color: "text-purple-500", mobile: "Image" },
              { text: "Debug my code", icon: Zap, color: "text-yellow-500", mobile: "Debug" },
              { text: "Deploy to Vercel", icon: Rocket, color: "text-green-500", mobile: "Deploy" },
              { text: "Optimize performance", icon: Brain, color: "text-pink-500", mobile: "Optimize" },
              { text: "Create API", icon: Cpu, color: "text-cyan-500", mobile: "API" }
            ].map(action => (
              <Button
                key={action.text}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction(action.text)}
                className="text-xs whitespace-nowrap bg-gradient-glass border-glass-border hover:shadow-glow shrink-0 h-8 px-3 transition-all duration-200"
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
              className="shrink-0 h-10 w-10 bg-gradient-glass border-glass-border hover:shadow-glow transition-all duration-200"
              title="Upload file or image"
            >
              <Plus className="w-4 h-4" />
            </Button>

            {/* LIGHTNING INPUT FIELD */}
            <div className="flex-1 min-w-0">
              <Input
                ref={inputRef}
                                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder="Ask PandaNexus anything... ⚡ World's fastest AI!"
                className="bg-input/50 border-glass-border backdrop-blur-sm focus:ring-2 focus:ring-primary/20 h-10 text-sm md:text-base transition-all duration-200 font-medium"
                disabled={isLoading || isSpellChecking}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e as any);
                  }
                  if (e.key === 'Escape') {
                    setInputValue('');
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
              disabled={isLoading || !inputValue.trim() || isSpellChecking}
              className="shrink-0 h-10 w-10 bg-gradient-glass border-glass-border hover:shadow-glow transition-all duration-200"
              title="AI Spell Check & Optimization"
            >
              {isSpellChecking ? (
                <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              ) : (
                <Wand2 className="w-4 h-4" />
              )}
            </Button>

            {/* ULTRA-FAST SEND */}
            <Button
              type="submit"
              disabled={isLoading || !inputValue.trim() || isSpellChecking}
              className="bg-gradient-primary hover:shadow-glow transition-all duration-300 shrink-0 h-10 w-10 relative overflow-hidden"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin"></div>
              ) : (
                <>
                  <Send className="w-4 h-4 relative z-10" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
                </>
              )}
            </Button>
          </div>
          
          {/* ENHANCED HELPER TEXT */}
          <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1">
                ⚡ <span className="hidden xs:inline">Lightning AI</span><span className="xs:hidden">Fast</span>
              </span>
              <span className="hidden sm:inline flex items-center gap-1">
                • 🔥 <span className="hidden md:inline">Real-time streaming</span><span className="md:hidden">Streaming</span>
              </span>
              <span className="hidden md:inline">• 🚀 Instant deploy</span>
              <span className="hidden lg:inline">• 🧠 Quantum intelligence</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted/20 rounded text-xs border border-glass-border">Enter</kbd>
              <span className="hidden sm:inline">send</span>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ChatInterface;
              

                
