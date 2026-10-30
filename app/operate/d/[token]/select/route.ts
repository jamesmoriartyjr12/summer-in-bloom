import { selectTerm } from "@/lib/operate/deals";

export const dynamic = "force-dynamic";

type Choice = { term: string; equityCents: number };

function readChoice(body: unknown): Choice | null {
  if (!body || typeof body !== "object") return null;
  const { term, equityCents } = body as { term?: unknown; equityCents?: unknown };
  if (typeof term !== "string") return null;
  if (typeof equityCents !== "number" || !Number.isInteger(equityCents)) return null;
  return { term, equityCents };
}

export async function POST(request: Request, { params }: { params: { token: string } }) {
  let choice: Choice | null = null;
  try {
    choice = readChoice(await request.json());
  } catch {
    choice = null;
  }
  if (!choice || !process.env.DATABASE_URL) {
    return new Response(null, { status: 404 });
  }

  const result = await selectTerm(params.token, choice.term, choice.equityCents);
  if (!result.ok) return new Response(null, { status: 404 });
  return Response.json({ ok: true });
}
