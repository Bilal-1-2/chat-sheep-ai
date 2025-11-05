import { cn } from "@/lib/utils";
import { SentimentResult, getSentimentEmoji, getSentimentColor } from "@/lib/sentimentAnalysis";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  sentiment?: SentimentResult;
}

export const ChatMessage = ({ role, content, sentiment }: ChatMessageProps) => {
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
        {sentiment && role === "user" && (
          <div className="flex items-center gap-2 mt-2 text-xs">
            <span className={cn("font-medium", getSentimentColor(sentiment.sentiment))}>
              {getSentimentEmoji(sentiment.sentiment)} {sentiment.sentiment}
            </span>
            <span className="text-muted-foreground">
              Score: {(sentiment.score * 100).toFixed(1)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
