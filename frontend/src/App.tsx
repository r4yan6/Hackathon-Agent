import { useState } from "react";
import { VercelV0Chat } from "@/components/ui/v0-ai-chat";
import axios from "axios";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (message: string) => {
    if (!message.trim() || isLoading) return;

    setMessages((prev) => [...prev, { role: "user", content: message }]);
    setIsLoading(true);

    try {
      const res = await axios.post("http://localhost:8000/ask", {
        question: message,
      });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.data.answer },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white text-gray-900 font-sans">
      {/* header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white shadow-sm z-10">
        <h1 className="text-xl font-semibold text-gray-900">⚖️ Court Navigator</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          AI-powered legal assistant for Pakistani law
        </p>
        <div className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          ⚠️ For informational purposes only. Always consult a qualified lawyer
          before taking legal action.
        </div>
      </div>

      {/* chat area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 w-full h-full">
            <VercelV0Chat onSend={handleSend} isLoading={isLoading} />
          </div>
        ) : (
          <>        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex flex-col gap-1 max-w-[80%] ${
              msg.role === "user"
                ? "self-end items-end"
                : "self-start items-start"
            }`}
          >
            {msg.role === "assistant" && (
              <span className="text-xs text-gray-500 px-1">
                ⚖️ Court Navigator
              </span>
            )}
            <div
              className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

            {isLoading && (
              <div className="self-start max-w-[80%]">
                <span className="text-xs text-gray-500 px-1">
                  ⚖️ Court Navigator
                </span>
                <div className="mt-1 bg-gray-100 rounded-2xl px-4 py-3 text-sm text-gray-500">
                  Searching legal database...
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* input */}
      {messages.length > 0 && (
        <div className="px-6 py-4 bg-white border-t border-gray-200">
          <VercelV0Chat onSend={handleSend} isLoading={isLoading} compact={true} />
        </div>
      )}
    </div>
  );
}
