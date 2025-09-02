import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ChatMessage from "./ChatMessage";
import StreamingMessage from "./StreamingMessage";
import VercelDeploy from "./VercelDeploy";
import { aiService, AIStreamChunk } from "@/services/aiService";
import { Send, Code, Terminal, FileCode, Zap, Copy, Download, ArrowLeft, Rocket, Plus, Save, Play, Settings, Folder, GitBranch, Package, Sparkles, Brain, Cpu, Wand2 } from "lucide-react";
import PandaLogo from "./PandaLogo";
import { toast } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  code?: string;
  language?: string;
  isStreaming?: boolean;
  model?: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  language: string;
  files: Array<{
    name: string;
    content: string;
    language: string;
  }>;
  createdAt: Date;
  deployUrl?: string;
}

interface CodeInterfaceProps {
  onBack: () => void;
}

const CodeInterface = ({ onBack }: CodeInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "🚀 **Welcome to PandaNexus Code Studio Pro - World's Most Advanced Development Environment!**\n\nI'm your elite AI coding partner, ready to help you build revolutionary projects:\n\n• ⚡ **Lightning Code Generation** - Any language, any framework\n• 🏗️ **Multi-File Projects** - Complete applications with proper structure\n• 🚀 **Instant Deployment** - Deploy to Vercel in seconds\n• 🐛 **Advanced Debugging** - AI-powered error detection and fixes\n• 📦 **Project Management** - Create, save, and manage multiple projects\n• 🧠 **Smart Suggestions** - Context-aware code completions\n\nWhat world-changing project shall we build today?",
      role: 'assistant',
      timestamp: new Date(),
      model: 'PandaNexus Code Master'
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [projectName, setProjectName] = useState("");
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [isSpellChecking, setIsSpellChecking] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const languages = [
    { value: "javascript", label: "JavaScript", icon: "🟨", ext: "js" },
    { value: "typescript", label: "TypeScript", icon: "🔷", ext: "ts" },
    { value: "python", label: "Python", icon: "🐍", ext: "py" },
    { value: "react", label: "React", icon: "⚛️", ext: "jsx" },
    { value: "nextjs", label: "Next.js", icon: "▲", ext: "tsx" },
    { value: "nodejs", label: "Node.js", icon: "🟢", ext: "js" },
    { value: "html", label: "HTML", icon: "🌐", ext: "html" },
    { value: "css", label: "CSS", icon: "🎨", ext: "css" },
    { value: "sql", label: "SQL", icon: "🗄️", ext: "sql" },
    { value: "php", label: "PHP", icon: "🐘", ext: "php" },
    { value: "java", label: "Java", icon: "☕", ext: "java" },
    { value: "cpp", label: "C++", icon: "⚙️", ext: "cpp" },
    { value: "go", label: "Go", icon: "🐹", ext: "go" },
    { value: "rust", label: "Rust", icon: "🦀", ext: "rs" }
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load projects from localStorage
  useEffect(() => {
    const savedProjects = localStorage.getItem('pandanexus-projects');
    if (savedProjects) {
      try {
        const parsed = JSON.parse(savedProjects);
        setProjects(parsed);
      } catch (error) {
        console.error('Failed to load projects:', error);
      }
    }
  }, []);

  // Save projects to localStorage
  const saveProjects = (updatedProjects: Project[]) => {
    setProjects(updatedProjects);
    localStorage.setItem('pandanexus-projects', JSON.stringify(updatedProjects));
  };

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("📋 Code copied!", { 
        description: "Ready to paste in your editor",
        duration: 2000 
      });
    } catch {
      toast.error("Copy failed", { duration: 2000 });
    }
  };

  const downloadCode = (code: string, filename: string) => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`💾 Saved as ${filename}`, { duration: 2000 });
  };

  const saveToProject = (code: string, language: string) => {
    if (!projectName.trim()) {
      toast.error("Please enter a project name first");
      return;
    }

    const langInfo = languages.find(l => l.value === language) || languages[0];
    const fileName = `main.${langInfo.ext}`;
    
    const newProject: Project = {
      id: Date.now().toString(),
      name: projectName,
      description: `${langInfo.label} project created with PandaNexus`,
      language: language,
      files: [{
        name: fileName,
        content: code,
        language: language
      }],
      createdAt: new Date()
    };

    const updatedProjects = [...projects, newProject];
    saveProjects(updatedProjects);
    setCurrentProject(newProject);
    setProjectName("");
    
    toast.success("🎉 Project saved!", {
      description: `${newProject.name} added to your workspace`,
      duration: 3000,
    });
  };

  // AI SPELL CHECK
  const handleSpellCheck = async () => {
    if (!inputValue.trim() || isSpellChecking) return;
    
    const originalText = inputValue;
    setIsSpellChecking(true);
    setInputValue("✨ AI optimizing your request...");
    
    try {
      const correctedText = await aiService.spellCheck(originalText);
      setInputValue(correctedText);
      
      if (correctedText !== originalText) {
        toast.success("🎯 Request optimized by AI!", {
          description: "Grammar and clarity improved",
          duration: 2000,
        });
      } else {
        toast.info("✅ Your request is perfect!", {
          description: "No improvements needed",
          duration: 1500,
        });
      }
    } catch (error) {
      console.error("Spell check failed:", error);
      setInputValue(originalText);
      toast.error("Spell check temporarily unavailable");
    } finally {
      setIsSpellChecking(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  // REVOLUTIONARY STREAMING SUBMISSION
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: 'user',
      timestamp: new Date(),
      language: selectedLanguage
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
      const conversationHistory = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content
      }));

      let streamedContent = '';
      let responseModel = 'PandaNexus Code Master';

      await aiService.sendMessageStream(
        conversationHistory, 
        'code',
        (chunk: AIStreamChunk) => {
          if (chunk.error) {
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
            // Extract code if present
            let code = '';
            let detectedLanguage = selectedLanguage;
            
            const codeMatch = streamedContent.match(/```(\w+)?\n([\s\S]*?)```/);
            if (codeMatch) {
              code = codeMatch[2].trim();
              detectedLanguage = codeMatch[1] || selectedLanguage;
            } else if (streamedContent.includes('{') || streamedContent.includes('function') || streamedContent.includes('class')) {
              code = streamedContent;
            }

            setMessages(prev => prev.map(msg => 
              msg.id === streamingId 
                ? { 
                    ...msg, 
                    content: streamedContent, 
                    isStreaming: false, 
                    model: responseModel,
                    code,
                    language: detectedLanguage
                  }
                : msg
            ));
            setIsLoading(false);
            setStreamingMessageId(null);
            
            toast.success("🎉 Code generated!", {
              description: `${responseModel} delivered world-class code`,
              duration: 2000,
            });
          }
        }
      );
      
    } catch (error) {
      console.error("Code generation error:", error);
      
      setMessages(prev => prev.filter(msg => msg.id !== streamingId));
      
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        content: "🔧 **Code Studio Offline Mode**\n\nI'm temporarily optimizing my coding algorithms. I can still help with:\n\n• 💻 Code review and debugging\n• 🏗️ Architecture planning\n• 📚 Programming guidance\n• 🚀 Deployment strategies\n• 🧠 Algorithm optimization\n\nWhat coding challenge can I help solve?",
        role: 'assistant',
        timestamp: new Date(),
        model: 'PandaNexus Offline'
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
      setStreamingMessageId(null);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* WORLD-CLASS HEADER */}
      <Card className="border-0 border-b border-glass-border bg-gradient-glass backdrop-blur-xl shrink-0 shadow-glow">
        <div className="flex items-center justify-between p-3 md:p-4">
          <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
            <Button variant="ghost" size="sm" onClick={onBack} className="hover:bg-accent/20 h-8 w-8 p-0 shrink-0">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2 min-w-0">
              <div className="relative shrink-0">
                <PandaLogo className="w-8 h-8 md:w-10 md:h-10" animate />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse shadow-glow"></div>
              </div>
              <div className="min-w-0">
                <h1 className="text-lg md:text-xl font-bold bg-gradient-text bg-clip-text text-transparent flex items-center gap-2">
                  <Code className="w-4 h-4 md:w-5 md:h-5 shrink-0" />
                  <span className="truncate">Code Studio Pro</span>
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block">World's Most Advanced AI Development Environment</p>
              </div>
            </div>
          </div>
          
          {/* Performance Indicators */}
          <div className="hidden lg:flex items-center gap-2 mr-4">
            <Badge variant="outline" className="bg-gradient-glass border-glass-border animate-pulse">
              <Brain className="w-3 h-3 mr-1 text-green-500" />
              Genius Mode
            </Badge>
            <Badge variant="outline" className="bg-gradient-glass border-glass-border">
              <Cpu className="w-3 h-3 mr-1 text-blue-500" />
              {isLoading ? 'Generating' : 'Ready'}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <VercelDeploy>
              <Button variant="outline" size="sm" className="h-8 bg-gradient-glass border-glass-border hover:shadow-glow transition-all duration-300">
                <Rocket className="w-4 h-4" /> 
                <span className="hidden sm:inline ml-1">Deploy</span>
              </Button>
            </VercelDeploy>
            <Badge variant="outline" className="bg-gradient-glass border-glass-border hidden md:flex">
              <Terminal className="w-3 h-3 mr-1" /> Active
            </Badge>
          </div>
        </div>

        {/* Language & Project Controls */}
        <div className="px-3 md:px-4 pb-3 space-y-3">
          {/* Language Selection */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {languages.map(lang => (
              <Button
                key={lang.value}
                variant={selectedLanguage === lang.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedLanguage(lang.value)}
                className={cn(
                  "shrink-0 h-8 px-3 text-xs bg-gradient-glass border-glass-border hover:shadow-glow transition-all duration-300",
                  selectedLanguage === lang.value && "bg-gradient-primary text-primary-foreground shadow-glow"
                )}
              >
                <span className="mr-1">{lang.icon}</span> 
                <span className="hidden sm:inline">{lang.label}</span>
                <span className="sm:hidden">{lang.label.slice(0, 4)}</span>
              </Button>
            ))}
          </div>

          {/* Project Management */}
          <div className="flex gap-2 items-center">
            <Input
              placeholder="Project name..."
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="flex-1 h-8 text-xs bg-input/50 border-glass-border"
            />
            <Select value={currentProject?.id || ""} onValueChange={(value) => {
              const project = projects.find(p => p.id === value);
              setCurrentProject(project || null);
              if (project) {
                setSelectedLanguage(project.language);
                toast.success(`📂 Loaded ${project.name}`, {
                  description: `${project.files.length} files ready`,
                  duration: 2000,
                });
              }
            }}>
              <SelectTrigger className="w-32 h-8 text-xs bg-gradient-glass border-glass-border">
                <SelectValue placeholder="Projects" />
              </SelectTrigger>
              <SelectContent>
                {projects.map(project => (
                  <SelectItem key={project.id} value={project.id}>
                    <div className="flex items-center gap-2">
                      <Folder className="w-3 h-3" />
                      {project.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* MESSAGES AREA */}
      <div className="flex-1 overflow-y-auto p-2 md:p-4 space-y-3 md:space-y-4 min-h-0">
        {messages.map(message => (
          <div key={message.id} className="relative group">
            {message.isStreaming ? (
              <StreamingMessage 
                message={message}
                isActive={streamingMessageId === message.id}
              />
            ) : (
              <ChatMessage message={message} />
            )}
            
            {/* Enhanced Code Actions */}
            {message.code && (
              <Card className="mt-3 bg-gradient-glass border-glass-border shadow-glass overflow-hidden">
                <div className="flex items-center justify-between p-3 border-b border-glass-border bg-muted/20">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileCode className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-sm font-medium truncate">{message.language}</span>
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {message.code.split('\n').length} lines
                    </Badge>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => copyCode(message.code!)} 
                      className="h-7 w-7 sm:w-auto sm:px-2 p-0 sm:p-2 bg-gradient-glass border-glass-border hover:shadow-glow"
                    >
                      <Copy className="w-3 h-3" />
                      <span className="hidden sm:inline ml-1">Copy</span>
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => downloadCode(message.code!, `code.${message.language}`)} 
                      className="h-7 w-7 sm:w-auto sm:px-2 p-0 sm:p-2 bg-gradient-glass border-glass-border hover:shadow-glow"
                    >
                      <Download className="w-3 h-3" />
                      <span className="hidden sm:inline ml-1">Save</span>
                    </Button>
                    {projectName.trim() && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => saveToProject(message.code!, message.language!)} 
                        className="h-7 w-7 sm:w-auto sm:px-2 p-0 sm:p-2 bg-gradient-primary text-primary-foreground hover:shadow-glow"
                      >
                        <Save className="w-3 h-3" />
                        <span className="hidden sm:inline ml-1">Project</span>
                      </Button>
                    )}
                  </div>
                </div>
                <pre className="p-3 md:p-4 overflow-x-auto text-xs sm:text-sm bg-muted/10 max-h-96 font-mono">
                  <code className="text-foreground">{message.code}</code>
                </pre>
              </Card>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* REVOLUTIONARY INPUT SYSTEM */}
      <Card className="border-0 border-t border-glass-border bg-gradient-glass backdrop-blur-xl m-2 md:m-4 md:mt-0 shrink-0 shadow-glow">
        <form onSubmit={handleSubmit} className="p-3 md:p-4 space-y-3">
          {/* QUICK CODING ACTIONS */}
          <div className="flex gap-1 md:gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {[
              "Create React component",
              "Build REST API", 
              "Debug this code",
              "Optimize performance",
              "Add error handling",
              "Write unit tests",
              "Create database schema",
              "Build authentication"
            ].map(action => (
              <Button 
                key={action} 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => setInputValue(action)}
                className="text-xs whitespace-nowrap bg-gradient-glass border-glass-border hover:shadow-glow shrink-0 h-8 px-3"
              >
                {action.split(' ').slice(0, 2).join(' ')}
              </Button>
            ))}
          </div>

          <div className="flex items-end gap-2">
            <div className="flex-1 min-w-0">
              <Textarea
                ref={inputRef}
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder={`Describe your ${selectedLanguage} coding task... Be specific for best results!`}
                className="min-h-[100px] bg-input/50 border-glass-border backdrop-blur-sm focus:ring-2 focus:ring-primary/20 resize-none text-sm font-mono"
                disabled={isLoading || isSpellChecking}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    handleSubmit(e as any);
                  }
                }}
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-muted-foreground">
                  Press Ctrl+Enter to send • Use natural language • Be specific for best results
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    onClick={handleSpellCheck}
                    variant="ghost"
                    size="sm"
                    disabled={isLoading || !inputValue.trim() || isSpellChecking}
                    className="text-xs h-6 px-2 text-muted-foreground hover:text-primary"
                  >
                    <Wand2 className="w-3 h-3 mr-1" />
                    {isSpellChecking ? "Optimizing..." : "AI Fix"}
                  </Button>
                </div>
              </div>
            </div>
            
            <Button 
              type="submit" 
              disabled={isLoading || !inputValue.trim() || isSpellChecking} 
              className="bg-gradient-primary hover:shadow-glow transition-all duration-300 h-12 w-12 sm:w-auto sm:px-6 shrink-0 relative overflow-hidden"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline ml-2">Generate</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>

      {/* PROJECT SIDEBAR - Mobile Responsive */}
      {projects.length > 0 && (
        <div className="fixed bottom-20 right-4 md:bottom-4 md:right-4 z-10">
          <Card className="bg-gradient-glass border-glass-border shadow-glass p-3 max-w-xs">
            <div className="flex items-center gap-2 mb-2">
              <Folder className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Projects ({projects.length})</span>
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {projects.slice(-3).map(project => (
                <div key={project.id} className="flex items-center justify-between text-xs p-2 bg-muted/20 rounded">
                  <span className="truncate flex-1">{project.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {languages.find(l => l.value === project.language)?.icon}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CodeInterface;