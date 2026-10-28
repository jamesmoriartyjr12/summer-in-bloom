import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";

const messages: Record<string, string> = {
  AccessDenied: "Use a verified @bloomventures.com Google account.",
  Configuration: "Google sign-in is not connected on this preview yet.",
  OAuthSignin: "Google did not start. Try again.",
  OAuthCallback: "Google did not finish. Try again.",
  Default: "Sign-in did not complete. Try again.",
};

function isNextRedirect(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    String((error as { digest?: string }).digest).startsWith("NEXT_REDIRECT")
  );
}

async function startGoogleSignIn() {
  "use server";
  if (!process.env.AUTH_GOOGLE_ID || !process.env.AUTH_GOOGLE_SECRET) {
    redirect("/operate/sign-in?error=Configuration");
  }
  try {
    await signIn("google", { redirectTo: "/operate" });
  } catch (error) {
    if (isNextRedirect(error)) throw error;
    const code = error instanceof AuthError ? error.type : "Configuration";
    redirect(`/operate/sign-in?error=${code}`);
  }
}

export const metadata = {
  title: "Operate",
  robots: { index: false, follow: false },
};

export default function SignInPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  const code = searchParams?.error;
  const message = code ? messages[code] ?? messages.Default : null;

  return (
    <main className="relative flex min-h-screen flex-col">
      <img
        src="/bloom-wordmark.svg"
        alt=""
        className="pointer-events-none absolute left-1/2 top-[14%] w-[min(880px,86vw)] -translate-x-1/2 select-none opacity-10 brightness-0"
      />
      <div className="relative mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center px-6 py-24">
        <img src="/bloom-mark.svg" alt="" className="h-10 w-10" />
        <p className="mt-10 text-xs uppercase tracking-[0.2em]">Bloom</p>
        <h1 className="mt-3 text-4xl font-medium tracking-tight">Operate</h1>
        <p className="mt-4 text-base leading-7">
          Sign in with your Bloom Google account to open a deal.
        </p>
        {message ? <p className="mt-6 text-sm text-[#FA4C1F]">{message}</p> : null}
        <form action={startGoogleSignIn} className="mt-10">
          <button
            type="submit"
            className="flex h-12 w-full items-center justify-center gap-3 border border-[#070F18] bg-[#FAF6EC] text-sm"
          >
            <GoogleMark />
            Continue with Google
          </button>
        </form>
        <p className="mt-4 text-xs leading-5 opacity-60">@bloomventures.com accounts only.</p>
      </div>
    </main>
  );
}

function GoogleMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
      />
    </svg>
  );
}
