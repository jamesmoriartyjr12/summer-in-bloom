import { signIn } from "@/auth";

export default function SignInPage() {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("google");
      }}
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <button type="submit" style={{ font: "inherit", color: "inherit" }}>
        Sign in with Google to open Operate.
      </button>
    </form>
  );
}
