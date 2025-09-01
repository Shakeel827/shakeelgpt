import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";

// ---------- AI Interfaces ----------
interface AIMessage {
  role: "user" | "assistant";
  content: string;
}

interface AIResponse {
  content: string;
  model: string;
}

// ---------- AI Service ----------
class AIService {
  private apiKey = "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"; // your API key
  private baseUrl = "https://openrouter.ai/api/v1";
  private model = "qwen/qwen-2.5-72b-instruct:free";

  async sendMessage(messages: AIMessage[]): Promise<AIResponse> {
    const lastMessage = messages[messages.length - 1];
    const aiPrompt = `Correct all spelling, grammar, and punctuation in this text. Respond only with the corrected text:\n\n${lastMessage.content}`;

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://pandanexus.dev",
          "X-Title": "PandaNexus",
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: "user", content: aiPrompt }],
          temperature: 0.1,
          max_tokens: 800,
          stream: false,
        }),
      });

      if (!response.ok) throw new Error(`API request failed: ${response.status}`);
      const data = await response.json();

      return {
        content: data.choices[0]?.message?.content || "Couldn't correct the text.",
        model: this.model,
      };
    } catch (error) {
      console.error("AI Service Error:", error);
      return {
        content: "Technical difficulties. Please try again later.",
        model: this.model,
      };
    }
  }
}

const aiService = new AIService();

// ---------- SpellChecker Component ----------
interface SpellCheckerProps {
  text: string;
  onCorrect: (correctedText: string) => void;
}

const SpellCheckerAI = ({ text, onCorrect }: SpellCheckerProps) => {
  const [isChecking, setIsChecking] = useState(false);

  const correctText = async () => {
    if (!text.trim()) return;

    setIsChecking(true);
    try {
      const aiResponse = await aiService.sendMessage([{ role: "user", content: text }]);
      onCorrect(aiResponse.content);
    } catch (error) {
      console.error("AI correction failed:", error);
      onCorrect(text);
    } finally {
      setIsChecking(false);
    }
  };

  if (!text.trim()) return null;

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={correctText}
      disabled={isChecking}
      className="text-xs h-8 px-2 text-muted-foreground hover:text-primary"
    >
      <Wand2 className="w-3 h-3 mr-1" />
      {isChecking ? "Checking..." : "Fix Text (AI)"}
    </Button>
  );
};

export default SpellCheckerAI;
