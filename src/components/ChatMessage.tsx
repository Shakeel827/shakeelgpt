import { useState, useRef, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";

// ... other imports

const ChatInterface = () => {
  // ... existing state and ref declarations
  
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

      // Ensure onChunkCallback is a function before passing it
      if (typeof onChunkCallback === 'function') {
        await aiService.sendMessageStream(
          conversationHistory, 
          selectedService,
          onChunkCallback
        );
      } else {
        throw new Error('onChunk callback is not a function');
      }
      
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

  // ... rest of the component
};

export default ChatInterface;
