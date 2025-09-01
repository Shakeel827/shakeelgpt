import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ChatMessage from "./ChatMessage";
import TypingIndicator from "./TypingIndicator";
import VercelDeploy from "./VercelDeploy";
import { aiService } from "@/services/aiService";
import { Send, Code, Terminal, FileCode, Zap, Copy, Download, ArrowLeft, Rocket } from "lucide-react";
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
}

interface CodeInterfaceProps {
  onBack: () => void;
}

const CodeInterface = ({ onBack }: CodeInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "🚀 Welcome to PandaNexus Code Studio! I'm your AI coding assistant. What would you like to build today?",
      role: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const languages = [
    { value: "javascript", label: "JavaScript", icon: "🟨" },
    { value: "typescript", label: "TypeScript", icon: "🔷" },
    { value: "python", label: "Python", icon: "🐍" },
    { value: "react", label: "React", icon: "⚛️" },
    { value: "nodejs", label: "Node.js", icon: "🟢" },
    { value: "html", label: "HTML", icon: "🌐" },
    { value: "css", label: "CSS", icon: "🎨" },
    { value: "sql", label: "SQL", icon: "🗄️" }
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast("Code copied!", { duration: 2000 });
    } catch {
      toast("Failed to copy", { duration: 2000 });
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
    toast(`Saved as ${filename}`, { duration: 2000 });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    // Create user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: 'user',
      timestamp: new Date(),
      language: selectedLanguage
    };

    // Add user message to chat immediately for better UX
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Prepare messages in the format expected by the AI service
      const conversationHistory: Array<{
        role: 'system' | 'user' | 'assistant';
        content: string;
      }> = [
        {
          role: 'system',
          content: `You are an expert coding assistant. Generate clean, efficient code in ${selectedLanguage}. Include comments to explain the code.`
        },
        ...messages
          .filter((msg): msg is Message & { role: 'user' | 'assistant' } => 
            msg.role === 'user' || msg.role === 'assistant'
          )
          .slice(-4) // Keep conversation history manageable
          .map(msg => ({
            role: msg.role,
            content: msg.content
          })),
        {
          role: 'user',
          content: inputValue
        }
      ];

      // Add typing indicator
      const typingMessage: Message = {
        id: 'typing',
        content: 'Generating code...',
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, typingMessage]);

      // Send message to AI service
      const response = await aiService.sendMessage(conversationHistory, 'code');
      
      // Remove typing indicator
      setMessages(prev => prev.filter(msg => msg.id !== 'typing'));

      // Process AI response
      let code = '';
      let content = response.content || 'No response from AI service';
      let detectedLanguage = selectedLanguage;
      
      // Extract code block if exists
      const codeMatch = content.match(/```(\w+)?\n([\s\S]*?)```/);
      if (codeMatch) {
        code = codeMatch[2].trim();
        detectedLanguage = codeMatch[1] || selectedLanguage;
      } else if (content.trim().includes('\n') || content.trim().includes('{') || content.trim().includes(';')) {
        // If no code block but looks like code, use the whole content
        code = content;
      }

      // Create assistant message with the response
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: content,
        role: 'assistant',
        timestamp: new Date(),
        code,
        language: detectedLanguage
      };

      // Add assistant message to chat
      setMessages(prev => [...prev.filter(msg => msg.id !== 'typing'), assistantMessage]);
      toast.success("Code generated successfully!");

    } catch (error) {
      console.error("AI Error:", error);
      
      // Remove typing indicator if it exists
      setMessages(prev => prev.filter(msg => msg.id !== 'typing'));
      
      // Create error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm having trouble connecting to the AI service. Please check your internet connection and try again. If the problem persists, the service might be temporarily unavailable.",
        role: 'assistant',
        timestamp: new Date()
      };
      
      // Add error message to chat
      setMessages(prev => [...prev, errorMessage]);
      
      // Show error toast
      toast.error("Failed to generate code. Please try again.");
      
      // Fallback to offline examples
      try {
        const fallbackCode: Record<string, string> = {
          javascript: `// Example JavaScript function\nfunction greet(name) { \n  return \`Hello, \${name}!\`; \n}\n\n// Example usage\nconsole.log(greet('Developer'));`,
          typescript: `// Example TypeScript interface and function\ninterface User { \n  id: number;\n  name: string;\n}\n\nfunction createUser(user: User): User {\n  return {\n    ...user,\n    createdAt: new Date()\n  };\n};

// Example usage\nconst newUser = createUser({ id: 1, name: 'John' });`,
          python: `# Example Python function\ndef greet(name):\n    """Greet a person by name"""\n    return f"Hello, {name}!"\n\n# Example usage\nprint(greet("Developer"))`,
          react: `// Example React component\nimport React from 'react';\n\ninterface WelcomeProps {\n  name: string;\n}\n\nconst Welcome: React.FC<WelcomeProps> = ({ name }) => {\n  return (\n    <div className="p-4 bg-white rounded-lg shadow">\n      <h1 className="text-2xl font-bold text-gray-800">Hello, {name}!</h1>\n      <p className="text-gray-600">Welcome to PandaNexus Code Studio</p>\n    </div>\n  );\n};\n\nexport default Welcome;`
        };

        const fallbackMessage: Message = {
          id: (Date.now() + 2).toString(),
          content: `Here's a ${selectedLanguage} example to get you started:`,
          role: 'assistant',
          timestamp: new Date(),
          code: fallbackCode[selectedLanguage] || fallbackCode.javascript,
          language: selectedLanguage
        };

        setMessages(prev => [...prev, fallbackMessage]);
        toast.info("Showing offline example");
      } catch (fallbackError) {
        console.error("Fallback error:", fallbackError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <Card className="border-0 border-b border-glass-border bg-gradient-glass backdrop-blur-xl shrink-0">
        <div className="flex items-center justify-between p-3 md:p-4">
          <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
            <Button variant="ghost" size="sm" onClick={onBack} className="hover:bg-accent/20 h-8 w-8 p-0 shrink-0">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2 min-w-0">
              <div className="relative shrink-0">
                <PandaLogo className="w-8 h-8" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse"></div>
              </div>
              <div className="min-w-0">
                <h1 className="text-lg md:text-xl font-bold bg-gradient-text bg-clip-text text-transparent flex items-center gap-2">
                  <Code className="w-4 h-4 shrink-0" />
                  <span className="truncate">Code Studio</span>
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block">AI-Powered Development</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <VercelDeploy>
              <Button variant="outline" size="sm" className="h-8 bg-gradient-glass border-glass-border hover:shadow-glow transition-all duration-300">
                <Rocket className="w-4 h-4" /> <span className="hidden sm:inline ml-1">Deploy</span>
              </Button>
            </VercelDeploy>
            <Badge variant="outline" className="bg-gradient-glass border-glass-border hidden md:flex">
              <Terminal className="w-3 h-3 mr-1" /> Active
            </Badge>
          </div>
        </div>
        <div className="px-3 md:px-4 pb-3">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {languages.map(lang => (
              <Button
                key={lang.value}
                variant={selectedLanguage === lang.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedLanguage(lang.value)}
                className={cn(
                  "shrink-0 h-8 px-3 text-xs bg-gradient-glass border-glass-border hover:shadow-glow transition-all duration-300",
                  selectedLanguage === lang.value && "bg-gradient-primary text-primary-foreground"
                )}
              >
                <span className="mr-1">{lang.icon}</span> {lang.label}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      <div className="flex-1 overflow-y-auto p-2 md:p-4 space-y-3 md:space-y-4 min-h-0">
        {messages.map(message => (
          <div key={message.id}>
            <ChatMessage message={message} />
            {message.code && (
              <Card className="mt-3 bg-gradient-glass border-glass-border shadow-glass overflow-hidden">
                <div className="flex items-center justify-between p-3 border-b border-glass-border bg-muted/20">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileCode className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-sm font-medium truncate">{message.language}</span>
                    <Badge variant="secondary" className="text-xs shrink-0">{message.code.split('\n').length} lines</Badge>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button size="sm" variant="outline" onClick={() => copyCode(message.code!)} className="h-7 w-7 sm:w-auto sm:px-2 p-0 sm:p-2">
                      <Copy className="w-3 h-3" /><span className="hidden sm:inline ml-1">Copy</span>
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => downloadCode(message.code!, `code.${message.language}`)} className="h-7 w-7 sm:w-auto sm:px-2 p-0 sm:p-2">
                      <Download className="w-3 h-3" /><span className="hidden sm:inline ml-1">Save</span>
                    </Button>
                  </div>
                </div>
                <pre className="p-3 md:p-4 overflow-x-auto text-xs sm:text-sm bg-muted/10 max-h-96">
                  <code className="text-foreground">{message.code}</code>
                </pre>
              </Card>
            )}
          </div>
        ))}
        {isLoading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      <Card className="border-0 border-t border-glass-border bg-gradient-glass backdrop-blur-xl m-2 md:m-4 md:mt-0 shrink-0">
        <form onSubmit={handleSubmit} className="p-3 md:p-4 space-y-3">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {["Create a React component","Debug this code","Optimize performance","Add error handling","Write unit tests"].map(action => (
              <Button key={action} type="button" variant="outline" size="sm" onClick={() => setInputValue(action)}
                className="text-xs whitespace-nowrap bg-gradient-glass border-glass-border hover:shadow-glow shrink-0 h-8">{action}</Button>
            ))}
          </div>
          <div className="flex items-end gap-2">
            <div className="flex-1 min-w-0">
              <Textarea
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder={`Describe your ${selectedLanguage} coding task...`}
                className="min-h-[80px] bg-input/50 border-glass-border backdrop-blur-sm focus:ring-2 focus:ring-primary/20 resize-none text-sm"
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    handleSubmit(e as any);
                  }
                }}
              />
              <p className="text-xs text-muted-foreground mt-1">Press Ctrl+Enter to send • Use natural language to describe your task</p>
            </div>
            <Button type="submit" disabled={isLoading || !inputValue.trim()} className="bg-gradient-primary hover:shadow-glow transition-all duration-300 h-12 w-12 sm:w-auto sm:px-6 shrink-0">
              {isLoading ? <div className="w-4 h-4 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin" /> : <>
                <Send className="w-4 h-4" /><span className="hidden sm:inline ml-2">Generate</span>
              </>}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CodeInterface;
