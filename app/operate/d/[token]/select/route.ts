import { selectPackage } from "@/lib/operate/deals";

export const dynamic = "force-dynamic";

type Choice = { packageId: string; term: string; equityCents: number };

function readChoice(body: unknown): Choice | null {
  if (!body || typeof body !== "object") return null;
  const { packageId, term, equityCents } = body as { packageId?: unknown; term?: unknown; equityCents?: unknown };
  if (typeof packageId !== "string" || typeof term !== "string") return null;
  if (typeof equityCents !== "number" || !Number.isInteger(equityCents)) return null;
  return { packageId, term, equityCents };
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

  const result = await selectPackage(params.token, choice.packageId, choice.term, choice.equityCents);
  if (!result.ok) return new Response(null, { status: 404 });
  return Response.json({ ok: true });
}
