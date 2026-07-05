"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import MobileShell from "@/components/MobileShell";
import {
  Bot,
  FileText,
  Image as ImageIcon,
  Loader2,
  Paperclip,
  Send,
  User,
  X,
} from "lucide-react";

const MODES = ["Explain", "Summarize", "Quiz me"];

type ChatMessage = {
  id: number;
  role: "user" | "assistant";
  text: string;
  fileName?: string;
};

export default function TutorPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const [mode, setMode] = useState("Explain");
  const [question, setQuestion] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: "assistant",
      text: "สวัสดีครับ เหม่ยเหมย 👋 เลือกโหมดแล้วถาม AI Tutor ได้เลย จะให้อธิบาย สรุป หรือสร้าง Quiz ก็ได้ครับ",
    },
  ]);

  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      setErrorMessage("Only PDF, JPG, PNG, or WEBP files are allowed.");
      return;
    }

    const maxSize = 10 * 1024 * 1024;

    if (selectedFile.size > maxSize) {
      setErrorMessage("File is too large. Please upload a file under 10MB.");
      return;
    }

    setErrorMessage("");
    setFile(selectedFile);
  };

  const removeFile = () => {
    setFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const buildHistoryText = () => {
    return messages
      .slice(-8)
      .map((message) => {
        const speaker = message.role === "user" ? "Student" : "AI Tutor";
        return `${speaker}: ${message.text}`;
      })
      .join("\n");
  };

  const handleSendMessage = async () => {
    setErrorMessage("");

    if (!question.trim() && !file) {
      setErrorMessage("Please type a message or upload a file.");
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now(),
      role: "user",
      text:
        question.trim() ||
        `Uploaded file: ${file?.name || "file"} (${mode} mode)`,
      fileName: file?.name,
    };

    setMessages((prev) => [...prev, userMessage]);
    setQuestion("");
    setLoading(true);

    const formData = new FormData();
    formData.append("mode", mode);
    formData.append("question", userMessage.text);
    formData.append("history", buildHistoryText());

    if (file) {
      formData.append("file", file);
    }

    const currentFileInput = fileInputRef.current;

    setFile(null);
    if (currentFileInput) {
      currentFileInput.value = "";
    }

    try {
      const response = await fetch("/api/tutor", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.error || "Something went wrong.");
        setLoading(false);
        return;
      }

      const assistantMessage: ChatMessage = {
        id: Date.now() + 1,
        role: "assistant",
        text: result.answer,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setErrorMessage("AI Tutor failed to generate a response.");
    }

    setLoading(false);
  };

  const getPlaceholder = () => {
    if (mode === "Explain") {
      return "ถามอะไรกับ AI Tutor ได้เลย...";
    }

    if (mode === "Summarize") {
      return "พิมพ์เนื้อหาหรือแนบ PDF ให้สรุป...";
    }

    return "พิมพ์หัวข้อที่อยากให้สร้าง quiz...";
  };

  return (
    <MobileShell>
      <section className="mb-4 rounded-[28px] bg-gradient-to-br from-[#cf2f2f] to-[#b71c1c] p-5 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-red-700">
            <Bot size={30} />
          </div>

          <div>
            <h2 className="text-lg font-extrabold">AC Learning Tutor</h2>
            <p className="text-xs text-red-100">
              Chat with your ABAC BBA assistant
            </p>
          </div>
        </div>
      </section>

      <section className="mb-3 rounded-3xl bg-white p-3 shadow">
        <div className="grid grid-cols-3 gap-2">
          {MODES.map((item) => (
            <button
              key={item}
              onClick={() => {
                setMode(item);
                setErrorMessage("");
              }}
              className={`rounded-2xl border px-2 py-2 text-xs font-bold ${
                mode === item
                  ? "border-red-700 bg-red-700 text-white"
                  : "border-red-100 bg-red-50 text-red-700"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      <section className="flex h-[520px] flex-col rounded-3xl bg-white shadow">
        <div className="border-b border-red-100 px-4 py-3">
          <p className="text-sm font-bold text-red-700">Chat</p>
          <p className="text-xs text-gray-500">Current mode: {mode}</p>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto bg-red-50/50 p-4">
          {messages.map((message) => {
            const isUser = message.role === "user";

            return (
              <div
                key={message.id}
                className={`flex items-end gap-2 ${
                  isUser ? "justify-end" : "justify-start"
                }`}
              >
                {!isUser && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-700 text-white">
                    <Bot size={17} />
                  </div>
                )}

                <div
                  className={`max-w-[78%] rounded-3xl px-4 py-3 text-sm leading-6 shadow-sm ${
                    isUser
                      ? "rounded-br-md bg-red-700 text-white"
                      : "rounded-bl-md bg-white text-gray-800"
                  }`}
                >
                  {message.fileName && (
                    <div
                      className={`mb-2 flex items-center gap-2 rounded-2xl px-3 py-2 text-xs ${
                        isUser ? "bg-white/15" : "bg-red-50 text-red-700"
                      }`}
                    >
                      <FileText size={14} />
                      <span className="truncate">{message.fileName}</span>
                    </div>
                  )}

                  <p className="whitespace-pre-wrap">{message.text}</p>
                </div>

                {isUser && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-600">
                    <User size={17} />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex items-end gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-700 text-white">
                <Bot size={17} />
              </div>

              <div className="rounded-3xl rounded-bl-md bg-white px-4 py-3 text-sm text-gray-500 shadow-sm">
                <div className="flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-red-700" />
                  AI Tutor is typing...
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {errorMessage && (
          <div className="border-t border-red-100 bg-white px-4 py-2 text-xs text-red-700">
            {errorMessage}
          </div>
        )}

        {file && (
          <div className="border-t border-red-100 bg-white px-4 py-2">
            <div className="flex items-center justify-between rounded-2xl bg-red-50 px-3 py-2">
              <div className="flex min-w-0 items-center gap-2 text-sm text-red-700">
                {file.type === "application/pdf" ? (
                  <FileText size={18} />
                ) : (
                  <ImageIcon size={18} />
                )}
                <span className="truncate">{file.name}</span>
              </div>

              <button
                type="button"
                onClick={removeFile}
                className="rounded-full bg-white p-1 text-red-700"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        <div className="border-t border-red-100 bg-white p-3">
          <div className="flex items-end gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,image/png,image/jpeg,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-700"
            >
              <Paperclip size={20} />
            </button>

            <textarea
              className="max-h-[100px] min-h-[44px] flex-1 resize-none rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-red-500"
              placeholder={getPlaceholder()}
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  handleSendMessage();
                }
              }}
            />

            <button
              type="button"
              onClick={handleSendMessage}
              disabled={loading}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-700 text-white disabled:bg-gray-300"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Send size={20} />
              )}
            </button>
          </div>
        </div>
      </section>
    </MobileShell>
  );
}