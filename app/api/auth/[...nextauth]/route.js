// app/api/auth/[...nextauth]/route.js
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { supabase } from '@/lib/supabaseClient';
import bcrypt from 'bcryptjs';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" }
      },
      async authorize(credentials) {
  if (!credentials?.email || !credentials?.password || !credentials?.role) {
    throw new Error('Missing fields');
  }

  // Choose the table based on role
  const table = credentials.role === 'student' ? 'Students' : 'Teachers';

  // Fetch user from Supabase
  const { data: user, error } = await supabase
    .from(table)
    .select('*')
    .eq('email', credentials.email)
    .single();

  if (error || !user) {
    throw new Error('No user found with this email');
  }

  // Compare password (plain-text check for now)
  const isPasswordValid = credentials.password === user.password;
  if (!isPasswordValid) {
    throw new Error('Invalid password');
  }

  return {
    id: user.Student_id,
    email: user.email,
    name: user.Student_name,
    role: credentials.role,
  };
}

    })
  ],
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
