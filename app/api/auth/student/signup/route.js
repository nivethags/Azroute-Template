// app/api/auth/student/signup/route.js
import { connectDB } from "@/lib/mongodb";
import Student from "@/models/Student";
import crypto from 'crypto';
import { sendVerificationEmail } from '@/lib/email';

const SPECIAL_CHARS = '!@#$%^&*(),.?{}';

export async function POST(request) {
  try {
    await connectDB();
    const { 
      firstName, 
      middleName, 
      lastName, 
      username, 
      email, 
      password, 
      preferredContactNumber,
      subjectsOfInterest
    } = await request.json();

    // Input validation
    if (!firstName || !lastName || !username || !email || !password || !preferredContactNumber || !subjectsOfInterest) {
      return Response.json(
        { message: "All required fields must be filled" },
        { status: 400 }
      );
    }

    // Validate username length
    if (username.length < 4) {
      return Response.json(
        { message: "Username must be at least 4 characters long" },
        { status: 400 }
      );
    }

    // Validate password requirements
    const passwordValidation = {
      length: password.length >= 10,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      special: new RegExp(`[${SPECIAL_CHARS}]`).test(password)
    };

    if (!Object.values(passwordValidation).every(Boolean)) {
      return Response.json(
        { 
          message: "Password must be at least 10 characters long and atleast one uppercase letter, one lowercase letter, and one special character" 
        },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingUsername = await Student.findOne({ username });
    if (existingUsername) {
      return Response.json(
        { message: "Username already taken" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingEmail = await Student.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return Response.json(
        { message: "Email already registered" },
        { status: 400 }
      );
    }

    // Validate subjects
    if (!Array.isArray(subjectsOfInterest) || subjectsOfInterest.length === 0 || subjectsOfInterest.length > 3) {
      return Response.json(
        { message: "Please select between 1 and 3 subjects" },
        { status: 400 }
      );
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create new student
    const student = new Student({
      firstName: firstName.trim(),
      middleName: middleName?.trim(),
      lastName: lastName.trim(),
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password,
      preferredContactNumber: preferredContactNumber.trim(),
      subjectsOfInterest,
      verificationToken,
      verificationTokenExpires,
      verified: false
    });

    await student.save();

    // Send verification email
    await sendVerificationEmail({
      email: student.email,
      token: verificationToken,
      name: `${student.firstName} ${student.lastName}`,
      role: 'student'
    });

    return Response.json({
      message: "Registration successful! Please check your email to verify your account."
    });
  } catch (error) {
    console.error('Signup error:', error);

    if (error.message === 'Failed to send verification email') {
      return Response.json(
        { message: "Account created but failed to send verification email. Please contact support." },
        { status: 500 }
      );
    }

    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return Response.json(
        { message: validationErrors.join(', ') },
        { status: 400 }
      );
    }

    return Response.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}