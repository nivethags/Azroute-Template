'use client';

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import VoiceRecorder from '@/components/VoiceRecorder';

/* ---------------- Email cleanup ("at"->@, "dot"->.) ---------------- */
function normalizeEmailFromSpeech(raw = '') {
  let s = String(raw).trim();
  s = s.replace(/\bat the rate\b/gi, '@')
       .replace(/\bat\b/gi, '@')
       .replace(/\bdot\b/gi, '.')
       .replace(/\bpoint\b/gi, '.')
       .replace(/\bunderscore\b/gi, '_')
       .replace(/\bdash\b/gi, '-')
       .replace(/\bhyphen\b/gi, '-')
       .replace(/\bplus\b/gi, '+')
       .replace(/\s+/g, '');
  s = s.replace(/\.co m$/i, '.com').replace(/g ?mail\.com$/i, 'gmail.com');
  return s;
}

/* ---------------- Voice command: register/submit (kept) ---------------- */
function isRegisterCommand(text = '') {
  const t = String(text).toLowerCase().trim().replace(/[.,!?]/g, ' ').replace(/\s+/g, ' ');
  return t.includes('register') || t.includes('sign up') || t.includes('signup') || t.includes('create account');
}

/* ---------------- Helpers: English-only filter ---------------- */
function keepEnglishOnly(str) {
  // English letters, digits, spaces, and basic symbols for emails/names
  return String(str || '').replace(/[^A-Za-z0-9@._+\-\s'’\.]/g, '').trim();
}

/* ---------------- Digit words → digits ---------------- */
const DIGIT_WORDS = {
  zero: '0', one: '1', two: '2', three: '3', four: '4',
  five: '5', six: '6', seven: '7', eight: '8', nine: '9',
  'oh': '0', 'o': '0'
};
function wordsToDigits(str) {
  return str.replace(/\b(zero|one|two|three|four|five|six|seven|eight|nine|oh|o)\b/gi, (m) => {
    return DIGIT_WORDS[m.toLowerCase()] ?? m;
  });
}

/* ---------------- Extractors (English-only) ---------------- */
function extractEmail(text) {
  const normalized = keepEnglishOnly(normalizeEmailFromSpeech(text));
  const match = normalized.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return match ? match[0] : '';
}

function extractMobile(text) {
  const withDigits = wordsToDigits(keepEnglishOnly(text));
  const justDigits = withDigits.replace(/\D+/g, '');
  if (justDigits.length >= 10) return justDigits.slice(-10);
  return '';
}

// Name: prefer phrases like “my name is … / I am … / this is … / call me …”
// else take everything before “email|mobile|phone”, English only.
function extractName(text) {
  const t = String(text || '').trim();

  const direct = t.match(/\b(?:my name is|name is|this is|i am|i'm|call me)\s+([A-Za-z][A-Za-z.'\-]*(?:\s+[A-Za-z][A-Za-z.'\-]*){0,4})/i);
  if (direct && direct[1]) {
    return keepEnglishOnly(direct[1]);
  }

  const beforeContact = t.split(/\b(email|mail|mobile|phone)\b/i)[0] || '';
  let cleaned = beforeContact
    .replace(/\b(my name is|name is|this is|i am|i'm|call me)\b/gi, ' ')
    .replace(/\b(register|sign up|signup|create account)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned || /@/.test(cleaned)) return '';
  return keepEnglishOnly(cleaned);
}

/* ---------------- The page ---------------- */
export default function StudentSignup() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    mobile: ''
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) return 'Name is required';
    if (!formData.email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Invalid email';
    if (!formData.password) return 'Password is required';
    if (formData.password.length < 6) return 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
    if (!formData.mobile.trim()) return 'Mobile number is required';
    if (!/^\d{10}$/.test(formData.mobile)) return 'Enter a valid 10-digit mobile';
    return '';
  };

  const doRegister = async () => {
    const validationError = validateForm();
    if (validationError) { setError(validationError); return; }

    setLoading(true); setError(''); setSuccess('');
    try {
      const response = await fetch('/api/auth/student/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          mobile: formData.mobile.trim()
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Something went wrong');

      setSuccess(data.message || 'Account created. Please verify your email.');
      const params = new URLSearchParams({
        success: data.message || 'Account created. Please verify your email.',
        email: formData.email
      });
      router.push('/auth/student/login?' + params.toString());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => { e.preventDefault(); await doRegister(); };

  /* ------------ Guided Voice Capture (step-by-step) ------------ */
  const [voiceStep, setVoiceStep] = useState('name'); // 'name' | 'email' | 'mobile' | 'done'
  const [voiceHint, setVoiceHint] = useState('Tap mic and speak your name');
  const [lastHeard, setLastHeard] = useState('');

  const onGuidedVoice = (text) => {
    const heard = String(text || '').trim();
    setLastHeard(heard);

    if (voiceStep === 'name') {
      const name = extractName(heard);
      if (name) {
        setFormData(p => ({ ...p, name }));
        setVoiceStep('email');
        setVoiceHint('Great! Now speak your email');
      } else {
        setError('Could not catch your name. Please tap mic and try again, e.g., "My name is John Doe".');
        setTimeout(() => setError(''), 2500);
      }
      return;
    }

    if (voiceStep === 'email') {
      const email = extractEmail(heard);
      if (email) {
        setFormData(p => ({ ...p, email }));
        setVoiceStep('mobile');
        setVoiceHint('Nice! Now speak your mobile number');
      } else {
        setError('Could not catch your email. Try: "john dot doe at gmail dot com".');
        setTimeout(() => setError(''), 2500);
      }
      return;
    }

    if (voiceStep === 'mobile') {
      const mobile = extractMobile(heard);
      if (mobile) {
        setFormData(p => ({ ...p, mobile }));
        setVoiceStep('done');
        setVoiceHint('All set! Type your password and submit.');
      } else {
        setError('Could not catch your mobile. Try saying digits clearly: "nine eight seven six five four three two one zero".');
        setTimeout(() => setError(''), 2500);
      }
      return;
    }
  };

  const resetGuided = () => {
    setVoiceStep('name');
    setVoiceHint('Tap mic and speak your name');
    setLastHeard('');
  };

  return (
    <div className="container mx-auto px-4 py-6 flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Create Student Account</CardTitle>
          <CardDescription className="text-center">
            Guided voice: Name → Email → Mobile. Password is typed manually.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>
            )}
            {success && (
              <Alert className="bg-green-50 text-green-700 border-green-200">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            {/* Guided voice block */}
            <div className="p-3 rounded border bg-gray-50 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-medium">{voiceHint}</span>
                {lastHeard ? (
                  <span className="text-xs text-gray-600 mt-1">Heard: “{lastHeard}”</span>
                ) : null}
                {voiceStep === 'done' && (
                  <button type="button" onClick={resetGuided} className="text-xs text-blue-600 mt-1 underline">
                    Start again
                  </button>
                )}
              </div>
              <VoiceRecorder
                onResult={onGuidedVoice}
                buttonClassName="px-3 py-2 border rounded text-sm"
              />
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', keepEnglishOnly(e.target.value))}
                placeholder="Full Name"
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="email@example.com"
                required
                autoComplete="email"
              />
            </div>

            {/* Mobile */}
            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Number</Label>
              <Input
                id="mobile"
                type="tel"
                value={formData.mobile}
                onChange={(e) => handleChange('mobile', e.target.value.replace(/\D+/g, '').slice(0, 10))}
                placeholder="10-digit mobile"
                required
              />
            </div>

            {/* Passwords (manual entry; case-sensitive) */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder="Enter password"
                required
                autoComplete="new-password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                placeholder="Confirm password"
                required
                autoComplete="new-password"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </Button>

            <div className="text-center text-sm">
              Already have an account?{' '}
              <Link href="/auth/student/login" className="text-blue-600 hover:underline">
                Log in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

/* Optional Suspense wrapper */
export function StudentSignupPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-gray-400">Loading…</div>}>
      <StudentSignup />
    </Suspense>
  );
}
