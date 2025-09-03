
// File: app/api/student/profile/route.js
import { connectDB } from "@/lib/mongodb";
import Student from "@/models/Student";
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth-token');

    if (!authToken) {
      return new Response(
        JSON.stringify({ message: "Not authenticated" }),
        { status: 401 }
      );
    }

    const decoded = jwt.verify(authToken.value, process.env.JWT_SECRET);
    await connectDB();

    const student = await Student.findById(decoded.userId)
      .select('-password')
      .lean();

    if (!student) {
      return new Response(
        JSON.stringify({ message: "Student not found" }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({
        ...student,
        id: student._id.toString()
      }),
      { status: 200 }
    );

  } catch (error) {
    console.error('Profile fetch error:', error);
    return new Response(
      JSON.stringify({ message: "Internal server error" }),
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth-token');

    if (!authToken) {
      return new Response(
        JSON.stringify({ message: "Not authenticated" }),
        { status: 401 }
      );
    }

    const decoded = jwt.verify(authToken.value, process.env.JWT_SECRET);
    await connectDB();

    const updatedData = await request.json();
    const student = await Student.findById(decoded.userId);
    console.log("udapteddata",updatedData)
    if (!student) {
      return new Response(
        JSON.stringify({ message: "Student not found" }),
        { status: 404 }
      );
    }

    // Update fields
    if (updatedData.profile) {
      if (updatedData.profile.socialLinks) {
        const cleanedSocialLinks = Object.fromEntries(
          Object.entries(updatedData.profile.socialLinks).filter(([_, value]) => value)
        );
        updatedData.profile.socialLinks = cleanedSocialLinks;
      }
      
      student.profile = {
        ...student.profile.toObject(), // Ensure nested object merging
        ...updatedData.profile
      };
      student.markModified('profile.socialLinks');
    }

    ['firstName', 'middleName', 'lastName', 'preferredContactNumber', 'subjectsOfInterest'].forEach(field => {
      if (updatedData[field] !== undefined) {
        student[field] = updatedData[field];
      }
    });

    await student.save();

    return new Response(
      JSON.stringify({
        ...student.toObject(),
        id: student._id.toString()
      }),
      { status: 200 }
    );

  } catch (error) {
    console.error('Error during profile update:', error);
    return new Response(
      JSON.stringify({ message: error.message || "Internal server error" }),
      { status: 500 }
    );
  }
}



