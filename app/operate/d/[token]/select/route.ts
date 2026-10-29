import { selectPackage } from "@/lib/operate/deals";

export const dynamic = "force-dynamic";

function readChoice(body: unknown): { packageId: string; term: string } | null {
  if (!body || typeof body !== "object") return null;
  const { packageId, term } = body as { packageId?: unknown; term?: unknown };
  if (typeof packageId !== "string" || typeof term !== "string") return null;
  return { packageId, term };
}

export async function POST(request: Request, { params }: { params: { token: string } }) {
  let choice: { packageId: string; term: string } | null = null;
  try {
    choice = readChoice(await request.json());
  } catch {
    choice = null;
  }
  if (!choice || !process.env.DATABASE_URL) {
    return new Response(null, { status: 404 });
  }

  const result = await selectPackage(params.token, choice.packageId, choice.term);
  if (!result.ok) return new Response(null, { status: 404 });
  return Response.json({ ok: true });
}
