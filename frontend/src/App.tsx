import { useState } from "react";
import { PromptInputBox } from "@/components/ui/ai-prompt-box";
import axios from "axios";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const examples = [
  "Punishment for theft in Pakistan",
  "Landlord won't return my deposit",
  "Rights if wrongfully terminated",
  "How to file an FIR in Pakistan",
];

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
    <div className="flex flex-col h-screen bg-[#0f0f1a] text-gray-100 font-sans">
      {/* header */}
      <div className="px-6 py-4 border-b border-[#2a2a3e] bg-[#13131f]">
        <h1 className="text-xl font-semibold text-white">⚖️ Court Navigator</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          AI-powered legal assistant for Pakistani law
        </p>
        <div className="mt-2 text-xs text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 rounded-lg px-3 py-2">
          ⚠️ For informational purposes only. Always consult a qualified lawyer
          before taking legal action.
        </div>
      </div>

      {/* chat area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center flex-1 gap-4">
            <p className="text-gray-500 text-sm">Ask about your legal rights</p>
            <div className="flex flex-wrap gap-2 justify-center max-w-lg">
              {examples.map((ex) => (
                <button
                  key={ex}
                  onClick={() => handleSend(ex)}
                  className="text-xs px-4 py-2 rounded-full border border-[#2a2a3e] bg-[#1e1e2e] text-gray-400 hover:text-gray-200 hover:border-[#3a3a5e] transition-all"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
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
                  ? "bg-[#1a6b3c] text-white"
                  : "bg-[#1e1e2e] text-gray-200"
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
            <div className="mt-1 bg-[#1e1e2e] rounded-2xl px-4 py-3 text-sm text-gray-400">
              Searching legal database...
            </div>
          </div>
        )}
      </div>

      {/* input */}
      <div className="px-6 py-4 bg-[#13131f] border-t border-[#2a2a3e]">
        <PromptInputBox
          onSend={handleSend}
          isLoading={isLoading}
          placeholder="Ask about your legal rights..."
        />
      </div>
    </div>
  );
}
