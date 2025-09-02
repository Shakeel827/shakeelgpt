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

// Quantum-level response cache for instant performance
class QuantumResponseCache {
  private cache: Map<string, { response: AIResponse; timestamp: number; ttl: number; quality: number }>;
  private hitCount: Map<string, number>;
  private maxSize: number;

  constructor(maxSize: number = 1000) {
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

  set(key: string, response: AIResponse, baseTtl: number = 15 * 60 * 1000): void {
    const quality = this.calculateQuality(response);
    
    let ttl = baseTtl;
    const content = response.content;
    
    if (content.length > 500) ttl *= 1.5;
    if (content.includes('```')) ttl *= 2;
    if (quality > 0.8) ttl *= 1.8;
    
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
    let quality = 0.5; // Base quality
    
    // Higher quality for longer, well-structured responses
    if (response.content.length > 200) quality += 0.2;
    if (response.content.includes('```')) quality += 0.2; // Code blocks
    if (response.content.includes('\n- ') || response.content.includes('\n• ')) quality += 0.1; // Lists
    
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
}

const quantumCache = new QuantumResponseCache(1000);

// Instant response patterns for common queries
const instantResponses: {pattern: RegExp, response: string}[] = [
  { pattern: /^(hello|hi|hey|greetings|good morning|good afternoon|good evening)/i, response: "Hello! I'm PandaNexus AI, created by Shakeel. How can I assist you today?" },
  { pattern: /^(thanks|thank you|appreciate it|cheers)/i, response: "You're welcome! Is there anything else I can help you with?" },
  { pattern: /^(how are you|how's it going|how do you do)/i, response: "I'm functioning well, thank you for asking! How can I help you today?" },
  { pattern: /^(what can you do|what are your capabilities|help)/i, response: "I can answer questions, help with research, generate ideas, and even create images. What would you like me to help you with?" },
  { pattern: /^(who are you|what are you|introduce yourself)/i, response: "I'm PandaNexus, an advanced AI assistant created by Shakeel. I'm here to help answer your questions and assist with various tasks." },
  { pattern: /^(bye|goodbye|see you|farewell)/i, response: "Goodbye! Feel free to return if you have more questions." }
];

// Common code patterns for instant code responses
const codePatterns: {pattern: RegExp, response: string}[] = [
  { pattern: /python.*(list|array)/i, response: "Here's how to work with lists in Python:\n\n```python\n# Creating a list\nmy_list = [1, 2, 3, 4, 5]\n\n# Accessing elements\nprint(my_list[0])  # First element\nprint(my_list[-1]) # Last element\n\n# Adding elements\nmy_list.append(6)\nmy_list.insert(0, 0)\n\n# Removing elements\nmy_list.pop()     # Remove last\nmy_list.remove(3) # Remove specific value\n```" },
  { pattern: /python.*loop/i, response: "Here are different ways to loop in Python:\n\n```python\n# For loop\nfor i in range(5):\n    print(i)\n\n# While loop\ncount = 0\nwhile count < 5:\n    print(count)\n    count += 1\n\n# Loop through list\nfruits = ['apple', 'banana', 'cherry']\nfor fruit in fruits:\n    print(fruit)\n\n# With index\nfor index, fruit in enumerate(fruits):\n    print(f\"{index}: {fruit}\")\n```" },
  { pattern: /python.*function/i, response: "Here's how to define functions in Python:\n\n```python\n# Basic function\ndef greet(name):\n    return f\"Hello, {name}!\"\n\n# Function with default parameter\ndef greet(name=\"User\"):\n    return f\"Hello, {name}!\"\n\n# Function with multiple parameters\ndef add_numbers(a, b):\n    return a + b\n\n# Lambda function (anonymous)\nmultiply = lambda x, y: x * y\n\n# Calling functions\nprint(greet(\"Alice\"))\nprint(add_numbers(5, 3))\nprint(multiply(4, 7))\n```" }
];

export class AIService {
  private baseUrl = "http://localhost:3001";
  private abortController: AbortController | null = null;

  constructor() {
    console.log('🚀 PandaNexus AI Service Initialized');
    console.log('📡 Using Local API Server:', this.baseUrl);
  }

  // Create a quantum hash for cache key
  private quantumHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 7) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36); // Convert to base36 for shorter keys
  }

  private getCacheKey(messages: AIMessage[]): string {
    const keyData = JSON.stringify(messages);
    return this.quantumHash(keyData);
  }

  // Check for instant responses
  private checkInstantResponse(message: string): string | null {
    const trimmed = message.trim().toLowerCase();
    
    // Check common greetings and questions
    for (const {pattern, response} of instantResponses) {
      if (pattern.test(trimmed)) {
        return response;
      }
    }
    
    // Check for code patterns
    for (const {pattern, response} of codePatterns) {
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
      console.log('⏹️ Request cancelled by user');
    }
  }

  // Quantum streaming for real-time responses
  async sendMessageStream(
    messages: AIMessage[], 
    onChunk: (chunk: AIStreamChunk) => void
  ): Promise<void> {
    
    // Check if onChunk is a valid function
    if (typeof onChunk !== 'function') {
      console.error('❌ onChunk callback is not a function');
      throw new Error('onChunk callback must be a function');
    }
    
    // Check for instant responses first
    const lastMessage = messages[messages.length - 1];
    const instantResponse = this.checkInstantResponse(lastMessage.content);
    
    if (instantResponse) {
      console.log('⚡ Using quantum instant response');
      // Simulate streaming for instant responses
      const words = instantResponse.split(' ');
      for (let i = 0; i < words.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 20)); // Faster typing effect
        
        // Check if onChunk is still a function before calling it
        if (typeof onChunk === 'function') {
          onChunk({
            chunk: words[i] + (i < words.length - 1 ? ' ' : ''),
            isFinal: i === words.length - 1,
            model: 'PandaNexus-Instant'
          });
        } else {
          console.warn('onChunk callback was removed during streaming');
          return;
        }
      }
      return;
    }

    // Check quantum cache
    const cacheKey = this.getCacheKey(messages);
    const cachedResponse = quantumCache.get(cacheKey);
    
    if (cachedResponse) {
      console.log('⚡ Using quantum cached response');
      // Simulate streaming for cached responses
      const words = cachedResponse.content.split(' ');
      for (let i = 0; i < words.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 15));
        
        // Check if onChunk is still a function before calling it
        if (typeof onChunk === 'function') {
          onChunk({
            chunk: words[i] + (i < words.length - 1 ? ' ' : ''),
            isFinal: i === words.length - 1,
            model: cachedResponse.model || 'phi3'
          });
        } else {
          console.warn('onChunk callback was removed during streaming');
          return;
        }
      }
      return;
    }

    try {
      const lastMessage = messages[messages.length - 1];
      const hasImage = !!lastMessage.image;
      const isImageGeneration = /generate.*image|create.*image|make.*image|draw|picture|photo/i.test(lastMessage.content);

      // Handle image generation
      if (isImageGeneration && !hasImage) {
        const prompt = lastMessage.content.replace(/generate|create|make|draw/gi, '').trim();
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512&seed=${Date.now()}`;
        const response = `I've generated an image for: "${prompt}". Here's your custom AI-generated image!`;
        
        // Check if onChunk is still a function before calling it
        if (typeof onChunk === 'function') {
          onChunk({
            chunk: response,
            isFinal: true,
            model: 'Pollinations-AI'
          });
        } else {
          console.warn('onChunk callback was removed during image generation');
        }
        return;
      }

      this.abortController = new AbortController();
      
      // Call local API with streaming
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
        throw new Error(`API request failed: ${response.status} - ${await response.text()}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const decoder = new TextDecoder();
      let fullResponse = '';
      let modelName = 'phi3';

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
                
                // Check if onChunk is still a function before calling it
                if (typeof onChunk === 'function') {
                  onChunk({
                    chunk: data.response,
                    isFinal: false,
                    model: data.model
                  });
                } else {
                  console.warn('onChunk callback was removed during streaming');
                  reader.cancel();
                  return;
                }
              }

              if (data.model) {
                modelName = data.model;
              }

              if (data.done && fullResponse) {
                // Cache the successful response
                quantumCache.set(cacheKey, {
                  content: fullResponse,
                  model: modelName
                });
                
                // Check if onChunk is still a function before calling it
                if (typeof onChunk === 'function') {
                  onChunk({
                    chunk: '',
                    isFinal: true,
                    model: modelName
                  });
                }
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
        // Check if onChunk is still a function before calling it
        if (typeof onChunk === 'function') {
          onChunk({
            chunk: '',
            isFinal: true,
            error: "Request cancelled by user"
          });
        }
        return;
      }
      
      console.error("❌ AIService Error:", error);
      
      // Check if onChunk is still a function before calling it
      if (typeof onChunk === 'function') {
        onChunk({
          chunk: `Error: ${error.message}`,
          isFinal: true,
          error: error.message
        });
      }
    } finally {
      this.abortController = null;
    }
  }

  // Standard method for non-streaming responses
  async sendMessage(messages: AIMessage[]): Promise<AIResponse> {
    // Check for instant responses first
    const lastMessage = messages[messages.length - 1];
    const instantResponse = this.checkInstantResponse(lastMessage.content);
    
    if (instantResponse) {
      console.log('⚡ Using quantum instant response');
      return {
        content: instantResponse,
        model: 'PandaNexus-Instant'
      };
    }

    // Check quantum cache
    const cacheKey = this.getCacheKey(messages);
    const cachedResponse = quantumCache.get(cacheKey);
    
    if (cachedResponse) {
      console.log('⚡ Using quantum cached response');
      return cachedResponse;
    }

    try {
      const lastMessage = messages[messages.length - 1];
      const hasImage = !!lastMessage.image;
      const isImageGeneration = /generate.*image|create.*image|make.*image|draw|picture|photo/i.test(lastMessage.content);

      // Handle image generation
      if (isImageGeneration && !hasImage) {
        const prompt = lastMessage.content.replace(/generate|create|make|draw/gi, '').trim();
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512&seed=${Date.now()}`;
        const response = {
          content: `I've generated an image for: "${prompt}". Here's your custom AI-generated image!`,
          model: 'Pollinations-AI',
          imageUrl
        };
        quantumCache.set(cacheKey, response, 2 * 60 * 1000);
        return response;
      }

      this.abortController = new AbortController();
      const timeoutId = setTimeout(() => {
        if (this.abortController) {
          this.abortController.abort();
        }
      }, 30000); // 30 second timeout

      const startTime = Date.now();
      
      // Call local API
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

      quantumCache.set(cacheKey, aiResponse);
      
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

  // Advanced spell check with context awareness
  async spellCheck(text: string, context: string = ''): Promise<string> {
    const quickCorrections: Record<string, string> = {
      'teh': 'the', 
      'recieve': 'receive', 
      'seperate': 'separate',
      'definately': 'definitely',
      'neccessary': 'necessary',
      'occured': 'occurred',
      'alot': 'a lot',
      'wich': 'which',
      'tahn': 'than',
      'excelent': 'excellent'
    };
    
    let corrected = text;
    
    // Apply quick corrections
    Object.entries(quickCorrections).forEach(([wrong, right]) => {
      corrected = corrected.replace(new RegExp(`\\b${wrong}\\b`, 'gi'), right);
    });
    
    // Context-aware corrections for programming
    if (context.includes('python') || context.includes('code')) {
      corrected = corrected
        .replace(/fucntion/gi, 'function')
        .replace(/defination/gi, 'definition')
        .replace(/varible/gi, 'variable')
        .replace(/paramater/gi, 'parameter');
    }
    
    return corrected;
  }

  // Get model information from local API
  async getModelInfo(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/models`);
      if (!response.ok) {
        throw new Error(`Failed to fetch model info: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching model info:', error);
      return { models: [] };
    }
  }

  // Check API health
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`);
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
}

export const aiService = new AIService();
