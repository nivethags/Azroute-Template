// app/api/student/certificates/route.js

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import CourseEnrollment from "@/models/CourseEnrollment";
import Course from "@/models/Course";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import Student from "@/models/Student";

async function verifyAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token');

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
    return null;
  }
}

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
      courseTitle: enrollment.courseId.title,
      category: enrollment.courseId.category,
      level: enrollment.courseId.level,
      completedAt: enrollment.completedAt,
      issuedAt: enrollment.certificate.issuedAt,
      url: enrollment.certificate.url,
      metadata: {
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
        }, {})
      }
    });

  } catch (error) {
    console.error('Error fetching certificates:', error);
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
    }

    if (enrollment.certificate?.url) {
      return NextResponse.json({
        message: 'Certificate already exists',
        certificateUrl: enrollment.certificate.url
      });
    }

    // Generate unique certificate ID
    const certificateId = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Generate PDF certificate
    const certificateData = {
      student: {
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName
      },
      course: {
        title: enrollment.courseId.title,
        duration: `${Math.ceil(enrollment.courseId.totalDuration / 60)} hours`,
        category: enrollment.courseId.category,
        level: enrollment.courseId.level
      },
      teacher: enrollment.courseId.teacherId ? {
        name: `${enrollment.courseId.teacherId.firstName} ${enrollment.courseId.teacherId.lastName}`,
        department: enrollment.courseId.teacherId.department,
        qualification: enrollment.courseId.teacherId.qualification
      } : null,
      completionDate: enrollment.completedAt,
      certificateId: certificateId
    };

    const pdfBuffer = await generateCertificatePDF(certificateData);

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

    return NextResponse.json({
      message: 'Certificate generated successfully',
      certificate: {
        id: certificateId,
        url: certificateUrl,
        issuedAt: enrollment.certificate.issuedAt
      }
    });

  } catch (error) {
    console.error('Error generating certificate:', error);
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

  return new Promise((resolve) => {
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.end();
  });
}

async function uploadCertificatePDF(buffer, path) {
  // Implementation depends on your storage solution (Firebase, AWS S3, etc.)
  return null;
}

async function loadCertificateTemplate() {
  // Load certificate background template
  return null;
}

async function loadCustomFonts() {
  // Load custom fonts for the certificate
  return {
    title: 'fonts/certificate-title.ttf',
    body: 'fonts/certificate-body.ttf',
    name: 'fonts/certificate-name.ttf',
    courseName: 'fonts/certificate-course.ttf',
    details: 'fonts/certificate-details.ttf'
  };
}

async function addCertificateElements(doc, options) {
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