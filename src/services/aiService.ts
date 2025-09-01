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
    if (content.length > 300) ttl = Math.min(ttl, 3 * 60 * 1000); // Shorter for long responses
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
  private apiKey: string;
  private baseUrl = "https://openrouter.ai/api/v1";
  private abortController: AbortController | null = null;
  private connectionTested = false;

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
    if (this.connectionTested) return;
    
    try {
      // Create a minimal pre-warm request
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 2000);
      
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

  private getModel(serviceType: string, hasImage: boolean): string {
    if (hasImage) return this.models.image;
    return this.models[serviceType as keyof typeof this.models] || this.models.auto;
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

  // Optimized message sending with smart caching
  async sendMessage(messages: AIMessage[], serviceType: string = 'auto'): Promise<AIResponse> {
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

      const hasImage = !!lastMessage.image;
      const isImageGeneration = /generate.*image|create.*image|make.*image|draw|picture|photo/i.test(lastMessage.content);
      const selectedModel = this.getModel(serviceType, hasImage);

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

      // Prepare API messages with optimized history
      const apiMessages = [
        { 
          role: 'system', 
          content: "You are PandaNexus, an advanced AI assistant. Provide helpful and concise responses." 
        },
        // Include only relevant message history
        ...messages.slice(-3).map(msg => ({
          role: msg.role,
          content: msg.image ? [
            { type: "text", text: msg.content },
            { type: "image_url", image_url: { url: msg.image } }
          ] : msg.content
        }))
      ];

      // Set up abort controller with reasonable timeout
      this.abortController = new AbortController();
      const timeoutId = setTimeout(() => {
        if (this.abortController) {
          this.abortController.abort();
        }
      }, 25000); // 25 second timeout

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
          temperature: serviceType === 'creative' ? 0.7 : serviceType === 'code' ? 0.3 : 0.5,
          max_tokens: 1200,
          top_p: 0.8,
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

      // Cache the successful response
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
    // Simple correction of common errors
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
