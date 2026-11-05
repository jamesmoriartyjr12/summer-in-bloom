import { requestPackage } from "@/lib/operate/deals";

export const dynamic = "force-dynamic";

export async function POST(_request: Request, { params }: { params: { token: string } }) {
  if (!process.env.DATABASE_URL) return new Response(null, { status: 404 });
  const result = await requestPackage(params.token);
  if (!result.ok) return new Response(null, { status: 404 });
  return Response.json({ ok: true });
}
