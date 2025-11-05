import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { TypingIndicator } from "@/components/TypingIndicator";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { analyzeSentiment, SentimentResult } from "@/lib/sentimentAnalysis";

type Message = {
  role: "user" | "assistant";
  content: string;
  sentiment?: SentimentResult;
};

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hoi! 🐑 Ik ben Chat Sheep, jouw vriendelijke AI assistent. Waar kan ik je mee helpen?",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const streamChat = async (userMessages: Message[]) => {
    // For local development, use a mock response instead of calling Supabase
    if (import.meta.env.DEV) {
      // Simulate streaming response for local development
      const mockResponse = "Hoi! Dit is een test reactie van Chat Sheep. De sentiment analyse werkt! 😊";
      let currentIndex = 0;

      const streamInterval = setInterval(() => {
        if (currentIndex < mockResponse.length) {
          const chunk = mockResponse.slice(currentIndex, currentIndex + 1);
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last?.role === "assistant") {
              return prev.map((m, i) =>
                i === prev.length - 1 ? { ...m, content: last.content + chunk } : m
              );
            }
            return [...prev, { role: "assistant", content: chunk }];
          });
          currentIndex++;
        } else {
          clearInterval(streamInterval);
        }
      }, 50);

      return;
    }

    const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

    const response = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages: userMessages }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error("Te veel verzoeken. Probeer het later opnieuw.");
      }
      if (response.status === 402) {
        throw new Error("Credits op. Voeg credits toe aan je workspace.");
      }
      throw new Error("Er ging iets mis met de AI.");
    }

    if (!response.body) throw new Error("Geen response body");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let streamDone = false;
    let assistantContent = "";

    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;
      
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") {
          streamDone = true;
          break;
        }

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            assistantContent += content;
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              if (last?.role === "assistant" && last !== userMessages[userMessages.length - 1]) {
                return prev.map((m, i) =>
                  i === prev.length - 1 ? { ...m, content: assistantContent } : m
                );
              }
              return [...prev, { role: "assistant", content: assistantContent }];
            });
          }
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }
  };

  const handleSend = async (input: string) => {
    // Analyze sentiment of user input
    let sentiment: SentimentResult | undefined;
    try {
      sentiment = await analyzeSentiment(input);
    } catch (error) {
      console.error("Sentiment analysis error:", error);
      // Continue without sentiment if analysis fails
    }

    const userMessage: Message = { role: "user", content: input, sentiment };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      await streamChat(newMessages);
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Fout",
        description: error instanceof Error ? error.message : "Er ging iets mis.",
        variant: "destructive",
      });
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        role: "assistant",
        content: "Hoi! 🐑 Ik ben Chat Sheep, jouw vriendelijke AI assistent. Waar kan ik je mee helpen?",
      },
    ]);
    toast({
      title: "Chat gewist",
      description: "De chat is leeggemaakt.",
    });
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-4xl">🐑</div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Chat Sheep</h1>
              <p className="text-sm text-muted-foreground">Jouw vriendelijke AI assistent</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleClear}
            className="hover:bg-destructive hover:text-destructive-foreground"
            title="Chat wissen"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
          {messages.map((message, index) => (
            <ChatMessage key={index} role={message.role} content={message.content} sentiment={message.sentiment} />
          ))}
          {isLoading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input */}
      <footer className="border-t border-border bg-card shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <ChatInput onSend={handleSend} disabled={isLoading} />
        </div>
      </footer>
    </div>
  );
};

export default Index;
