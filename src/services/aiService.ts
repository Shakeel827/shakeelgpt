// src/services/AIService.ts
export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  image?: string;
}

export interface AIResponse {
  content: string;
  model: string;
  imageUrl?: string;
  error?: string;
}

export interface AIStreamChunk {
  chunk: string;
  isFinal: boolean;
  error?: string;
}

// Smart response cache with adaptive TTL
class SmartResponseCache {
  private cache: Map<string, { response: AIResponse; timestamp: number; ttl: number }>;
  private hitCount: Map<string, number>;
  private maxSize: number;

  constructor(maxSize: number = 100) {
    this.cache = new Map();
    this.hitCount = new Map();
    this.maxSize = maxSize;
  }

  get(key: string): AIResponse | null {
    const item = this.cache.get(key);
    if (!item) return null;

    // Check if expired
    if (Date.now() > item.timestamp + item.ttl) {
      this.cache.delete(key);
      this.hitCount.delete(key);
      return null;
    }

    // Update hit count
    const hits = this.hitCount.get(key) || 0;
    this.hitCount.set(key, hits + 1);
    
    return item.response;
  }

  set(key: string, response: AIResponse, baseTtl: number = 5 * 60 * 1000): void {
    // Adaptive TTL based on response characteristics
    let ttl = baseTtl;
    const content = response.content;
    
    // Longer TTL for factual responses, shorter for creative ones
    if (content.length > 300) ttl = Math.min(ttl, 3 * 60 * 1000);
    if (content.includes('I think') || content.includes('in my opinion')) ttl = 2 * 60 * 1000;
    
    // Evict least frequently used if needed
    if (this.cache.size >= this.maxSize) {
      let lfuKey: string | null = null;
      let minHits = Infinity;
      
      for (const [key, hits] of this.hitCount.entries()) {
        if (hits < minHits) {
          minHits = hits;
          lfuKey = key;
        }
      }
      
      if (lfuKey) {
        this.cache.delete(lfuKey);
        this.hitCount.delete(lfuKey);
      }
    }

    this.cache.set(key, {
      response,
      timestamp: Date.now(),
      ttl
    });
    
    // Initialize hit count
    if (!this.hitCount.has(key)) {
      this.hitCount.set(key, 0);
    }
  }
}

const responseCache = new SmartResponseCache(150);

// Common response patterns for instant replies
const instantResponses: {pattern: RegExp, response: string}[] = [
  { pattern: /^(hello|hi|hey|greetings|good morning|good afternoon|good evening)/i, response: "Hello! I'm PandaNexus AI, created by Shakeel. How can I assist you today?" },
  { pattern: /^(thanks|thank you|appreciate it|cheers)/i, response: "You're welcome! Is there anything else I can help you with?" },
  { pattern: /^(how are you|how's it going|how do you do)/i, response: "I'm functioning well, thank you for asking! How can I help you today?" },
  { pattern: /^(what can you do|what are your capabilities|help)/i, response: "I can answer questions, help with research, generate ideas, and even create images. What would you like me to help you with?" },
  { pattern: /^(who are you|what are you|introduce yourself)/i, response: "I'm PandaNexus, an advanced AI assistant created by Shakeel. I'm here to help answer your questions and assist with various tasks." },
  { pattern: /^(bye|goodbye|see you|farewell)/i, response: "Goodbye! Feel free to return if you have more questions." }
];

export class AIService {
  private baseUrl = "http://localhost:3001";
  private abortController: AbortController | null = null;

  constructor() {
    console.log('✅ Using local AI API server');
    // Removed pre-warm as it was causing issues
  }

  // Create a fast hash for cache key
  private fastHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString();
  }

  private getCacheKey(messages: AIMessage[], serviceType: string): string {
    const keyData = `${serviceType}:${JSON.stringify(messages)}`;
    return this.fastHash(keyData);
  }

  // Check for instant responses
  private checkInstantResponse(message: string): string | null {
    const trimmed = message.trim();
    for (const {pattern, response} of instantResponses) {
      if (pattern.test(trimmed)) {
        return response;
      }
    }
    return null;
  }

  // Cancel any ongoing request
  cancelRequest(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  // NEW: Optimized streaming method for real-time responses
  async sendMessageStream(
    messages: AIMessage[], 
    onChunk: (chunk: AIStreamChunk) => void
  ): Promise<void> {
    
    // Check for instant responses first
    const lastMessage = messages[messages.length - 1];
    const instantResponse = this.checkInstantResponse(lastMessage.content);
    if (instantResponse) {
      console.log('⚡ Using instant response');
      // Simulate streaming for instant responses
      const words = instantResponse.split(' ');
      for (let i = 0; i < words.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 30));
        onChunk({
          chunk: words[i] + (i < words.length - 1 ? ' ' : ''),
          isFinal: i === words.length - 1
        });
      }
      return;
    }

    try {
      const hasImage = !!lastMessage.image;
      const isImageGeneration = /generate.*image|create.*image|make.*image|draw|picture|photo/i.test(lastMessage.content);

      // Handle image generation (non-streaming)
      if (isImageGeneration && !hasImage) {
        const prompt = lastMessage.content.replace(/generate|create|make|draw/gi, '').trim();
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512&seed=${Date.now()}`;
        const response = `I've generated an image for: "${prompt}". Here's your custom AI-generated image!`;
        
        onChunk({
          chunk: response,
          isFinal: true,
        });
        return;
      }

      this.abortController = new AbortController();
      
      const response = await fetch(`${this.baseUrl}/api/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages
        }),
        signal: this.abortController.signal
      });

      if (!response.ok) {
        throw new Error(`Stream request failed: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const decoder = new TextDecoder();
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.error) {
                throw new Error(data.error);
              }

              if (data.response) {
                fullResponse += data.response;
                onChunk({
                  chunk: data.response,
                  isFinal: false
                });
              }

              if (data.done) {
                // Cache the successful response
                responseCache.set(this.getCacheKey(messages, 'auto'), {
                  content: fullResponse,
                  model: data.model || 'phi3'
                });
                
                onChunk({
                  chunk: '',
                  isFinal: true
                });
                return;
              }
            } catch (e) {
              console.error('Error parsing stream data:', e);
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        onChunk({
          chunk: '',
          isFinal: true,
          error: "Request cancelled"
        });
        return;
      }
      
      onChunk({
        chunk: `Error: ${error.message}`,
        isFinal: true,
        error: error.message
      });
    } finally {
      this.abortController = null;
    }
  }

  // Original method for non-streaming (kept for compatibility)
  async sendMessage(messages: AIMessage[]): Promise<AIResponse> {
    // Check for instant responses first
    const lastMessage = messages[messages.length - 1];
    const instantResponse = this.checkInstantResponse(lastMessage.content);
    if (instantResponse) {
      console.log('⚡ Using instant response');
      return {
        content: instantResponse,
        model: 'PandaNexus Instant'
      };
    }

    // Check cache
    const cacheKey = this.getCacheKey(messages, 'auto');
    const cachedResponse = responseCache.get(cacheKey);
    if (cachedResponse) {
      console.log('⚡ Using cached response');
      return cachedResponse;
    }

    try {
      const hasImage = !!lastMessage.image;
      const isImageGeneration = /generate.*image|create.*image|make.*image|draw|picture|photo/i.test(lastMessage.content);

      // Fast image generation
      if (isImageGeneration && !hasImage) {
        const prompt = lastMessage.content.replace(/generate|create|make|draw/gi, '').trim();
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512&seed=${Date.now()}`;
        const response = {
          content: `I've generated an image for: "${prompt}". Here's your custom AI-generated image!`,
          model: 'Pollinations AI',
          imageUrl
        };
        responseCache.set(cacheKey, response, 2 * 60 * 1000);
        return response;
      }

      this.abortController = new AbortController();
      const timeoutId = setTimeout(() => {
        if (this.abortController) {
          this.abortController.abort();
        }
      }, 30000); // 30 second timeout

      const startTime = Date.now();
      
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages
        }),
        signal: this.abortController.signal
      });

      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;
      console.log(`✅ Local API response in ${responseTime}ms`);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      
      const aiResponse = {
        content: data.content || 'No response generated.',
        model: data.model || 'phi3',
        imageUrl: lastMessage.image
      };

      responseCache.set(cacheKey, aiResponse);
      
      return aiResponse;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return {
          content: "The request is taking longer than expected. Please try again or rephrase your question.",
          model: 'Error',
          error: "Request timeout"
        };
      }
      
      console.error("❌ AIService Error:", error);
      return {
        content: "I'm experiencing technical difficulties. Please try again in a moment.",
        model: 'Error',
        error: error.message
      };
    } finally {
      this.abortController = null;
    }
  }

  // Fast local-only spell check
  async spellCheck(text: string): Promise<string> {
    const quickCorrections: Record<string, string> = {
      'teh': 'the', 
      'recieve': 'receive', 
      'seperate': 'separate',
      'definately': 'definitely',
      'neccessary': 'necessary'
    };
    
    let corrected = text;
    Object.entries(quickCorrections).forEach(([wrong, right]) => {
      corrected = corrected.replace(new RegExp(wrong, 'gi'), right);
    });
    
    return corrected;
  }
}

export const aiService = new AIService();
