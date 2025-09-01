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

// Advanced response caching with LRU eviction
class ResponseCache {
  private cache: Map<string, { response: AIResponse; timestamp: number; expires: number }>;
  private maxSize: number;

  constructor(maxSize: number = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  get(key: string): AIResponse | null {
    const item = this.cache.get(key);
    if (!item) return null;

    // Check if expired
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }

    // Move to front (most recently used)
    this.cache.delete(key);
    this.cache.set(key, item);
    
    return item.response;
  }

  set(key: string, response: AIResponse, ttl: number = 5 * 60 * 1000): void {
    // Evict if needed (LRU)
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      response,
      timestamp: Date.now(),
      expires: Date.now() + ttl
    });
  }
}

const responseCache = new ResponseCache(200);

// Connection pool simulation
const connectionPool: Array<{ lastUsed: number; inUse: boolean }> = [];
for (let i = 0; i < 5; i++) {
  connectionPool.push({ lastUsed: 0, inUse: false });
}

export class AIService {
  private apiKey: string;
  private baseUrl = "https://openrouter.ai/api/v1";
  private abortController: AbortController | null = null;
  private connectionTested = false;
  private preWarmPromise: Promise<void> | null = null;

  constructor() {
    this.apiKey = import.meta.env.VITE_API_KEY || '';
    
    if (!this.apiKey && typeof window !== 'undefined') {
      this.apiKey = (window as any)._env_?.VITE_API_KEY || '';
    }
    
    if (!this.apiKey) {
      console.error('❌ OpenRouter API key not found');
    } else {
      console.log('✅ OpenRouter API key loaded');
      // Pre-warm connection in background
      this.preWarmConnection();
    }
  }

  private models = {
    auto: "deepseek/deepseek-chat-v3.1:free",
    code: "deepseek/deepseek-chat-v3.1:free",
    creative: "deepseek/deepseek-chat-v3.1:free",
    knowledge: "cognitivecomputations/dolphin-mistral-24b-venice-edition:free",
    general: "mistralai/mistral-nemo:free",
    image: "google/gemini-2.5-flash-image-preview:free"
  };

  // Pre-warm API connection
  private async preWarmConnection(): Promise<void> {
    if (this.preWarmPromise) return this.preWarmPromise;
    
    this.preWarmPromise = (async () => {
      try {
        // Create a minimal pre-warm request
        const controller = new AbortController();
        setTimeout(() => controller.abort(), 3000);
        
        await fetch(`${this.baseUrl}/models`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
          },
          signal: controller.signal
        });
        
        this.connectionTested = true;
        console.log('✅ API connection pre-warmed');
      } catch (error) {
        console.log('⚠️ Pre-warm failed (non-critical)', error);
      }
    })();
    
    return this.preWarmPromise;
  }

  // Get an available connection from pool
  private getConnection(): number {
    // Find available connection
    for (let i = 0; i < connectionPool.length; i++) {
      if (!connectionPool[i].inUse) {
        connectionPool[i].inUse = true;
        connectionPool[i].lastUsed = Date.now();
        return i;
      }
    }
    
    // If all busy, return the least recently used
    let lruIndex = 0;
    for (let i = 1; i < connectionPool.length; i++) {
      if (connectionPool[i].lastUsed < connectionPool[lruIndex].lastUsed) {
        lruIndex = i;
      }
    }
    
    connectionPool[lruIndex].lastUsed = Date.now();
    return lruIndex;
  }

  // Release connection back to pool
  private releaseConnection(index: number): void {
    if (index >= 0 && index < connectionPool.length) {
      connectionPool[index].inUse = false;
    }
  }

  // Create a fast hash for cache key
  private fastHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  private getCacheKey(messages: AIMessage[], serviceType: string): string {
    const keyData = `${serviceType}:${JSON.stringify(messages)}`;
    return this.fastHash(keyData);
  }

  private getModel(serviceType: string, hasImage: boolean): string {
    if (hasImage) return this.models.image;
    return this.models[serviceType as keyof typeof this.models] || this.models.auto;
  }

  // Cancel any ongoing request
  cancelRequest(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  // Ultra-fast message sending with multiple optimizations
  async sendMessage(messages: AIMessage[], serviceType: string = 'auto'): Promise<AIResponse> {
    // Check cache first with fast hash
    const cacheKey = this.getCacheKey(messages, serviceType);
    const cachedResponse = responseCache.get(cacheKey);
    if (cachedResponse) {
      console.log('⚡ Using cached response');
      return cachedResponse;
    }

    try {
      if (!this.apiKey) {
        throw new Error('API key not configured');
      }

      const lastMessage = messages[messages.length - 1];
      const hasImage = !!lastMessage.image;
      const isImageGeneration = /generate.*image|create.*image|make.*image|draw|picture|photo/i.test(lastMessage.content);
      const selectedModel = this.getModel(serviceType, hasImage);

      // Fast image generation with smaller size
      if (isImageGeneration && !hasImage) {
        const prompt = lastMessage.content.replace(/generate|create|make|draw/gi, '').trim();
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=384&height=384&seed=${Date.now()}`;
        const response = {
          content: `I've generated an image for: "${prompt}". Here's your custom AI-generated image!`,
          model: 'Pollinations AI (Fast)',
          imageUrl
        };
        responseCache.set(cacheKey, response, 2 * 60 * 1000);
        return response;
      }

      // Get connection from pool
      const connectionId = this.getConnection();

      // Prepare minimal API messages
      const apiMessages = [
        { 
          role: 'system', 
          content: "You are PandaNexus. Provide concise responses." 
        },
        // Only include the very last message for maximum speed
        ...messages.slice(-1).map(msg => ({
          role: msg.role,
          content: msg.image ? [
            { type: "text", text: msg.content.substring(0, 200) }, // Limit text length
            { type: "image_url", image_url: { url: msg.image } }
          ] : msg.content.substring(0, 300) // Limit to 300 chars for speed
        }))
      ];

      // Set up abort controller with aggressive timeout
      this.abortController = new AbortController();
      const timeoutId = setTimeout(() => {
        if (this.abortController) {
          this.abortController.abort();
        }
      }, 4500); // 4.5 second timeout

      // Use connection pool and pre-warmed connection
      const startTime = Date.now();
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://pandanexus.dev',
          'X-Title': 'PandaNexus AI Platform'
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: apiMessages,
          // Optimized for speed
          temperature: 0.5,
          max_tokens: 600, // Reduced for faster responses
          top_p: 0.7,
          frequency_penalty: 0.1,
          presence_penalty: 0.1,
          stream: false
        }),
        signal: this.abortController.signal
      });

      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;
      console.log(`✅ API response in ${responseTime}ms`);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      
      const aiResponse = {
        content: data.choices?.[0]?.message?.content || lastMessage.content,
        model: data.model || selectedModel,
        imageUrl: lastMessage.image
      };

      // Cache the successful response with shorter TTL for dynamic content
      responseCache.set(cacheKey, aiResponse, 2 * 60 * 1000);
      
      return aiResponse;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        // Try to return a fallback response from cache if timeout
        const similarCacheKey = this.getCacheKey(messages.slice(-1), serviceType);
        const fallback = responseCache.get(similarCacheKey);
        
        if (fallback) {
          console.log('⚡ Using fallback cached response after timeout');
          return fallback;
        }
        
        return {
          content: "I'm working on your request. Please try again in a moment for a faster response.",
          model: 'Error',
          error: "Request timeout"
        };
      }
      
      console.error("❌ AIService Error:", error);
      return {
        content: "I'm optimizing for faster responses. Please try your question again.",
        model: 'Error',
        error: error.message
      };
    } finally {
      this.abortController = null;
    }
  }

  // Fast local-only spell check
  async spellCheck(text: string): Promise<string> {
    // Ultra-fast correction of only the most common errors
    const quickCorrections: Record<string, string> = {
      'teh': 'the', 
      'recieve': 'receive', 
      'seperate': 'separate',
      'definately': 'definitely'
    };
    
    let corrected = text;
    Object.entries(quickCorrections).forEach(([wrong, right]) => {
      corrected = corrected.replace(new RegExp(wrong, 'gi'), right);
    });
    
    return corrected;
  }
}

export const aiService = new AIService();

// Initialize service with pre-warming
if (typeof window !== 'undefined') {
  // Pre-warm on user interaction for better performance
  const warmOnInteraction = () => {
    aiService.preWarmConnection();
    window.removeEventListener('click', warmOnInteraction);
    window.removeEventListener('touchstart', warmOnInteraction);
  };
  
  window.addEventListener('click', warmOnInteraction);
  window.addEventListener('touchstart', warmOnInteraction);
}
