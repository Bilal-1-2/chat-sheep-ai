export const TypingIndicator = () => {
  return (
    <div className="flex justify-start animate-fade-in">
      <div className="bg-chat-ai text-chat-ai-foreground border border-border rounded-2xl px-4 py-3 shadow-sm">
        <div className="flex gap-1.5">
          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]" />
          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]" />
          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
        </div>
      </div>
    </div>
  );
};
