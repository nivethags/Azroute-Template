'use client';

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import VoiceRecorder from "@/components/VoiceRecorder";

/* ---- Convert "my mail at gmail dot com" -> "mymail@gmail.com" ---- */
function normalizeEmailFromSpeech(raw = "") {
  let s = String(raw).toLowerCase().trim();

  s = s
    .replace(/\s*(at the rate|at)\s*/g, "@")
    .replace(/\s*(dot|point)\s*/g, ".")
    .replace(/\s*(underscore)\s*/g, "_")
    .replace(/\s*(dash|hyphen)\s*/g, "-")
    .replace(/\s*(plus)\s*/g, "+")
    .replace(/\s+/g, "");

  s = s
    .replace(/\.co m$/g, ".com")
    .replace(/g ?mail\.com$/g, "gmail.com");

  return s;
}

/* ---- Voice command matcher: "login", "log in", "please login", etc. ---- */
function isLoginCommand(text = "") {
  const t = String(text).toLowerCase().trim();
  // strip punctuation
  const cleaned = t.replace(/[.,!?]/g, "").replace(/\s+/g, " ");
  return (
    cleaned === "login" ||
    cleaned === "log in" ||
    cleaned === "please login" ||
    cleaned === "please log in" ||
    cleaned.endsWith(" login") || // e.g. "now login"
    cleaned.startsWith("login ") || // e.g. "login now"
    cleaned.includes(" log in")
  );
}

function ResendVerificationSection({ email, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [emailInput, setEmailInput] = useState(email || "");

  const handleResend = async () => {
    setLoading(true);
    setError("");

    try {
      if (!emailInput.trim()) {
        setError("Email is required");
        return;
      }

      const response = await fetch("/api/auth/student/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput.trim() })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to resend verification email");
      }

      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Alert className="mt-4 bg-green-50 text-green-700">
        <AlertDescription>
          If an account exists, a new verification email will be sent. Please check your inbox and spam folder.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <h3 className="text-sm font-medium mb-2">Haven't received the verification email?</h3>
      {error && (
        <Alert variant="destructive" className="mb-2">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="resendEmail">Email Address</Label>
          <Input
            id="resendEmail"
            type="email"
            required
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder="Enter your email address"
          />
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={handleResend}
            disabled={loading}
            variant="secondary"
            size="sm"
          >
            {loading ? "Sending..." : "Resend Verification Email"}
          </Button>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

function SuccessMessage({ message, email }) {
  const [showResend, setShowResend] = useState(false);
  const [timeoutReached, setTimeoutReached] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeoutReached(true);
    }, 30000);
    return () => clearTimeout(timer);
  }, []);

  if (!message) return null;

  return (
    <div className="space-y-2">
      <Alert className="mb-4 bg-green-50 text-green-700">
        <AlertDescription>{message}</AlertDescription>
      </Alert>

      {timeoutReached && !showResend && (
        <div className="text-center">
          <Button
            variant="link"
            className="text-sm text-blue-600"
            onClick={() => setShowResend(true)}
          >
            Click here if you haven't received the verification email
          </Button>
        </div>
      )}

      {showResend && (
        <ResendVerificationSection
          email={email}
          onClose={() => setShowResend(false)}
        />
      )}
    </div>
  );
}

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastUsedEmail, setLastUsedEmail] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  // shared login logic
  const doLogin = async () => {
    setError("");
    setLoading(true);
    setLastUsedEmail(formData.email);

    try {
      // simple presence checks
      if (!formData.email?.trim()) {
        throw new Error("Please enter your email");
      }
      if (!formData.password?.length) {
        // you want to type password manually due to case sensitivity
        throw new Error("Please enter your password (case-sensitive)");
      }

      const response = await fetch("/api/auth/student/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to log in");
      }

      router.push("/dashboard/student");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await doLogin();
  };

  // when voice near the submit hears "login", trigger submit
  const handleVoiceCommand = async (text) => {
    if (isLoginCommand(text)) {
      await doLogin();
    } else {
      // optional: surface what was heard (no-op by default)
      setError(`Heard: "${text}". Say "login" to submit.`);
      // auto-clear after a moment
      setTimeout(() => setError(""), 2500);
    }
  };

  return (
    <div className="space-y-4">
      <SuccessMessage
        message={searchParams.get("success")}
        email={searchParams.get("email") || lastUsedEmail}
      />

      {error === "Please verify your email first" && (
        <ResendVerificationSection
          email={formData.email}
          onClose={() => setError("")}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && error !== "Please verify your email first" && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Email + Voice */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="email">Email</Label>
            <span className="text-[10px] text-gray-500">
              say “your email id”
            </span>
          </div>
          <div className="flex gap-2">
            <Input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="flex-1"
              autoComplete="email"
            />
            <VoiceRecorder
              onResult={(text) =>
                setFormData(prev => ({
                  ...prev,
                  email: normalizeEmailFromSpeech(text),
                }))
              }
              buttonClassName="px-3 py-2 border rounded text-sm"
            />
          </div>
        </div>

        {/* Password (manual entry; no voice) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/auth/student/forgot-password"
              className="text-sm text-blue-600 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            required
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            autoComplete="current-password"
          />
        </div>

        {/* Submit + Voice Command */}
        <div className="flex items-center gap-2">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Logging in..." : "Log In"}
          </Button>
          {/* Small command mic: say "login" to submit */}
          <VoiceRecorder
            onResult={handleVoiceCommand}
            buttonClassName="px-3 py-2 border rounded text-sm"
          />
        </div>

        <div className="text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/auth/student/signup" className="text-blue-600 hover:underline">
            Sign up
          </Link>
        </div>
      </form>
    </div>
  );
}

function LoginForm() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[300px] flex items-center justify-center">
          <div className="animate-pulse text-gray-400">Loading...</div>
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}

export default function StudentLoginPage() {
  return (
    <div className="container mx-auto px-4 py-6 flex items-center justify-center min-h-[calc(100vh-5rem)]">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Student Login</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
