import { useCallback, useEffect, useState } from "react";

import { serverUrl } from "../config";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface OutputPayload {
  transcription: string;
  response: string;
}

export function useOutputStream(webrtcId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  useEffect(() => {
    if (!webrtcId) return;

    const base = serverUrl("/api/updates");
    const url = base.startsWith("http")
      ? new URL(base)
      : new URL("/api/updates", window.location.origin);
    url.searchParams.set("webrtc_id", webrtcId);
    const eventSource = new EventSource(url.toString());

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as OutputPayload;
        setMessages((prev) => {
          const next = [...prev];
          if (payload.transcription) {
            next.push({ role: "user", content: payload.transcription });
          }
          if (payload.response) {
            next.push({ role: "assistant", content: payload.response });
          }
          return next;
        });
      } catch {
        // ignore parse errors
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.close();
      setMessages([]);
    };
  }, [webrtcId]);

  const displayedMessages = webrtcId ? messages : [];
  return { messages: displayedMessages, clearMessages };
}
