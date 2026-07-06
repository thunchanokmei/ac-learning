"use client";

import { useEffect, useRef, useState } from "react";
import MobileShell from "@/components/MobileShell";
import {
  Bot,
  FileText,
  Image as ImageIcon,
  Loader2,
  Paperclip,
  Send,
  Sparkles,
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
  const messageInputRef = useRef<HTMLTextAreaElement | null>(null);

  const [mode, setMode] = useState("Explain");
  const [question, setQuestion] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: "assistant",
      text: "สวัสดีครับ 👋 เลือกโหมดที่ต้องการ แล้วพิมพ์คำถามหรือแนบไฟล์ได้เลยครับ",
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
      setErrorMessage("รองรับเฉพาะไฟล์ PDF, JPG, PNG หรือ WEBP เท่านั้น");
      return;
    }

    const maxSize = 10 * 1024 * 1024;

    if (selectedFile.size > maxSize) {
      setErrorMessage("ไฟล์ใหญ่เกินไป กรุณาอัปโหลดไฟล์ไม่เกิน 10MB");
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
  const handleQuestionChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setQuestion(event.target.value);

    const textarea = event.currentTarget;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  const handleSendMessage = async () => {
    setErrorMessage("");

    if (!question.trim() && !file) {
      setErrorMessage("กรุณาพิมพ์คำถามหรือแนบไฟล์ก่อนส่ง");
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now(),
      role: "user",
      text:
        question.trim() ||
        `แนบไฟล์: ${file?.name || "file"} (${mode} mode)`,
      fileName: file?.name,
    };

    setMessages((prev) => [...prev, userMessage]);
    setQuestion("");
    requestAnimationFrame(() => {
      if (messageInputRef.current) {
        messageInputRef.current.style.height = "48px";
      }
    });
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
        setErrorMessage(result.error || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
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
      setErrorMessage("AI Tutor ไม่สามารถตอบได้ในตอนนี้ กรุณาลองใหม่อีกครั้ง");
    }

    setLoading(false);
  };

  const getPlaceholder = () => {
    if (mode === "Explain") {
      return "พิมพ์เรื่องที่อยากให้อธิบาย...";
    }

    if (mode === "Summarize") {
      return "พิมพ์เนื้อหาที่ต้องการสรุป...";
    }

    return "พิมพ์หัวข้อที่อยากฝึกทำควิซ...";
  };

  const getModeDescription = () => {
    if (mode === "Explain") {
      return "อธิบายเนื้อหาให้เข้าใจง่าย พร้อมตัวอย่าง";
    }

    if (mode === "Summarize") {
      return "สรุปใจความสำคัญจากข้อความหรือไฟล์";
    }

    return "สร้างคำถามแบบฝึกหัดเพื่อทบทวน";
  };

  return (
    <MobileShell>
      <section className="mb-5">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-700 ring-4 ring-white shadow-sm">
            <Bot size={34} />
          </div>

          <div>
            <p className="text-sm font-semibold text-red-600">
              AC Learning Tutor
            </p>
            <h1 className="text-3xl font-bold text-slate-900">AI Tutor</h1>
          </div>
        </div>
      </section>

      <section className="mb-4 rounded-[30px] bg-white p-3 shadow-sm">
        <div className="grid grid-cols-3 gap-2">
          {MODES.map((item) => {
            const active = mode === item;

            return (
              <button
                key={item}
                onClick={() => {
                  setMode(item);
                  setErrorMessage("");
                }}
                className={`rounded-2xl border px-2 py-3 text-sm font-bold transition ${active
                  ? "border-red-700 bg-red-700 text-white shadow-sm shadow-red-100"
                  : "border-red-100 bg-red-50 text-red-700"
                  }`}
              >
                {item}
              </button>
            );
          })}
        </div>
      </section>

      <section className="flex h-[600px] flex-col overflow-hidden rounded-[32px] bg-white shadow-sm">
        <div className="border-b border-red-100 px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Chat</h2>
              <p className="text-sm text-slate-500">{getModeDescription()}</p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-700">
              <Sparkles size={20} />
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto bg-[#fff7f7] p-4">
          {messages.map((message) => {
            const isUser = message.role === "user";

            return (
              <div
                key={message.id}
                className={`flex items-end gap-2 ${isUser ? "justify-end" : "justify-start"
                  }`}
              >
                {!isUser && (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-700 text-white shadow-sm">
                    <Bot size={18} />
                  </div>
                )}

                <div
                  className={`max-w-[78%] rounded-[24px] px-4 py-3 text-sm leading-6 shadow-sm ${isUser
                    ? "rounded-br-md bg-red-700 text-white"
                    : "rounded-bl-md border border-red-100 bg-white text-slate-800"
                    }`}
                >
                  {message.fileName && (
                    <div
                      className={`mb-2 flex items-center gap-2 rounded-2xl px-3 py-2 text-xs ${isUser ? "bg-white/15" : "bg-red-50 text-red-700"
                        }`}
                    >
                      <FileText size={14} />
                      <span className="truncate">{message.fileName}</span>
                    </div>
                  )}

                  <p className="whitespace-pre-wrap">{message.text}</p>
                </div>

                {isUser && (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 shadow-sm">
                    <User size={18} />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex items-end gap-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-700 text-white shadow-sm">
                <Bot size={18} />
              </div>

              <div className="rounded-[24px] rounded-bl-md border border-red-100 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
                <div className="flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-red-700" />
                  กำลังตอบ...
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
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-700"
            >
              <Paperclip size={22} />
            </button>

            <textarea
              ref={messageInputRef}
              rows={1}
              className="min-h-[10px] flex-1 resize-none overflow-hidden rounded-[22px] border border-slate-200 bg-white px-4 py-3 text-base leading-6 outline-none shadow-sm focus:border-red-400"
              placeholder={getPlaceholder()}
              value={question}
              onChange={handleQuestionChange}
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
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-700 text-white shadow-lg shadow-red-100 disabled:bg-slate-300 disabled:shadow-none"
            >
              {loading ? (
                <Loader2 size={21} className="animate-spin" />
              ) : (
                <Send size={21} />
              )}
            </button>
          </div>
        </div>
      </section>
    </MobileShell>
  );
}