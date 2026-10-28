import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  pages: { signIn: "/operate/sign-in" },
  callbacks: {
    signIn({ profile }) {
      const email = profile?.email ?? "";
      return email.toLowerCase().endsWith("@bloomventures.com");
    },
  },
});
