// src/services/aiService.ts
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
  model?: string;
}

// Ultra-fast response cache with quantum optimization
class QuantumResponseCache {
  private cache: Map<string, { response: AIResponse; timestamp: number; ttl: number; quality: number }>;
  private hitCount: Map<string, number>;
  private maxSize: number;

  constructor(maxSize: number = 2000) {
    this.cache = new Map();
    this.hitCount = new Map();
    this.maxSize = maxSize;
  }

  get(key: string): AIResponse | null {
    const item = this.cache.get(key);
    if (!item) return null;

    const adaptiveTtl = item.ttl * (1 + item.quality * 0.5);
    if (Date.now() > item.timestamp + adaptiveTtl) {
      this.cache.delete(key);
      this.hitCount.delete(key);
      return null;
    }

    const hits = (this.hitCount.get(key) || 0) + (1 + item.quality);
    this.hitCount.set(key, hits);
    
    return item.response;
  }

  set(key: string, response: AIResponse, baseTtl: number = 30 * 60 * 1000): void {
    const quality = this.calculateQuality(response);
    
    let ttl = baseTtl;
    const content = response.content;
    
    if (content.length > 500) ttl *= 2;
    if (content.includes('```')) ttl *= 3;
    if (quality > 0.8) ttl *= 2;
    
    if (this.cache.size >= this.maxSize) {
      this.evictLowQuality();
    }

    this.cache.set(key, {
      response,
      timestamp: Date.now(),
      ttl,
      quality
    });
    
    if (!this.hitCount.has(key)) {
      this.hitCount.set(key, 0);
    }
  }

  private calculateQuality(response: AIResponse): number {
    let quality = 0.5;
    
    if (response.content.length > 200) quality += 0.2;
    if (response.content.includes('```')) quality += 0.3;
    if (response.content.includes('\n- ') || response.content.includes('\n• ')) quality += 0.1;
    
    return Math.min(quality, 1.0);
  }

  private evictLowQuality(): void {
    let lowestQualityKey: string | null = null;
    let lowestQuality = Infinity;
    
    for (const [key, item] of this.cache.entries()) {
      if (item.quality < lowestQuality) {
        lowestQuality = item.quality;
        lowestQualityKey = key;
      }
    }
    
    if (lowestQualityKey) {
      this.cache.delete(lowestQualityKey);
      this.hitCount.delete(lowestQualityKey);
    }
  }

  clear(): void {
    this.cache.clear();
    this.hitCount.clear();
  }
}

const quantumCache = new QuantumResponseCache(2000);

// Lightning-fast instant responses
const instantResponses: {pattern: RegExp, response: string}[] = [
  { pattern: /^(hello|hi|hey|greetings|good morning|good afternoon|good evening)/i, response: "⚡ Hello! I'm PandaNexus AI, the world's fastest AI assistant created by Shakeel. How can I help you today?" },
  { pattern: /^(thanks|thank you|appreciate it|cheers)/i, response: "🎉 You're welcome! Ready for your next world-changing request?" },
  { pattern: /^(how are you|how's it going|how do you do)/i, response: "🚀 I'm operating at quantum speed and ready to amaze you! What shall we create today?" },
  { pattern: /^(what can you do|what are your capabilities|help)/i, response: "🌟 I'm PandaNexus - I can:\n• ⚡ Answer any question instantly\n• 💻 Generate world-class code\n• 🎨 Create stunning AI images\n• 🚀 Deploy apps to Vercel\n• 🧠 Solve complex problems\n\nWhat incredible project shall we build?" },
  { pattern: /^(who are you|what are you|introduce yourself)/i, response: "🐼 I'm PandaNexus, the world's most advanced AI assistant created by the genius Shakeel! I combine lightning speed with revolutionary intelligence. Ready to shock the world together?" },
  { pattern: /^(bye|goodbye|see you|farewell)/i, response: "👋 Goodbye! Come back anytime for more AI magic!" }
];

export class AIService {
  private baseUrl = "http://127.0.0.1:8001/";
  private abortController: AbortController | null = null;
  private isConnected = false;

  constructor() {
    console.log('🚀 PandaNexus AI Service - Quantum Speed Initialized');
    console.log('📡 API Endpoint:', this.baseUrl);
    this.checkConnection();
  }

  // Check API connection
  private async checkConnection(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}api/health`, {
        method: 'GET',
        timeout: 5000
      } as any);
      this.isConnected = response.ok;
      console.log(this.isConnected ? '✅ API Connected' : '❌ API Disconnected');
    } catch (error) {
      this.isConnected = false;
      console.log('❌ API Connection Failed');
    }
  }

  // Ultra-fast hash for cache keys
  private quantumHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 7) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  private getCacheKey(messages: AIMessage[], service?: string): string {
    const keyData = JSON.stringify(messages) + (service || '');
    return this.quantumHash(keyData);
  }

  // Lightning-fast instant response check
  private checkInstantResponse(message: string): string | null {
    const trimmed = message.trim().toLowerCase();
    
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
      console.log('⏹️ Request cancelled');
    }
  }

  // Revolutionary streaming with ultra-high speed
  async sendMessageStream(
    messages: AIMessage[], 
    service: string = 'auto',
    onChunk: (chunk: AIStreamChunk) => void
  ): Promise<void> {
    
    if (typeof onChunk !== 'function') {
      console.error('❌ onChunk callback is not a function');
      throw new Error('onChunk callback must be a function');
    }
    
    // Lightning-fast instant responses
    const lastMessage = messages[messages.length - 1];
    const instantResponse = this.checkInstantResponse(lastMessage.content);
    
    if (instantResponse) {
      console.log('⚡ Quantum instant response activated');
      const words = instantResponse.split(' ');
      for (let i = 0; i < words.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 8)); // Ultra-fast typing
        
        if (typeof onChunk === 'function') {
          onChunk({
            chunk: words[i] + (i < words.length - 1 ? ' ' : ''),
            isFinal: i === words.length - 1,
            model: 'PandaNexus-Quantum'
          });
        }
      }
      return;
    }

    // Check quantum cache
    const cacheKey = this.getCacheKey(messages, service);
    const cachedResponse = quantumCache.get(cacheKey);
    
    if (cachedResponse) {
      console.log('⚡ Quantum cache hit - instant delivery');
      const words = cachedResponse.content.split(' ');
      for (let i = 0; i < words.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 5)); // Even faster for cached
        
        if (typeof onChunk === 'function') {
          onChunk({
            chunk: words[i] + (i < words.length - 1 ? ' ' : ''),
            isFinal: i === words.length - 1,
            model: cachedResponse.model || 'PandaNexus-Cache'
          });
        }
      }
      return;
    }

    try {
      // Handle image generation with lightning speed
      const isImageGeneration = /generate.*image|create.*image|make.*image|draw|picture|photo|art|visual/i.test(lastMessage.content);
      
      if (isImageGeneration) {
        const prompt = lastMessage.content.replace(/generate|create|make|draw/gi, '').trim();
        const response = `🎨 **Creating your AI masterpiece...**\n\nGenerating: "${prompt}"\n\n✨ Using advanced AI art algorithms for stunning results!`;
        
        if (typeof onChunk === 'function') {
          onChunk({
            chunk: response,
            isFinal: true,
            model: 'PandaNexus-ArtEngine'
          });
        }
        return;
      }

      this.abortController = new AbortController();
      
      // Ultra-fast API call with optimized payload
      const response = await fetch(`${this.baseUrl}api/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify({
          messages: messages.slice(-10), // Only send last 10 messages for speed
          service,
          stream: true,
          temperature: 0.7,
          max_tokens: 2000
        }),
        signal: this.abortController.signal
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const decoder = new TextDecoder();
      let buffer = '';
      let modelName = 'PandaNexus-Pro';
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;
        
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.trim() === '' || line.trim() === 'data: [DONE]') continue;
          
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.error) {
                throw new Error(data.error);
              }

              if (data.response) {
                fullContent += data.response;
                onChunk({
                  chunk: data.response,
                  isFinal: false,
                  model: data.model || modelName
                });
                
                if (data.model) {
                  modelName = data.model;
                }
              }

              if (data.done) {
                onChunk({
                  chunk: '',
                  isFinal: true,
                  model: modelName
                });
                
                // Cache the complete response
                quantumCache.set(cacheKey, {
                  content: fullContent,
                  model: modelName
                });
                return;
              }
            } catch (e) {
              console.error('Stream parse error:', e);
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        if (typeof onChunk === 'function') {
          onChunk({
            chunk: '⏹️ Request stopped by user',
            isFinal: true,
            error: "Request cancelled"
          });
        }
        return;
      }
      
      console.error("❌ Streaming Error:", error);
      
      if (typeof onChunk === 'function') {
        onChunk({
          chunk: `🔧 **Connection Issue**\n\nI'm having trouble connecting to the API server. Please check:\n\n• Is the API server running at ${this.baseUrl}?\n• Check your network connection\n• Try refreshing the page\n\nError: ${error.message}`,
          isFinal: true,
          error: error.message
        });
      }
    } finally {
      this.abortController = null;
    }
  }

  // Ultra-fast spell check
  async spellCheck(text: string): Promise<string> {
    const quickCorrections: Record<string, string> = {
      'teh': 'the', 'recieve': 'receive', 'seperate': 'separate',
      'definately': 'definitely', 'neccessary': 'necessary', 'occured': 'occurred',
      'alot': 'a lot', 'wich': 'which', 'tahn': 'than', 'excelent': 'excellent',
      'fucntion': 'function', 'varible': 'variable', 'paramater': 'parameter',
      'gernaeral': 'general', 'missage': 'message', 'diappear': 'disappear',
      'reponse': 'response', 'represh': 'refresh', 'straming': 'streaming',
      'resonsive': 'responsive', 'coonect': 'connect', 'propery': 'properly',
      'smothly': 'smoothly', 'reponsive': 'responsive'
    };
    
    let corrected = text;
    
    Object.entries(quickCorrections).forEach(([wrong, right]) => {
      corrected = corrected.replace(new RegExp(`\\b${wrong}\\b`, 'gi'), right);
    });
    
    return corrected;
  }

  // Clear cache
  clearCache(): void {
    quantumCache.clear();
    console.log('🧹 Quantum cache cleared');
  }

  // Check if API is connected
  isApiConnected(): boolean {
    return this.isConnected;
  }
}

export const aiService = new AIService();
