import { selectTerm } from "@/lib/operate/deals";

export const dynamic = "force-dynamic";

function readTerm(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const { term } = body as { term?: unknown };
  return typeof term === "string" ? term : null;
}

export async function POST(request: Request, { params }: { params: { token: string } }) {
  let term: string | null = null;
  try {
    term = readTerm(await request.json());
  } catch {
    term = null;
  }
  if (!term || !process.env.DATABASE_URL) {
    return new Response(null, { status: 404 });
  }

  const result = await selectTerm(params.token, term);
  if (!result.ok) return new Response(null, { status: 404 });
  return Response.json({ ok: true });
}
