import type { ChatMessage } from "../hooks/useOutputStream";

interface ChatUIProps {
  messages: ChatMessage[];
}

export function ChatUI({ messages }: ChatUIProps) {
  if (messages.length === 0) {
    return (
      <div className="min-h-64 rounded-xl border border-blue-200/60 bg-blue-50/50 px-4 py-12 text-center text-sm text-slate-600">
        会話が始まるとここに表示されます
      </div>
    );
  }

  return (
    <div className="flex min-h-64 max-h-96 flex-col gap-3 overflow-y-auto rounded-xl border border-blue-200/60 bg-blue-50/50 p-3">
      {messages.map((msg, i) => (
        <div
          key={i}
          className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-[85%] rounded-xl px-3 py-2 text-sm shadow-sm ${
              msg.role === "user"
                ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white"
                : "bg-slate-100 text-slate-800 border border-slate-200/80"
            }`}
          >
            <span className="text-xs font-medium opacity-80">
              {msg.role === "user" ? "あなた" : "AI"}
            </span>
            <p className="mt-0.5 whitespace-pre-wrap break-words">{msg.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
