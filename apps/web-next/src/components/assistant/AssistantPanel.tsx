"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { assistantCore, type AssistantMessage } from "@schwalbe/ai-assistant";
import { track } from "@/lib/analytics";

export default function AssistantPanel({ locale }: { locale: string }) {
  const t = useTranslations("assistant");
  const [history, setHistory] = useState<AssistantMessage[]>([]);
  const [input, setInput] = useState("");

  const send = () => {
    const userMsg: AssistantMessage = { role: "user", content: input };
    track({ event: "assistant_send_message", locale, meta: { len: input.trim().length } });
    const reply = assistantCore({ history, input });
    track({ event: "assistant_response_shown", locale, meta: { len: reply.content.length } });
    setHistory((h) => [...h, userMsg, reply]);
    setInput("");
  };

  return (
    <div className="min-h-screen container mx-auto px-4 pt-28 pb-16">
      <h1 className="text-3xl font-semibold mb-4">{t("title")}</h1>
      <p className="text-slate-300 mb-6">{t("subtitle")}</p>

      <div className="rounded-lg border border-slate-700 bg-slate-900/40 p-4 mb-4 min-h-64">
        {history.length === 0 && (
          <p className="text-slate-400 text-sm">{t("empty")}</p>
        )}
        <ul className="space-y-2">
          {history.map((m, i) => (
            <li key={i} className={m.role === "assistant" ? "text-slate-100" : "text-slate-300"}>
              <span className="text-xs uppercase opacity-60 mr-2">{m.role}</span>
              {m.content}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && input.trim() && send()}
          placeholder={t("ph") as string}
          className="flex-1 h-12 rounded border border-slate-700 bg-slate-900/60 px-3 text-slate-100"
        />
        <button
          onClick={send}
          disabled={!input.trim()}
          className="inline-flex items-center justify-center rounded bg-primary text-white px-5 disabled:opacity-60"
        >
          {t("send")}
        </button>
      </div>
    </div>
  );
}
