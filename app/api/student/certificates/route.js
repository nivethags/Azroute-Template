// app/api/student/certificates/route.js
<<<<<<< HEAD
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { createClient } from "@supabase/supabase-js";
import PDFDocument from "pdfkit";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Authenticate student using JWT stored in cookies
=======

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import CourseEnrollment from "@/models/CourseEnrollment";
import Course from "@/models/Course";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import Student from "@/models/Student";

>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa
async function verifyAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token');

<<<<<<< HEAD
  if (!token) return null;

  try {
    const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
    const { data: student, error } = await supabase
      .from('Students')
      .select('id, student_name as name, email, mobile')
      .eq('id', decoded.userId)
      .single();

    if (error || !student) return null;

    return {
      id: student.id,
      name: student.name,
      email: student.email,
      mobile: student.mobile,
      role: 'student'
    };
  } catch (err) {
    console.error('Auth verification error:', err);
=======
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
    const student = await Student.findById(decoded.userId).select('-password');

    if (!student) {
      return null;
    }

    return {
      id: student._id.toString(),
      firstName: student.firstName,
      lastName: student.lastName,
      name: `${student.firstName} ${student.lastName}`,
      email: student.email,
      role: 'student'
    };
  } catch (error) {
    console.error('Auth verification error:', error);
>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa
    return null;
  }
}

<<<<<<< HEAD
// GET all completed certificates for the logged-in student
export async function GET() {
  try {
    const user = await verifyAuth();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: enrollments, error } = await supabase
      .from('CourseEnrollments')
      .select(`
        id,
        courseId (
          id, title, category, level, totalDuration,
          teacherId (id, firstName, lastName, department, qualification)
        ),
        completedAt,
        certificate
      `)
      .eq('studentId', user.id)
      .eq('status', 'completed')
      .is('certificate->>issued', true)
      .order('completedAt', { ascending: false });

    if (error) throw error;

    const certificates = enrollments.map(enrollment => ({
      id: enrollment.id,
      courseId: enrollment.courseId.id,
=======
export async function GET(request) {
  try {
    const user = await verifyAuth();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Get all completed enrollments with certificates
    const enrollments = await CourseEnrollment.find({
      studentId: user.id,
      status: 'completed',
      'certificate.issued': true
    })
    .populate({
      path: 'courseId',
      select: 'title category level totalDuration teacherId',
      populate: {
        path: 'teacherId',
        select: 'firstName lastName department qualification'
      }
    })
    .sort({ completedAt: -1 });

    // Format certificates data
    const certificates = enrollments.map(enrollment => ({
      id: enrollment._id,
      courseId: enrollment.courseId._id,
>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa
      courseTitle: enrollment.courseId.title,
      category: enrollment.courseId.category,
      level: enrollment.courseId.level,
      completedAt: enrollment.completedAt,
      issuedAt: enrollment.certificate.issuedAt,
      url: enrollment.certificate.url,
      metadata: {
<<<<<<< HEAD
        student: { name: user.name },
        teacher: enrollment.courseId.teacherId
          ? {
              name: `${enrollment.courseId.teacherId.firstName} ${enrollment.courseId.teacherId.lastName}`,
              department: enrollment.courseId.teacherId.department,
              qualification: enrollment.courseId.teacherId.qualification,
            }
          : null,
        courseDuration: enrollment.courseId.totalDuration,
        grade: enrollment.certificate.grade || 'Pass',
        certificateId: enrollment.certificate.id,
=======
        student: {
          name: user.name,
          firstName: user.firstName,
          lastName: user.lastName
        },
        teacher: enrollment.courseId.teacherId ? {
          name: `${enrollment.courseId.teacherId.firstName} ${enrollment.courseId.teacherId.lastName}`,
          department: enrollment.courseId.teacherId.department,
          qualification: enrollment.courseId.teacherId.qualification
        } : null,
        courseDuration: enrollment.courseId.totalDuration,
        grade: enrollment.finalGrade || 'Pass',
        certificateId: enrollment.certificate.id
>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa
      }
    }));

    return NextResponse.json({
      certificates,
      summary: {
        total: certificates.length,
        byCategory: certificates.reduce((acc, cert) => {
          acc[cert.category] = (acc[cert.category] || 0) + 1;
          return acc;
        }, {}),
        byLevel: certificates.reduce((acc, cert) => {
          acc[cert.level] = (acc[cert.level] || 0) + 1;
          return acc;
<<<<<<< HEAD
        }, {}),
=======
        }, {})
>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa
      }
    });

  } catch (error) {
    console.error('Error fetching certificates:', error);
<<<<<<< HEAD
    return NextResponse.json({ error: 'Failed to fetch certificates' }, { status: 500 });
  }
}

// POST to generate a certificate PDF
export async function POST(request) {
  try {
    const user = await verifyAuth();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { enrollmentId } = await request.json();

    const { data: enrollment, error } = await supabase
      .from('CourseEnrollments')
      .select(`
        id,
        courseId (
          id, title, category, level, totalDuration,
          teacherId (id, firstName, lastName, department, qualification)
        ),
        completedAt,
        certificate
      `)
      .eq('id', enrollmentId)
      .eq('studentId', user.id)
      .eq('status', 'completed')
      .single();

    if (error || !enrollment) {
      return NextResponse.json({ error: 'Enrollment not found or not completed' }, { status: 404 });
=======
    return NextResponse.json(
      { error: 'Failed to fetch certificates' },
      { status: 500 }
    );
  }
}

// Generate Certificate PDF endpoint
export async function POST(request) {
  try {
    const user = await verifyAuth();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { enrollmentId } = await request.json();

    await connectDB();

    const enrollment = await CourseEnrollment.findOne({
      _id: enrollmentId,
      studentId: user.id,
      status: 'completed'
    }).populate({
      path: 'courseId',
      populate: {
        path: 'teacherId',
        select: 'firstName lastName department qualification'
      }
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Enrollment not found or not completed' },
        { status: 404 }
      );
>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa
    }

    if (enrollment.certificate?.url) {
      return NextResponse.json({
        message: 'Certificate already exists',
        certificateUrl: enrollment.certificate.url
      });
    }

    // Generate unique certificate ID
    const certificateId = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

<<<<<<< HEAD
    const certificateData = {
      student: { name: user.name },
=======
    // Generate PDF certificate
    const certificateData = {
      student: {
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName
      },
>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa
      course: {
        title: enrollment.courseId.title,
        duration: `${Math.ceil(enrollment.courseId.totalDuration / 60)} hours`,
        category: enrollment.courseId.category,
        level: enrollment.courseId.level
      },
<<<<<<< HEAD
      teacher: enrollment.courseId.teacherId
        ? {
            name: `${enrollment.courseId.teacherId.firstName} ${enrollment.courseId.teacherId.lastName}`,
            department: enrollment.courseId.teacherId.department,
            qualification: enrollment.courseId.teacherId.qualification
          }
        : null,
      completionDate: enrollment.completedAt,
      certificateId
=======
      teacher: enrollment.courseId.teacherId ? {
        name: `${enrollment.courseId.teacherId.firstName} ${enrollment.courseId.teacherId.lastName}`,
        department: enrollment.courseId.teacherId.department,
        qualification: enrollment.courseId.teacherId.qualification
      } : null,
      completionDate: enrollment.completedAt,
      certificateId: certificateId
>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa
    };

    const pdfBuffer = await generateCertificatePDF(certificateData);

<<<<<<< HEAD
    // TODO: Upload PDF to Supabase Storage and get URL
    const certificateUrl = await uploadCertificatePDF(pdfBuffer, `certificates/${user.id}/${certificateId}.pdf`);

    // Update enrollment with certificate info
    const { error: updateError } = await supabase
      .from('CourseEnrollments')
      .update({
        certificate: {
          issued: true,
          issuedAt: new Date(),
          url: certificateUrl,
          id: certificateId
        }
      })
      .eq('id', enrollmentId);

    if (updateError) throw updateError;
=======
    // Upload to storage
    const certificateUrl = await uploadCertificatePDF(
      pdfBuffer,
      `certificates/${user.id}/${certificateId}.pdf`
    );

    // Update enrollment with certificate info
    enrollment.certificate = {
      issued: true,
      issuedAt: new Date(),
      url: certificateUrl,
      id: certificateId
    };

    await enrollment.save();
>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa

    return NextResponse.json({
      message: 'Certificate generated successfully',
      certificate: {
        id: certificateId,
        url: certificateUrl,
<<<<<<< HEAD
        issuedAt: new Date()
=======
        issuedAt: enrollment.certificate.issuedAt
>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa
      }
    });

  } catch (error) {
    console.error('Error generating certificate:', error);
<<<<<<< HEAD
    return NextResponse.json({ error: 'Failed to generate certificate' }, { status: 500 });
  }
}

// ---------------- PDF helpers ----------------
async function generateCertificatePDF(data) {
  const doc = new PDFDocument({ layout: 'landscape', size: 'A4' });
  const fonts = await loadCustomFonts();

  doc.font(fonts.title).fontSize(40).text('Certificate of Completion', { align: 'center' });
  doc.moveDown().font(fonts.body).fontSize(24).text('This is to certify that', { align: 'center' });
  doc.moveDown().font(fonts.name).fontSize(32).text(data.student.name, { align: 'center' });
  doc.moveDown().font(fonts.body).fontSize(24).text('has successfully completed the course', { align: 'center' });
  doc.moveDown().font(fonts.courseName).fontSize(28).text(data.course.title, { align: 'center' });
  doc.moveDown().font(fonts.details).fontSize(16)
    .text(`Course Duration: ${data.course.duration}`, { align: 'center' })
    .text(`Completed on: ${new Date(data.completionDate).toLocaleDateString()}`, { align: 'center' });

  if (data.teacher) {
    doc.moveDown()
      .text(`Instructor: ${data.teacher.name}`, { align: 'center' })
      .text(`Department: ${data.teacher.department}`, { align: 'center' })
      .text(`Qualification: ${data.teacher.qualification}`, { align: 'center' });
  }

  doc.moveDown().text(`Certificate ID: ${data.certificateId}`, { align: 'center' });

  await addCertificateElements(doc, { instructorSignature: true, platformLogo: true, verificationQR: true });
=======
    return NextResponse.json(
      { error: 'Failed to generate certificate' },
      { status: 500 }
    );
  }
}

async function generateCertificatePDF(data) {
  const PDFDocument = require('pdfkit');
  const doc = new PDFDocument({
    layout: 'landscape',
    size: 'A4'
  });

  // Load certificate template and fonts
  const template = await loadCertificateTemplate();
  const fonts = await loadCustomFonts();

  // Set up the document
  doc.font(fonts.title)
    .fontSize(40)
    .text('Certificate of Completion', {
      align: 'center'
    });

  doc.moveDown();
  doc.font(fonts.body)
    .fontSize(24)
    .text('This is to certify that', {
      align: 'center'
    });

  doc.moveDown();
  doc.font(fonts.name)
    .fontSize(32)
    .text(data.student.name, {
      align: 'center'
    });

  doc.moveDown();
  doc.font(fonts.body)
    .fontSize(24)
    .text('has successfully completed the course', {
      align: 'center'
    });

  doc.moveDown();
  doc.font(fonts.courseName)
    .fontSize(28)
    .text(data.course.title, {
      align: 'center'
    });

  doc.moveDown();
  doc.font(fonts.details)
    .fontSize(16)
    .text(`Course Duration: ${data.course.duration}`, {
      align: 'center'
    })
    .text(`Completed on: ${new Date(data.completionDate).toLocaleDateString()}`, {
      align: 'center'
    });

  if (data.teacher) {
    doc.moveDown()
      .text(`Instructor: ${data.teacher.name}`, {
        align: 'center'
      })
      .text(`Department: ${data.teacher.department}`, {
        align: 'center'
      })
      .text(`Qualification: ${data.teacher.qualification}`, {
        align: 'center'
      });
  }

  doc.moveDown()
    .text(`Certificate ID: ${data.certificateId}`, {
      align: 'center'
    });

  // Add signatures and logo
  await addCertificateElements(doc, {
    instructorSignature: true,
    platformLogo: true,
    verificationQR: true
  });
>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa

  return new Promise((resolve) => {
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.end();
  });
}

async function uploadCertificatePDF(buffer, path) {
<<<<<<< HEAD
  // Implement Supabase Storage upload here
=======
  // Implementation depends on your storage solution (Firebase, AWS S3, etc.)
  return null;
}

async function loadCertificateTemplate() {
  // Load certificate background template
>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa
  return null;
}

async function loadCustomFonts() {
<<<<<<< HEAD
=======
  // Load custom fonts for the certificate
>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa
  return {
    title: 'fonts/certificate-title.ttf',
    body: 'fonts/certificate-body.ttf',
    name: 'fonts/certificate-name.ttf',
    courseName: 'fonts/certificate-course.ttf',
    details: 'fonts/certificate-details.ttf'
  };
}

async function addCertificateElements(doc, options) {
<<<<<<< HEAD
  // Optional: add signatures, logos, QR codes
}
=======
  // Add various elements to the certificate
  if (options.instructorSignature) {
    // Add instructor signature
  }

  if (options.platformLogo) {
    // Add platform logo
  }

  if (options.verificationQR) {
    // Add QR code for certificate verification
  }
}
>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa
