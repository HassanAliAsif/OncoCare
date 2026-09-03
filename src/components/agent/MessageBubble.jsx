import React, { useState } from "react";
import { ChevronDown, ChevronRight, Check, X, Loader2, Wrench } from "lucide-react";
import ReactMarkdown from "react-markdown";

const statusConfig = {
  pending: { Icon: Loader2, text: "Queued…", spin: true, color: "text-slate-400" },
  running: { Icon: Loader2, text: "Running…", spin: true, color: "text-blue-500" },
  in_progress: { Icon: Loader2, text: "Working…", spin: true, color: "text-blue-500" },
  completed: { Icon: Check, text: "Completed", spin: false, color: "text-teal-600" },
  success: { Icon: Check, text: "Done", spin: false, color: "text-teal-600" },
  failed: { Icon: X, text: "Failed", spin: false, color: "text-rose-500" },
  error: { Icon: X, text: "Error", spin: false, color: "text-rose-500" },
};

function FunctionDisplay({ toolCall }) {
  const [expanded, setExpanded] = useState(false);
  const status = statusConfig[toolCall.status] || statusConfig.pending;
  const { Icon } = status;

  // Check if failed
  const isFailed =
    toolCall.status === "failed" ||
    toolCall.status === "error" ||
    (toolCall.results && typeof toolCall.results === "string" && /error|failed/i.test(toolCall.results)) ||
    (toolCall.results && typeof toolCall.results === "object" && toolCall.results.success === false);

  const displayLabel = isFailed
    ? toolCall.display_projection?.error_label || "Failed"
    : toolCall.status === "pending" || toolCall.status === "running" || toolCall.status === "in_progress"
    ? toolCall.display_projection?.active_label || toolCall.display_projection?.label || "Working…"
    : toolCall.display_projection?.label || "Completed";

  const hideDetails = toolCall.display_projection?.hide_details && toolCall.display_projection?.details_redacted;

  let parsedArgs = toolCall.arguments_string;
  try {
    parsedArgs = JSON.parse(toolCall.arguments_string);
  } catch (e) {
    // keep raw
  }

  let parsedResults = toolCall.results;
  if (typeof toolCall.results === "string") {
    try {
      parsedResults = JSON.parse(toolCall.results);
    } catch (e) {
      // keep raw
    }
  }

  return (
    <div className="mt-2 text-xs border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
      <button
        onClick={() => !hideDetails && setExpanded(!expanded)}
        className={`flex items-center gap-2 w-full px-3 py-2 ${hideDetails ? "cursor-default" : "hover:bg-slate-100"}`}
      >
        {!hideDetails &&
          (expanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />)}
        <Icon className={`w-3.5 h-3.5 ${status.spin ? "animate-spin" : ""} ${isFailed ? "text-rose-500" : status.color}`} />
        <Wrench className="w-3 h-3 text-slate-400" />
        <span className="font-medium text-slate-600">{displayLabel}</span>
      </button>
      {expanded && !hideDetails && (
        <div className="px-3 pb-3 space-y-2">
          {parsedArgs && (
            <div>
              <p className="text-slate-400 font-medium mb-1">Parameters:</p>
              <pre className="text-slate-600 bg-white rounded p-2 overflow-x-auto border border-slate-100 text-[11px] leading-relaxed">
                {JSON.stringify(parsedArgs, null, 2)}
              </pre>
            </div>
          )}
          {parsedResults && (
            <div>
              <p className="text-slate-400 font-medium mb-1">Result:</p>
              <pre className="text-slate-600 bg-white rounded p-2 overflow-x-auto border border-slate-100 text-[11px] leading-relaxed max-h-48">
                {JSON.stringify(parsedResults, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function MessageBubble({ message }) {
  const isUser = message.role === "user";
  return (
    <div className={isUser ? "flex justify-end" : "flex justify-start"}>
      <div className={`max-w-[85%] ${isUser ? "" : "w-full"}`}>
        <div
          className={
            isUser
              ? "bg-teal-600 text-white rounded-2xl rounded-br-md px-4 py-2.5"
              : "bg-white border border-slate-200 rounded-2xl rounded-bl-md px-4 py-3"
          }
        >
          {message.content &&
            (isUser ? (
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            ) : (
              <div className="prose prose-sm max-w-none prose-p:my-1.5 prose-ul:my-1.5 prose-li:my-0.5 prose-a:text-teal-600 prose-a:underline prose-headings:my-2 prose-headings:text-slate-800">
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>
            ))}
          {message.tool_calls?.map((toolCall, idx) => (
            <FunctionDisplay key={idx} toolCall={toolCall} />
          ))}
        </div>
      </div>
    </div>
  );
}