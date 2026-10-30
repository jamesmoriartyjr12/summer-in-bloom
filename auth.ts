import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [Google],
  pages: { signIn: "/operate/sign-in", error: "/operate/sign-in" },
  callbacks: {
    signIn({ profile }) {
      const email = profile?.email?.toLowerCase() ?? "";
      const allowed =
        email.endsWith("@bloomgrowthagency.com") ||
        email.endsWith("@bloomventures.com");
      return profile?.email_verified === true && allowed;
    },
  },
});
