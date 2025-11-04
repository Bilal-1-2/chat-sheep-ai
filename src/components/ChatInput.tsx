import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex gap-2 items-end">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Stel een vraag aan Chat Sheep..."
          disabled={disabled}
          className="min-h-[60px] max-h-[200px] resize-none bg-card border-border focus-visible:ring-accent"
          rows={1}
        />
        <Button
          type="submit"
          disabled={!input.trim() || disabled}
          size="icon"
          className="h-[60px] w-[60px] rounded-2xl bg-secondary hover:bg-secondary/90 text-secondary-foreground shrink-0"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </form>
  );
};
