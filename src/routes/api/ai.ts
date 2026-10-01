import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { runAI } from "@/lib/ai.server";

const Body = z.object({
  task: z.enum(["email", "meeting", "planner"]),
  input: z.record(z.string()),
});

const SYSTEMS: Record<string, string> = {
  email: `You are an expert workplace communication assistant. Write one complete professional email based strictly on the user's details and the requested tone. Return ONLY JSON: {"subject": string, "body": string}. The body must include greeting and sign-off, use real line breaks, and never invent facts beyond reasonable placeholders in [brackets] for missing names.`,
  meeting: `You are an expert meeting analyst. Analyse the user's meeting notes and return ONLY JSON:
{"summary": string (3-6 sentence context-specific summary), "keyDecisions": string[], "actionItems": [{"task": string, "owner": string, "due": string}], "deadlines": [{"item": string, "date": string}]}.
Use only information from the notes. Use "Unassigned" / "Not specified" where unknown. Empty arrays if none.`,
  planner: `You are an expert productivity coach. Build a prioritised schedule from the user's tasks using the Eisenhower matrix (importance + urgency), respecting stated working hours, deadlines and durations. Return ONLY JSON:
{"overview": string (2-3 sentences of strategy), "days": [{"label": string, "blocks": [{"time": string, "task": string, "priority": "High"|"Medium"|"Low", "notes": string}]}]}.
For a daily plan return exactly one day; for weekly return Monday–Friday. Include short breaks.`,
};

function parseJSON(text: string) {
  const m = text.match(/\{[\s\S]*\}/);
  return JSON.parse(m ? m[0] : text);
}

export const Route = createFileRoute("/api/ai")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: z.infer<typeof Body>;
        try {
          body = Body.parse(await request.json());
        } catch {
          return Response.json({ error: "Invalid request." }, { status: 400 });
        }
        const prompt = Object.entries(body.input)
          .filter(([, v]) => v.trim())
          .map(([k, v]) => `${k}: ${v.slice(0, 20000)}`)
          .join("\n\n");
        try {
          const text = await runAI(SYSTEMS[body.task], prompt, request.signal);
          if (!text.trim()) return Response.json({ error: "The AI returned no content. Please adjust your input." }, { status: 502 });
          return Response.json({ data: parseJSON(text) });
        } catch (e: any) {
          const status = e?.statusCode ?? e?.status ?? 500;
          const msg =
            status === 429 ? "Too many requests — please wait a moment and try again."
            : status === 402 ? "AI credits are exhausted. Please add credits to continue."
            : e instanceof SyntaxError ? "The AI response couldn't be read. Please try again."
            : "Something went wrong generating content. Please try again.";
          return Response.json({ error: msg }, { status: e instanceof SyntaxError ? 502 : status });
        }
      },
    },
  },
});
