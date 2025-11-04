import { cn } from "@/lib/utils";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

export const ChatMessage = ({ role, content }: ChatMessageProps) => {
  return (
    <div
      className={cn(
        "flex w-full animate-fade-in",
        role === "user" ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3 shadow-sm",
          role === "user"
            ? "bg-chat-user text-chat-user-foreground"
            : "bg-chat-ai text-chat-ai-foreground border border-border"
        )}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
};
