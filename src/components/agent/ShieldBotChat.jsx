const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useEffect, useState, useRef } from "react";

import { Shield, Send, X, Loader2, Maximize2, Minimize2 } from "lucide-react";
import MessageBubble from "@/components/agent/MessageBubble";
import { useTranslation } from "@/lib/i18n";

const AGENT_NAME = "chemocare_assistant";

const suggestedPromptKeys = ["agent.prompt1", "agent.prompt2", "agent.prompt3", "agent.prompt4"];

export default function ShieldBotChat() {
  const { t } = useTranslation();
  const suggestedPrompts = suggestedPromptKeys.map((k) => t(k));
  const [open, setOpen] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const scrollRef = useRef(null);

  // Lazy-load conversation the first time the panel opens
  useEffect(() => {
    if (!open || initialized) return;
    setInitialized(true);
    (async () => {
      setLoading(true);
      try {
        const existing = await db.agents.listConversations({ agent_name: AGENT_NAME });
        if (existing.length > 0) {
          const conv = await db.agents.getConversation(existing[0].id);
          setConversation(conv);
          setMessages(conv.messages || []);
        } else {
          const conv = await db.agents.createConversation({
            agent_name: AGENT_NAME,
            metadata: { name: "ShieldBot", description: "Personalized chemotherapy support" },
          });
          setConversation(conv);
          setMessages(conv.messages || []);
        }
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, [open, initialized]);

  // Subscribe to live conversation updates
  useEffect(() => {
    if (!conversation?.id) return;
    const unsubscribe = db.agents.subscribeToConversation(conversation.id, (data) => {
      setMessages(data.messages || []);
    });
    return () => unsubscribe();
  }, [conversation?.id]);

  // Auto-scroll to newest message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sending]);

  const handleSend = async (text) => {
    const content = (text ?? input).trim();
    if (!content || !conversation || sending) return;
    setInput("");
    setSending(true);
    try {
      await db.agents.addMessage(conversation, { role: "user", content });
    } catch (e) {
      // ignore
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating bubble */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="ShieldBot"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-teal-600 to-cyan-600 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center"
      >
        {open ? <X className="w-6 h-6" /> : <Shield className="w-7 h-7" />}
      </button>

      {/* Chat panel */}
      {open && (
        <div className={expanded
          ? "fixed inset-4 sm:inset-x-auto sm:bottom-24 sm:right-6 sm:top-20 z-50 w-auto sm:w-[640px] max-w-[640px] h-auto max-h-[calc(100vh-7rem)] bg-white rounded-2xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden"
          : "fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[380px] max-w-[400px] h-[520px] max-h-[70vh] bg-white rounded-2xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden"}>
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-teal-50 to-cyan-50">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-600 to-cyan-600 text-white flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-800 leading-tight">ShieldBot</p>
              <p className="text-xs text-slate-400 truncate">{t("agent.subtitle")}</p>
            </div>
            <button onClick={() => setExpanded((e) => !e)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white transition-colors" aria-label="Toggle size">
              {expanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-6 h-6 text-teal-600 animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-2">
                <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-3">
                  <Shield className="w-7 h-7" />
                </div>
                <h2 className="font-semibold text-slate-800">{t("agent.greetingTitle")}</h2>
                <p className="text-sm text-slate-400 mt-2">{t("agent.greetingBody")}</p>
                <div className="grid grid-cols-1 gap-2 mt-4 w-full">
                  {suggestedPrompts.map((p, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(p)}
                      className="text-left text-sm text-slate-600 px-3 py-2.5 rounded-xl border border-slate-200 hover:border-teal-300 hover:bg-teal-50 transition-colors"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => <MessageBubble key={idx} message={msg} />)
            )}
            {sending && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-md px-4 py-3">
                  <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-slate-100 p-3">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t("agent.placeholder")}
                rows={1}
                className="flex-1 resize-none px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 max-h-24"
                style={{ minHeight: "42px" }}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || sending}
                className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5 px-1 leading-tight">{t("agent.disclaimer")}</p>
          </div>
        </div>
      )}
    </>
  );
}