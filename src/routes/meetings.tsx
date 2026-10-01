import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { NotebookPen, Sparkles, CheckSquare, Gavel, CalendarClock, FileText } from "lucide-react";
import { PageHeader, Panel, OutputState } from "@/components/AppShell";
import { useAI } from "@/lib/use-ai";

export const Route = createFileRoute("/meetings")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summariser — AI Workplace Assistant" },
      { name: "description", content: "Summarise meeting notes and extract action items, decisions and deadlines with AI." },
      { property: "og:title", content: "Meeting Notes Summariser" },
      { property: "og:description", content: "Summarise meeting notes with AI." },
    ],
  }),
  component: MeetingsPage,
});

type Result = {
  summary: string;
  keyDecisions: string[];
  actionItems: { task: string; owner: string; due: string }[];
  deadlines: { item: string; date: string }[];
};

function MeetingsPage() {
  const [notes, setNotes] = useState("");
  const [context, setContext] = useState("");
  const ai = useAI<Result>("meeting");
  const go = () => ai.run({ "Meeting context": context, "Meeting notes": notes });
  const d = ai.data;

  return (
    <div>
      <PageHeader icon={NotebookPen} title="Meeting Notes Summariser" desc="Paste your notes and get a structured, AI-generated summary." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Your input">
          <div className="space-y-4">
            <label className="field"><span>Meeting context (optional)</span><input className="input" value={context} onChange={(e) => setContext(e.target.value)} placeholder="e.g. Weekly product sync, 12 Oct" /></label>
            <label className="field"><span>Meeting notes *</span><textarea className="input min-h-80" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Paste your raw meeting notes or transcript here…" /></label>
            <p className="text-xs text-muted-foreground">{notes.length.toLocaleString()} characters</p>
            <div className="flex gap-2">
              <button onClick={go} disabled={notes.trim().length < 20 || ai.loading} className="btn-primary flex-1"><Sparkles className="h-4 w-4" />{ai.loading ? "Summarising…" : "Summarise notes"}</button>
              <button onClick={() => { setNotes(""); setContext(""); ai.reset(); }} className="btn-outline">Clear</button>
            </div>
          </div>
        </Panel>
        <Panel title="AI output" badge={!!d}>
          <OutputState loading={ai.loading} error={ai.error} empty={!d} emptyText="Paste at least a few lines of notes to generate a summary with action items, decisions and deadlines." onRetry={go} />
          {d && !ai.loading && !ai.error && (
            <div className="space-y-6">
              <Section icon={FileText} title="Summary"><p className="text-sm leading-relaxed">{d.summary}</p></Section>
              <Section icon={CheckSquare} title="Action items">
                {d.actionItems?.length ? (
                  <ul className="space-y-2">{d.actionItems.map((a, i) => (
                    <li key={i} className="rounded-xl border border-border bg-muted/40 p-3 text-sm">
                      <p className="font-medium">{a.task}</p>
                      <p className="mt-1 text-xs text-muted-foreground">Owner: {a.owner} · Due: {a.due}</p>
                    </li>))}</ul>
                ) : <Empty />}
              </Section>
              <Section icon={Gavel} title="Key decisions">
                {d.keyDecisions?.length ? <ul className="list-disc space-y-1 pl-5 text-sm">{d.keyDecisions.map((k, i) => <li key={i}>{k}</li>)}</ul> : <Empty />}
              </Section>
              <Section icon={CalendarClock} title="Deadlines">
                {d.deadlines?.length ? (
                  <ul className="divide-y divide-border rounded-xl border border-border text-sm">{d.deadlines.map((x, i) => (
                    <li key={i} className="flex justify-between gap-4 px-3 py-2"><span>{x.item}</span><span className="shrink-0 font-medium text-primary">{x.date}</span></li>))}</ul>
                ) : <Empty />}
              </Section>
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return <div><h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"><Icon className="h-4 w-4 text-primary" />{title}</h3>{children}</div>;
}
const Empty = () => <p className="text-sm text-muted-foreground">None identified in these notes.</p>;
