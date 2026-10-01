import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Copy, Check, Sparkles } from "lucide-react";
import { PageHeader, Panel, OutputState } from "@/components/AppShell";
import { useAI } from "@/lib/use-ai";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — AI Workplace Assistant" },
      { name: "description", content: "Generate professional workplace emails with AI in formal, friendly or persuasive tones." },
      { property: "og:title", content: "Smart Email Generator" },
      { property: "og:description", content: "Generate professional workplace emails with AI." },
    ],
  }),
  component: EmailPage,
});

const TONES = ["Formal", "Friendly", "Persuasive"] as const;

function EmailPage() {
  const [recipient, setRecipient] = useState("");
  const [purpose, setPurpose] = useState("");
  const [points, setPoints] = useState("");
  const [tone, setTone] = useState<(typeof TONES)[number]>("Formal");
  const [copied, setCopied] = useState(false);
  const ai = useAI<{ subject: string; body: string }>("email");

  const go = () => ai.run({ Recipient: recipient, Purpose: purpose, "Key points": points, Tone: tone });
  const clear = () => { setRecipient(""); setPurpose(""); setPoints(""); ai.reset(); };
  const copy = () => {
    if (!ai.data) return;
    navigator.clipboard.writeText(`Subject: ${ai.data.subject}\n\n${ai.data.body}`);
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div>
      <PageHeader icon={Mail} title="Smart Email Generator" desc="Describe your email and let AI draft it in the tone you need." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Your input">
          <div className="space-y-4">
            <label className="field"><span>Recipient</span><input className="input" value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="e.g. Sarah, Head of Finance" /></label>
            <label className="field"><span>Purpose *</span><input className="input" value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="e.g. Request budget approval for Q4 campaign" /></label>
            <label className="field"><span>Key points</span><textarea className="input min-h-32" value={points} onChange={(e) => setPoints(e.target.value)} placeholder="Details, figures, dates, asks…" /></label>
            <div className="field"><span>Tone</span>
              <div className="grid grid-cols-3 gap-2">
                {TONES.map((t) => (
                  <button key={t} onClick={() => setTone(t)} className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${tone === t ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-muted"}`}>{t}</button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={go} disabled={!purpose.trim() || ai.loading} className="btn-primary flex-1"><Sparkles className="h-4 w-4" />{ai.loading ? "Generating…" : "Generate email"}</button>
              <button onClick={clear} className="btn-outline">Clear</button>
            </div>
          </div>
        </Panel>
        <Panel title="AI output" badge={!!ai.data} actions={ai.data && <button onClick={copy} className="btn-ghost">{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{copied ? "Copied" : "Copy"}</button>}>
          <OutputState loading={ai.loading} error={ai.error} empty={!ai.data} emptyText="Fill in the purpose and choose a tone — your AI-drafted email will appear here, ready to edit." onRetry={go} />
          {ai.data && !ai.loading && !ai.error && (
            <div className="space-y-4">
              <label className="field"><span>Subject</span><input className="input font-medium" value={ai.data.subject} onChange={(e) => ai.setData({ ...ai.data!, subject: e.target.value })} /></label>
              <label className="field"><span>Body (editable)</span><textarea className="input min-h-96 leading-relaxed" value={ai.data.body} onChange={(e) => ai.setData({ ...ai.data!, body: e.target.value })} /></label>
              <button onClick={go} className="btn-outline w-full">Regenerate</button>
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
