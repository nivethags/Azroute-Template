'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Move constants outside component to prevent re-creation
const PRESET_SUBJECTS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology',
  'Computer Science', 'English', 'History', 'Geography',
  'Economics', 'Business Studies', 'Art', 'Music',
  'Physical Education', 'Foreign Languages', 'Literature',
  'Other'
];

const SPECIAL_CHARS = '!@#$%^&*(),.?{}';

const INITIAL_FORM_STATE = {
  firstName: '',
  middleName: '',
  lastName: '',
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  preferredContactNumber: '',
  subjects: Array(3).fill({ type: '', customValue: '' })
};

export default function StudentSignup() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);

  // Prevent hydration issues by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const validatePassword = (password) => {
    if (!password) return false;
    const checks = {
      length: password.length >= 10,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      special: new RegExp(`[${SPECIAL_CHARS}]`).test(password)
    };
    return Object.values(checks).every(Boolean);
  };

  const getPasswordStrength = (password) => {
    if (!password) return {};
    return {
      length: password.length >= 10,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      special: new RegExp(`[${SPECIAL_CHARS}]`).test(password)
    };
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  const handleSubjectChange = (index, value) => {
    setFormData(prev => {
      const newSubjects = [...prev.subjects];
      newSubjects[index] = {
        type: value,
        customValue: value === 'Other' ? '' : value
      };
      return { ...prev, subjects: newSubjects };
    });
  };

  const handleCustomSubjectChange = (index, value) => {
    setFormData(prev => {
      const newSubjects = [...prev.subjects];
      newSubjects[index] = {
        ...newSubjects[index],
        customValue: value
      };
      return { ...prev, subjects: newSubjects };
    });
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) return 'First name is required';
    if (!formData.lastName.trim()) return 'Last name is required';
    if (!formData.username.trim()) return 'Username is required';
    if (formData.username.length < 4) return 'Username must be at least 4 characters';
    if (!formData.email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Invalid email address';
    if (!formData.password) return 'Password is required';
    if (!validatePassword(formData.password)) return 'Password does not meet requirements';
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
    if (!formData.preferredContactNumber.trim()) return 'Contact number is required';

    const validSubjects = formData.subjects.filter(subject => 
      (subject.type !== 'Other' && subject.type !== '') || 
      (subject.type === 'Other' && subject.customValue.trim() !== '')
    );

    if (validSubjects.length === 0) return 'Please select at least one subject';

    const invalidCustomSubject = formData.subjects.some(subject => 
      subject.type === 'Other' && subject.customValue.trim() === ''
    );

    if (invalidCustomSubject) return 'Please enter a value for custom subjects';

    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const processedSubjects = formData.subjects
        .filter(subject => subject.type !== '')
        .map(subject => subject.type === 'Other' ? subject.customValue.trim() : subject.type);

      const response = await fetch('/api/auth/student/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          middleName: formData.middleName.trim(),
          lastName: formData.lastName.trim(),
          username: formData.username.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          preferredContactNumber: formData.preferredContactNumber.trim(),
          subjectsOfInterest: processedSubjects
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      setSuccess(data.message);
      // Use Router.push instead of setTimeout
      router.push('/auth/student/login?success=' + encodeURIComponent(data.message));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return null; // Prevent hydration issues by not rendering until mounted
  }

  return (
    <div className="container mx-auto px-4 py-6 flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Create Student Account</CardTitle>
          <CardDescription className="text-center">
            Enter your details to create your student account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="bg-green-50 text-green-700 border-green-200">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name <span className="text-red-500">*</span></Label>
                <Input
                  name="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  placeholder="First Name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="middleName">Middle Name</Label>
                <Input
                  name="middleName"
                  value={formData.middleName}
                  onChange={(e) => handleChange('middleName', e.target.value)}
                  placeholder="Middle Name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name <span className="text-red-500">*</span></Label>
                <Input
                  name="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  placeholder="Last Name"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username <span className="text-red-500">*</span></Label>
              <Input
                name="username"
                value={formData.username}
                onChange={(e) => handleChange('username', e.target.value)}
                placeholder="Username (minimum 4 characters)"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="your.email@example.com"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
                <Input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="Enter password"
                  required
                />
                <div className="mt-2 p-2 bg-gray-50 rounded-md">
                  <p className="font-medium text-sm text-gray-700 mb-2">Password requirements:</p>
                  <div className="space-y-1 text-sm">
                    <div className={getPasswordStrength(formData.password).length ? 'text-green-600' : 'text-gray-600'}>
                      {getPasswordStrength(formData.password).length ? '✓' : '○'} At least 10 characters
                    </div>
                    <div className={getPasswordStrength(formData.password).uppercase ? 'text-green-600' : 'text-gray-600'}>
                      {getPasswordStrength(formData.password).uppercase ? '✓' : '○'} One uppercase letter
                    </div>
                    <div className={getPasswordStrength(formData.password).lowercase ? 'text-green-600' : 'text-gray-600'}>
                      {getPasswordStrength(formData.password).lowercase ? '✓' : '○'} One lowercase letter
                    </div>
                    <div className={getPasswordStrength(formData.password).special ? 'text-green-600' : 'text-gray-600'}>
                      {getPasswordStrength(formData.password).special ? '✓' : '○'} One special character 
                      <span className="text-gray-500 ml-1">({SPECIAL_CHARS})</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password <span className="text-red-500">*</span></Label>
                <Input
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  placeholder="Confirm password"
                  required
                />
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-sm text-red-500 mt-1">Passwords do not match</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferredContactNumber">
                Preferred Contact Number <span className="text-red-500">*</span>
              </Label>
              <Input
                name="preferredContactNumber"
                type="tel"
                value={formData.preferredContactNumber}
                onChange={(e) => handleChange('preferredContactNumber', e.target.value)}
                placeholder="Your contact number"
                required
              />
              <p className="text-sm text-gray-500">e.g. mobile, work or home number</p>
            </div>

            <div className="space-y-4">
              <Label>Subjects of Interest <span className="text-red-500">*</span></Label>
              <p className="text-sm text-gray-500">Select up to three subjects you want to study</p>
              
              {[0, 1, 2].map((index) => (
                <div key={index} className="space-y-2">
                  <Select
                    value={formData.subjects[index].type}
                    onValueChange={(value) => handleSubjectChange(index, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={`Select Subject ${index + 1}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {PRESET_SUBJECTS.map((subject) => (
                        <SelectItem
                          key={subject}
                          value={subject}
                          disabled={
                            subject !== 'Other' && 
                            formData.subjects.some(s => s.type === subject) && 
                            formData.subjects[index].type !== subject
                          }
                        >
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {formData.subjects[index].type === 'Other' && (
                    <Input
                      placeholder="Enter your subject"
                      value={formData.subjects[index].customValue}
                      onChange={(e) => handleCustomSubjectChange(index, e.target.value)}
                      className="mt-2"
                    />
                  )}
                </div>
              ))}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </Button>
            
            <div className="text-center text-sm">
              Already have an account?{' '}
              <Link
                href="/auth/student/login"
                className="text-blue-600 hover:underline"
              >
                Log in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}