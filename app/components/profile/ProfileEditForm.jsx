"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";

export default function ProfileEditForm({ user, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    Student_name: user.Student_name || "",
     email: user.email || "",
    mobile: user.mobile || "",
    bio: user.bio || "",
    location: user.location || "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (!formData.Student_name.trim()) throw new Error("Name is required");

      await onSubmit(formData);

      setSuccess("Profile updated successfully ✅");
      if (onCancel) onCancel(); // optional close
    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-100 text-green-800 border-green-300">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-1">
            <label className="text-sm font-medium">Name *</label>
            <Input
              name="Student_name"
              value={formData.Student_name}
              onChange={handleChange}
              placeholder="Your name"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Email *</label>
            <Input
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Your mail"
              
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Contact Number</label>
            <Input
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              placeholder="Your mobile number"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Bio *</label>
            <Textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself"
              rows={4}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Location *</label>
            <Input
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Your location"
              required
            />
          </div>
        </CardContent>

        <CardFooter className="flex justify-end space-x-2">
          <Button variant="outline" type="button" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
