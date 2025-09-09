'use client';

<<<<<<< HEAD
import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
=======
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
<<<<<<< HEAD
import { useAuth } from "@/context/AuthContext";

function LoginFormContent() {
  const router = useRouter();
  const { setStudent } = useAuth(); // ✅ add context setter
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ email: "", password: "" });
=======

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
    }, 30000); // Show resend option after 30 seconds

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
>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
<<<<<<< HEAD
=======
    setLastUsedEmail(formData.email);
>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa

    try {
      const response = await fetch("/api/auth/student/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
<<<<<<< HEAD
        body: JSON.stringify(formData),
=======
        body: JSON.stringify(formData)
>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa
      });

      const data = await response.json();

<<<<<<< HEAD
      if (!response.ok) throw new Error(data.message || "Failed to log in");

      // ✅ Update AuthContext
      setStudent(data.student);

      // Optional: save in localStorage
      localStorage.setItem("studentSession", JSON.stringify(data.student));
=======
      if (!response.ok) {
        throw new Error(data.message || "Failed to log in");
      }
>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa

      router.push("/dashboard/student");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
<<<<<<< HEAD
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
=======
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

>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
<<<<<<< HEAD
          <Label htmlFor="password">Password</Label>
=======
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/auth/student/forgot-password"
              className="text-sm text-blue-600 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa
          <Input
            id="password"
            type="password"
            required
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
          />
        </div>

<<<<<<< HEAD
        <Button type="submit" className="w-full" disabled={loading}>
=======
        <Button
          type="submit"
          className="w-full"
          disabled={loading}
        >
>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa
          {loading ? "Logging in..." : "Log In"}
        </Button>

        <div className="text-center text-sm">
          Don't have an account?{" "}
          <Link href="/auth/student/signup" className="text-blue-600 hover:underline">
            Sign up
          </Link>
        </div>
      </form>
    </div>
  );
}

<<<<<<< HEAD
export default function StudentLoginPage() {
  return (
    <div className="container mx-auto px-4 py-6 flex items-center justify-center min-h-[calc(100vh-5rem)]">
      <Card className="w-full max-w-md">
=======
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
>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Student Login</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
<<<<<<< HEAD
          <Suspense fallback={<div className="min-h-[200px] flex items-center justify-center">Loading...</div>}>
            <LoginFormContent />
          </Suspense>
=======
          <LoginForm />
>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa
        </CardContent>
      </Card>
    </div>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa
