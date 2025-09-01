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

export class AIService {
  private apiKey: string;
  private baseUrl = "https://openrouter.ai/api/v1";

  constructor() {
    // Try to get API key from environment variables
    this.apiKey = import.meta.env.VITE_API_KEY || '';
    
    // If not found in environment, try to load from key.env
    if (!this.apiKey && typeof window !== 'undefined') {
      // @ts-ignore - Access window._env_ if it exists
      this.apiKey = window._env_?.VITE_API_KEY || '';
    }
    
    if (!this.apiKey) {
      console.error('❌ OpenRouter API key not found. Please set VITE_API_KEY in your environment variables or key.env file.');
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

  // Local spell checker fallback
  private enhancedSpellCheck(text: string): string {
    if (!text) return "";
    const corrections: Record<string, string> = {
      'teh': 'the', 'recieve': 'receive', 'seperate': 'separate',
      'definately': 'definitely', 'occured': 'occurred', 'neccessary': 'necessary',
      'accomodate': 'accommodate', 'begining': 'beginning', 'beleive': 'believe',
      'calender': 'calendar', 'cemetary': 'cemetery', 'changable': 'changeable',
      'collegue': 'colleague', 'comming': 'coming', 'commited': 'committed',
      'concious': 'conscious', 'definite': 'definite', 'embarass': 'embarrass',
      'enviroment': 'environment', 'existance': 'existence', 'experiance': 'experience',
      'familar': 'familiar', 'finaly': 'finally', 'foriegn': 'foreign',
      'goverment': 'government', 'grammer': 'grammar', 'independant': 'independent',
      'intergrate': 'integrate', 'knowlege': 'knowledge', 'maintainance': 'maintenance',
      'occassion': 'occasion', 'persue': 'pursue', 'priviledge': 'privilege',
      'recomend': 'recommend', 'refered': 'referred', 'relevent': 'relevant',
      'responsable': 'responsible', 'succesful': 'successful', 'tommorow': 'tomorrow',
      'truely': 'truly', 'untill': 'until', 'usefull': 'useful', 'wierd': 'weird',
      'writting': 'writing'
    };
    let corrected = text;
    Object.entries(corrections).forEach(([wrong, right]) => {
      const regex = new RegExp(`\\b${wrong}\\b`, 'gi');
      corrected = corrected.replace(regex, right);
    });
    corrected = corrected.replace(/\bi\b/g, 'I');
    corrected = corrected.replace(/(^|[.!?]\s+)([a-z])/g, (m, p1, p2) => p1 + p2.toUpperCase());
    if (corrected && !/[.!?]$/.test(corrected.trim())) corrected += ".";
    return corrected;
  }

  private getModel(serviceType: string, hasImage: boolean): string {
    if (hasImage) return this.models.image;
    return this.models[serviceType as keyof typeof this.models] || this.models.auto;
  }

  // Send message to OpenRouter AI
  async sendMessage(messages: AIMessage[], serviceType: string = 'auto'): Promise<AIResponse> {
    try {
      // Check if API key is available
      if (!this.apiKey) {
        console.error('❌ Cannot send message: No API key available');
        throw new Error('API key not configured');
      }

      const lastMessage = messages[messages.length - 1];
      const hasImage = !!lastMessage.image;
      const isImageGeneration = /generate.*image|create.*image|make.*image|draw|picture|photo/i.test(lastMessage.content);
      const selectedModel = this.getModel(serviceType, hasImage);
      
      console.log('📡 Sending message to AI service:', {
        serviceType,
        model: selectedModel,
        hasImage,
        isImageGeneration,
        messageCount: messages.length
      });

      // Image generation fallback
      if (isImageGeneration && !hasImage) {
        const prompt = lastMessage.content.replace(/generate|create|make|draw/gi, '').trim();
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=768&height=768&seed=${Date.now()}&enhance=true`;
        return {
          content: `I've generated an image for: "${prompt}". Here's your custom AI-generated image!`,
          model: 'Pollinations AI',
          imageUrl
        };
      }

      const apiMessages = [
        { role: 'system', content: "You are PandaNexus, an advanced AI assistant created by Shakeel. Provide accurate and helpful responses." },
        ...messages.slice(-5).map(msg => ({
          role: msg.role,
          content: msg.image ? [
            { type: "text", text: this.enhancedSpellCheck(msg.content) },
            { type: "image_url", image_url: { url: msg.image } }
          ] : this.enhancedSpellCheck(msg.content)
        }))
      ];

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
          temperature: serviceType === 'creative' ? 0.8 : serviceType === 'code' ? 0.3 : 0.7,
          max_tokens: 2000,
          top_p: 0.9,
          frequency_penalty: 0.1,
          presence_penalty: 0.1
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ API request failed with status ${response.status}:`, errorText);
        throw new Error(`API request failed: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('✅ Received AI response:', {
        model: data.model,
        usage: data.usage,
        contentLength: data.choices?.[0]?.message?.content?.length || 0
      });

      return {
        content: data.choices?.[0]?.message?.content || lastMessage.content,
        model: data.model || selectedModel,
        imageUrl: lastMessage.image
      };
    } catch (error) {
      console.error("❌ AIService Error:", error);
      return {
        content: "I'm having trouble connecting to the AI service. Please check your internet connection and try again. If the problem persists, the service might be temporarily unavailable.",
        model: 'Error',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  // Spell check using OpenRouter AI as backup
  async spellCheck(text: string): Promise<string> {
    try {
      const localCorrection = this.enhancedSpellCheck(text);
      if (localCorrection !== text) return localCorrection;

      // API spell check
      const apiResponse = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://pandanexus.dev',
          'X-Title': 'PandaNexus Spell Checker'
        },
        body: JSON.stringify({
          model: this.models.general,
          messages: [
            { role: 'system', content: 'Correct spelling, grammar, and punctuation. Return ONLY the corrected text.' },
            { role: 'user', content: text }
          ],
          temperature: 0.1,
          max_tokens: 500
        })
      });

      if (!apiResponse.ok) throw new Error(`Spell check API failed: ${apiResponse.status}`);
      const data = await apiResponse.json();
      return data.choices?.[0]?.message?.content || localCorrection;

    } catch (error) {
      console.error("Spell check error:", error);
      return this.enhancedSpellCheck(text);
    }
  }
}

export const aiService = new AIService();
