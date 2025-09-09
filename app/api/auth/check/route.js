import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth-token');

    if (!authToken || !authToken.value) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      );
    }

    try {
      const decoded = jwt.verify(authToken.value, process.env.JWT_SECRET);

      let { data: user, error } = await supabase
        .from(decoded.role === 'teacher' ? 'teachers' : 'students')
        .select('*')
        .eq('id', decoded.userId)
        .single();

      if (error || !user) {
        return NextResponse.json(
          { message: "User not found" },
          { status: 404 }
        );
      }

      // Transform the user object based on role
      const userResponse = {
        id: user.id,
        firstName: user.firstName,
        middleName: user.middleName,
        lastName: user.lastName,
        email: user.email,
        username: user.username,
        preferredContactNumber: user.preferredContactNumber,
        verified: user.verified,
        role: decoded.role,
        profile: {
          avatar: user.profile?.avatar || null,
          bio: user.profile?.bio || null,
          location: user.profile?.location || null,
          website: user.profile?.website || null,
          education: user.profile?.education || [],
          skills: user.profile?.skills || [],
          socialLinks: user.profile?.socialLinks || {
            linkedin: null,
            github: null,
            twitter: null
          }
        }
      };

      // Add role-specific fields
      if (decoded.role === 'student') {
        userResponse.subjectsOfInterest = user.subjectsOfInterest || [];
      }

      return NextResponse.json({ user: userResponse });

    } catch (err) {
      console.error('Token verification error:', err);

      if (err instanceof jwt.TokenExpiredError) {
        const cookieStore = await cookies();
        cookieStore.delete('auth-token');

        return NextResponse.json(
          { 
            message: "Token expired",
            code: "TOKEN_EXPIRED"
          },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { message: "Invalid token" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { message: "Authentication failed" },
      { status: 401 }
    );
  }
}
