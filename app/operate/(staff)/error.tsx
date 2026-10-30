"use client";

export default function StaffError({ error }: { error: Error & { digest?: string } }) {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <p className="operate-label text-muted-foreground">Operate</p>
      <h1 className="mt-2 text-4xl font-medium tracking-tight">This page did not load.</h1>
      <p className="mt-4 text-sm text-muted-foreground">{error.message || "Refresh and try again."}</p>
    </main>
  );
}
