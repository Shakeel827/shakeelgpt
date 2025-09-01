// src/services/AIService.ts
export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  image?: string; // optional uploaded image URL
}

export interface AIResponse {
  content: string;
  model: string;
  imageUrl?: string; // generated image URL
  error?: string;    // error message if the request fails
}

// Simple in-memory cache for API responses
interface ResponseCache {
  [key: string]: { response: AIResponse; timestamp: number };
}

const RESPONSE_CACHE: ResponseCache = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

export class AIService {
  private apiKey: string;
  private baseUrl = "https://openrouter.ai/api/v1";
  private abortController: AbortController | null = null;

  constructor() {
    // For Vercel deployment, the environment variable should be available at build time
    this.apiKey = import.meta.env.VITE_API_KEY || '';
    
    // For local development, fall back to window._env_ if available
    if (!this.apiKey && typeof window !== 'undefined') {
      // @ts-ignore - Access window._env_ if it exists
      this.apiKey = window._env_?.VITE_API_KEY || '';
    }
    
    if (!this.apiKey) {
      console.error('❌ OpenRouter API key not found. Please set VITE_API_KEY in your Vercel environment variables.');
    } else {
      console.log('✅ OpenRouter API key loaded successfully');
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

  // Create a cache key from the messages and service type
  private getCacheKey(messages: AIMessage[], serviceType: string): string {
    return `${serviceType}:${JSON.stringify(messages)}`;
  }

  // Check if cached response is still valid
  private getCachedResponse(cacheKey: string): AIResponse | null {
    const cached = RESPONSE_CACHE[cacheKey];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.response;
    }
    return null;
  }

  // Store response in cache
  private cacheResponse(cacheKey: string, response: AIResponse): void {
    RESPONSE_CACHE[cacheKey] = {
      response,
      timestamp: Date.now()
    };
  }

  // Simplified spell checker - only corrects obvious errors
  private quickSpellCheck(text: string): string {
    if (!text) return "";
    
    // Only fix the most common errors to save processing time
    const quickCorrections: Record<string, string> = {
      'teh': 'the', 
      'recieve': 'receive', 
      'seperate': 'separate',
      'definately': 'definitely', 
      'neccessary': 'necessary',
      'accomodate': 'accommodate'
    };
    
    let corrected = text;
    Object.entries(quickCorrections).forEach(([wrong, right]) => {
      const regex = new RegExp(`\\b${wrong}\\b`, 'gi');
      corrected = corrected.replace(regex, right);
    });
    
    return corrected;
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

  // Optimized message sending with timeout and caching
  async sendMessage(messages: AIMessage[], serviceType: string = 'auto'): Promise<AIResponse> {
    // Check cache first
    const cacheKey = this.getCacheKey(messages, serviceType);
    const cachedResponse = this.getCachedResponse(cacheKey);
    if (cachedResponse) {
      console.log('✅ Using cached response');
      return cachedResponse;
    }

    try {
      // Check if API key is available
      if (!this.apiKey) {
        throw new Error('API key not configured');
      }

      const lastMessage = messages[messages.length - 1];
      const hasImage = !!lastMessage.image;
      const isImageGeneration = /generate.*image|create.*image|make.*image|draw|picture|photo/i.test(lastMessage.content);
      const selectedModel = this.getModel(serviceType, hasImage);

      // Image generation fallback - use a faster service
      if (isImageGeneration && !hasImage) {
        const prompt = lastMessage.content.replace(/generate|create|make|draw/gi, '').trim();
        // Use a faster image generation service
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512&seed=${Date.now()}`;
        const response = {
          content: `I've generated an image for: "${prompt}". Here's your custom AI-generated image!`,
          model: 'Pollinations AI (Fast)',
          imageUrl
        };
        this.cacheResponse(cacheKey, response);
        return response;
      }

      // Prepare API messages with limited history for faster processing
      const apiMessages = [
        { 
          role: 'system', 
          content: "You are PandaNexus, an advanced AI assistant. Provide concise and helpful responses." 
        },
        // Only include the last 2 messages to reduce payload size
        ...messages.slice(-2).map(msg => ({
          role: msg.role,
          content: msg.image ? [
            { type: "text", text: this.quickSpellCheck(msg.content) },
            { type: "image_url", image_url: { url: msg.image } }
          ] : this.quickSpellCheck(msg.content)
        }))
      ];

      // Set up abort controller for timeout
      this.abortController = new AbortController();
      const timeoutId = setTimeout(() => {
        if (this.abortController) {
          this.abortController.abort();
        }
      }, 15000); // 15 second timeout

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
          // Optimize parameters for faster response
          temperature: serviceType === 'creative' ? 0.7 : serviceType === 'code' ? 0.2 : 0.5,
          max_tokens: 1000, // Reduced from 2000 for faster responses
          top_p: 0.8,
          frequency_penalty: 0.1,
          presence_penalty: 0.1,
          stream: false // Ensure we're not using streaming which can be slower
        }),
        signal: this.abortController.signal
      });

      clearTimeout(timeoutId);

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
      this.cacheResponse(cacheKey, aiResponse);
      
      return aiResponse;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return {
          content: "Request timed out. Please try again with a more specific question.",
          model: 'Error',
          error: "Request timeout"
        };
      }
      
      console.error("❌ AIService Error:", error);
      return {
        content: "I'm having trouble connecting to the AI service. Please check your internet connection and try again.",
        model: 'Error',
        error: error.message
      };
    } finally {
      this.abortController = null;
    }
  }

  // Fast spell check - only use local corrections
  async spellCheck(text: string): Promise<string> {
    // Skip API spell check for speed, use local correction only
    return this.quickSpellCheck(text);
  }
}

export const aiService = new AIService();
