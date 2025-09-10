// lib/auth.js
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectDB } from './mongodb';
import bcrypt from 'bcryptjs';
import Student from '@/models/Student';
import Teacher from '@/models/Teacher';
import { ObjectId } from 'mongodb';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" }  // Add role to credentials
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password || !credentials?.role) {
          throw new Error('Missing credentials');
        }

        try {
          await connectDB();
          
          // Select the appropriate model based on role
          const Model = credentials.role === 'student' ? Student : Teacher;
          
          const user = await Model.findOne({ email: credentials.email });

          if (!user) {
            throw new Error('No user found with this email');
          }

          const isValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isValid) {
            throw new Error('Invalid password');
          }

          // Check if user is verified
          if (!user.verified) {
            throw new Error('Please verify your email first');
          }

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: credentials.role,
            avatar: user.avatar || null
          };
        } catch (error) {
          console.error('Auth error:', error);
          throw new Error(error.message || 'Authentication failed');
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.email = user.email;
        token.name = user.name;
        token.avatar = user.avatar;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.avatar = token.avatar;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Helper function to get auth token from cookies
export async function getAuthToken() {
  try {
    const cookie=await cookies()
    const token = cookie.get('auth-token');
    if (!token) return null;
    
    const decoded = jwt.verify(token.value, process.env.JWT_SECRET);

    return decoded;
  } catch (error) {
    console.error('Auth token error:', error);
    return null;
  }
}

// Helper function to get authenticated user
export async function getAuthUser() {
  try {
    const token = await getAuthToken();
    if (!token) return null;

    const Model = token.role === 'student' ? Student : Teacher;
    const user = await Model.findById(token.userId)
      .select('-password')
      .lean();

    if (!user) return null;

    return {
      ...user,
      id: user._id.toString(),
      role: token.role
    };
  } catch (error) {
    console.error('Get auth user error:', error);
    return null;
  }
}

// Helper function to verify authentication for API routes
export async function verifyAuth(request) {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    // Verify user still exists
    const Model = token.role === 'student' ? Student : Teacher;
    const user = await Model.findById(token.userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.verified) {
      throw new Error('Email not verified');
    }

    return {
      userId: token.userId,
      role: token.role
    };
  } catch (error) {
    throw new Error('Authentication failed');
  }
}

// Helper function to check role authorization
export function checkRole(user, allowedRoles) {
  if (!user || !user.role) return false;
  return allowedRoles.includes(user.role);
}

// Generate JWT token
export function generateToken(userId, role) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }

  return jwt.sign(
    { 
      userId, 
      role 
    },
    process.env.JWT_SECRET,
    // { expiresIn: '24h' }
  );
}

// Helper function to handle auth errors
export function handleAuthError(error) {
  console.error('Auth error:', error);
  return {
    error: error.message || 'Authentication failed',
    status: error.message.includes('not found') ? 404 : 401
  };
}