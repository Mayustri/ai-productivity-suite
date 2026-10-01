import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, NotebookPen, CalendarCheck, ArrowRight, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — AI Workplace Productivity Assistant" },
      { name: "description", content: "AI tools to write emails, summarise meetings and plan your week." },
      { property: "og:title", content: "AI Workplace Productivity Assistant" },
      { property: "og:description", content: "AI tools to write emails, summarise meetings and plan your week." },
    ],
  }),
  component: Dashboard,
});

const TOOLS = [
  { to: "/email", icon: Mail, title: "Smart Email Generator", desc: "Draft professional emails in a formal, friendly or persuasive tone." },
  { to: "/meetings", icon: NotebookPen, title: "Meeting Notes Summariser", desc: "Turn long notes into summaries, decisions, action items and deadlines." },
  { to: "/planner", icon: CalendarCheck, title: "AI Task Planner", desc: "Build a prioritised daily or weekly schedule from your task list." },
] as const;

function Dashboard() {
  return (
    <div>
      <section className="relative overflow-hidden rounded-3xl bg-hero p-8 text-primary-foreground sm:p-12">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-medium"><Sparkles className="h-3.5 w-3.5" /> Powered by AI</span>
        <h1 className="mt-4 max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-5xl">Less busywork. More meaningful work.</h1>
        <p className="mt-4 max-w-xl text-primary-foreground/80">Your AI assistant for everyday workplace tasks — every result is generated from what you provide.</p>
        <Link to="/email" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary-foreground px-5 py-3 text-sm font-semibold text-primary transition hover:opacity-90">Get started <ArrowRight className="h-4 w-4" /></Link>
      </section>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {TOOLS.map(({ to, icon: Icon, title, desc }) => (
          <Link key={to} to={to} className="group rounded-2xl border border-border bg-card p-6 shadow-soft transition hover:-translate-y-0.5 hover:border-primary/40">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-accent text-accent-foreground"><Icon className="h-5 w-5" /></div>
            <h2 className="mt-5 font-display text-lg font-semibold">{title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
            <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary">Open tool <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
          </Link>
        ))}
      </div>
    </div>
  );
}
