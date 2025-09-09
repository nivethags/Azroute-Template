// app/api/auth/[...nextauth]/route.js
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
<<<<<<< HEAD
import { supabase } from '@/lib/supabaseClient';
=======
import { connectDB } from '@/lib/mongodb';
import Student from '@/models/Student';
import Teacher from '@/models/Teacher';
>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa
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
<<<<<<< HEAD
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

=======
        if (!credentials?.email || !credentials?.password || !credentials?.role) {
          throw new Error('Missing fields');
        }

        await connectDB();

        const Model = credentials.role === 'student' ? Student : Teacher;
        const user = await Model.findOne({ email: credentials.email });

        if (!user) {
          throw new Error('No user found with this email');
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error('Invalid password');
        }

        if (!user.verified) {
          throw new Error('Please verify your email first');
        }

        return {
          id: user._id,
          email: user.email,
          name: user.name,
          role: credentials.role
        };
      }
>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa
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
<<<<<<< HEAD
    maxAge: 30 * 24 * 60 * 60, // 30 days
=======
    maxAge: 30 * 24 * 60 * 60, // 24 hours
>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
<<<<<<< HEAD
export { handler as GET, handler as POST };
=======
export { handler as GET, handler as POST };
>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa
