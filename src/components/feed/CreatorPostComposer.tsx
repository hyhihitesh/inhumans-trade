"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  BarChart3, 
  Video, 
  Send, 
  ChevronDown,
  ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

type VisibilityTier = "free" | "pro" | "premium";

export function CreatorPostComposer() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [visibilityTier, setVisibilityTier] = useState<VisibilityTier>("free");
  const [state, setState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function publishPost() {
    const trimmed = content.trim();
    if (trimmed.length < 5) {
      setState("error");
      setMessage("Please enter a more detailed thought.");
      return;
    }

    setState("submitting");
    setMessage(null);
    try {
      const response = await fetch("/api/community-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: trimmed,
          visibilityTier,
        }),
      });

      const payload = (await response.json()) as { error?: string; communityPostId?: string };
      if (!response.ok) throw new Error(payload.error ?? "Submission failed.");

      setState("success");
      setMessage("Thought shared with your feed.");
      setContent("");
      setIsExpanded(false);
      router.refresh();
      
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setState("error");
      setMessage((error as Error).message);
    }
  }

  return (
    <article 
      className={cn(
        "rounded-inhumans-lg border border-inhumans-border bg-white transition-all duration-500 overflow-hidden shadow-inhumans",
        isExpanded ? "p-6 shadow-inhumans-elevated" : "p-4"
      )} 
      data-testid="creator-post-composer"
    >
      {!isExpanded ? (
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 rounded-inhumans-md bg-teal-primary/10 flex items-center justify-center border border-teal-primary/20">
            <ShieldCheck size={18} className="text-teal-primary" />
          </div>
          <button 
            onClick={() => setIsExpanded(true)}
            className="flex-1 text-left px-5 py-2.5 rounded-full bg-surface-2 border border-inhumans-divider text-text-muted text-sm hover:bg-surface-3 transition-all"
          >
            Share a market thought...
          </button>
          <div className="flex items-center gap-2">
            <button className="p-2 text-text-faint hover:text-teal-primary transition-colors" title="Chart">
              <BarChart3 size={20} />
            </button>
            <button className="p-2 text-text-faint hover:text-loss transition-colors" title="Live">
              <Video size={20} />
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-primary font-display">New Commentary</p>
              <div className="w-1 h-1 rounded-full bg-inhumans-divider" />
              <div className="relative group">
                <select
                  value={visibilityTier}
                  onChange={(event) => setVisibilityTier(event.target.value as VisibilityTier)}
                  className="bg-transparent text-[10px] font-bold uppercase tracking-widest text-text-muted outline-none cursor-pointer hover:text-foreground appearance-none pr-4"
                >
                  <option value="free">Public Access</option>
                  <option value="pro">Pro Subscribed</option>
                  <option value="premium">Premium Only</option>
                </select>
                <ChevronDown size={10} className="absolute right-0 top-1/2 -translate-y-1/2 text-text-faint pointer-events-none" />
              </div>
            </div>
            <button 
              onClick={() => setIsExpanded(false)}
              className="p-1 rounded-full hover:bg-surface-2 text-text-faint transition-colors"
            >
              <ChevronDown size={20} />
            </button>
          </div>

          <textarea
            rows={4}
            autoFocus
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="What's your execution rationale or risk outlook?"
            className="w-full resize-none rounded-inhumans-md border border-inhumans-border bg-surface-2/50 px-5 py-4 text-sm focus:bg-white focus:border-teal-primary/30 outline-none transition-all placeholder:text-text-faint text-foreground font-medium"
          />

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-6 text-text-muted">
              <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest hover:text-teal-primary transition-colors">
                <BarChart3 size={16} className="text-text-faint" /> Attach Chart
              </button>
              <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest hover:text-loss transition-colors">
                <Video size={16} className="text-text-faint" /> Go Live
              </button>
            </div>
            
            <button
              type="button"
              onClick={publishPost}
              disabled={state === "submitting" || content.trim().length < 5}
              className="flex items-center gap-2 rounded-inhumans-md bg-teal-primary px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white disabled:opacity-30 transition-all hover:bg-teal-primary-hover shadow-md shadow-teal-primary/10"
            >
              {state === "submitting" ? "Sharing..." : (
                <>
                  Publish <Send size={14} />
                </>
              )}
            </button>
          </div>
          
          {message && (
            <p className={cn(
              "text-[10px] font-bold uppercase tracking-widest animate-in fade-in zoom-in-95 duration-200 text-center",
              state === "error" ? "text-loss" : "text-profit"
            )}>
              {message}
            </p>
          )}
        </div>
      )}
    </article>
  );
}

