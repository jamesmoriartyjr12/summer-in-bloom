import { selectPackage } from "@/lib/operate/deals";

export const dynamic = "force-dynamic";

function readPackageId(body: unknown): string | null {
  if (!body || typeof body !== "object" || !("packageId" in body)) return null;
  const packageId = (body as { packageId: unknown }).packageId;
  return typeof packageId === "string" ? packageId : null;
}

export async function POST(request: Request, { params }: { params: { token: string } }) {
  let packageId: string | null = null;
  try {
    packageId = readPackageId(await request.json());
  } catch {
    packageId = null;
  }
  if (!packageId || !process.env.DATABASE_URL) {
    return new Response(null, { status: 404 });
  }

  const result = await selectPackage(params.token, packageId);
  if (!result.ok) return new Response(null, { status: 404 });
  return Response.json({ ok: true });
}
