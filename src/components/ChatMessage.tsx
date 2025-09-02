import { useState, useRef, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { Message, AIStreamChunk } from "@/types/chat";
import { AIService } from "@/services/aiService";

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState("pandanexus");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const aiService = useRef(new AIService()).current;

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (content: string, image?: string) => {
    if (!content.trim() && !image) return;
    
    setIsLoading(true);
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date(),
      image
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    
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

      // Define the onChunk callback properly
      const onChunk = (chunk: AIStreamChunk) => {
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
        selectedService,
        onChunk
      );
      
    } catch (error) {
      console.error("Chat error:", error);
      
      setMessages(prev => prev.filter(msg => msg.id !== streamingId));
      setIsLoading(false);
      setStreamingMessageId(null);
      
      toast.error("Failed to send message", {
        description: "Please try again or check your connection.",
        duration: 3000,
      });
    }
  };

  // Render UI for the chat interface
  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs md:max-w-md lg:max-w-lg rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              {message.image && (
                <img
                  src={message.image}
                  alt="Uploaded"
                  className="rounded mb-2 max-w-full h-auto"
                />
              )}
              {message.imageUrl && (
                <img
                  src={message.imageUrl}
                  alt="Generated"
                  className="rounded mb-2 max-w-full h-auto"
                />
              )}
              <p className="whitespace-pre-wrap">{message.content}</p>
              {message.isStreaming && (
                <span className="inline-block w-2 h-4 bg-current ml-1 animate-pulse"></span>
              )}
              <div className="text-xs mt-1 opacity-70">
                {message.timestamp.toLocaleTimeString()} 
                {message.model && ` · ${message.model}`}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(input);
              }
            }}
            disabled={isLoading}
          />
          <button
            onClick={() => handleSendMessage(input)}
            disabled={isLoading || !input.trim()}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
