import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

//handles login & session
export const authOptions: NextAuthOptions = {

  session: { strategy: "jwt" },

  providers: [

    CredentialsProvider({

      name: "Credentials",

      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      //authorize user login
      async authorize(credentials) {

        //make sure email and password are given
        if (!credentials?.email || !credentials?.password) return null;

        //check if there is a user with this email
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email));

        //fail if there is no user with the email
        if (!user) return null;

        //check if the password is correct
        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.password
        );

        //fail if incorrect password
        if (!passwordMatch) return null;

        //success, return user info --> pass to jwt() as "user"
        return { id: String(user.id), name: user.username, email: user.email };

      },

    }),

  ],

  callbacks: {

    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },

    async session({ session, token }) {
      if (session.user) session.user.id = token.id as string;
      return session;
    },

  },

  pages: {
    signIn: "/login",
  },

};