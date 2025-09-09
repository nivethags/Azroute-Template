<<<<<<< HEAD
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
=======

// File: components/profile/ProfileEditForm.js
import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";

export default function ProfileEditForm({ user, onSubmit }) {
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    middleName: user.middleName,
    lastName: user.lastName,
    preferredContactNumber: user.preferredContactNumber,
    subjectsOfInterest: user.subjectsOfInterest,
    profile: {
      bio: user.profile?.bio||"",
      location: user.profile?.location||"",
      website: user.profile?.website||"",
      socialLinks: {
        linkedin: user.profile?.socialLinks?.linkedin||"",
        github: user.profile?.socialLinks?.github||"",
        twitter: user.profile?.socialLinks?.twitter||""
      }
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
  
    // Helper function to update nested keys
    const updateNestedField = (path, obj, value) => {
      const keys = path.split('.');
      const lastKey = keys.pop();
      let pointer = obj;
  
      keys.forEach(key => {
        if (!pointer[key]) pointer[key] = {}; // Create missing levels
        pointer = pointer[key];
      });
  
      pointer[lastKey] = value;
      return { ...obj }; // Return updated copy
    };
  
    setFormData(prev => {
      if (name.includes('.')) {
        return updateNestedField(name, { ...prev }, value);
      }
      return { ...prev, [name]: value };
    });
    console.log("formdata",formData)
  };
  

  const handleSubmit = (e) => {
    e.preventDefault();
    const validatedFormData = {
        ...formData,
        profile: {
          ...formData.profile,
          socialLinks: {
            linkedin: formData.profile.socialLinks.linkedin || "",
            github: formData.profile.socialLinks.github || "",
            twitter: formData.profile.socialLinks.twitter || ""
          }
        }
      };
    onSubmit(validatedFormData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="middleName">Middle Name</Label>
          <Input
            id="middleName"
            name="middleName"
            value={formData.middleName}
            onChange={handleChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="preferredContactNumber">Contact Number</Label>
          <Input
            id="preferredContactNumber"
            name="preferredContactNumber"
            value={formData.preferredContactNumber}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          name="profile.bio"
          value={formData.profile.bio}
          onChange={handleChange}
          rows={4}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            name="profile.location"
            value={formData.profile?.location}
            onChange={handleChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            name="profile.website"
            value={formData.profile.website}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Social Links</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="LinkedIn"
            name="profile.socialLinks.linkedin"
            value={formData.profile.socialLinks.linkedin}
            onChange={handleChange}
          />
          <Input
            placeholder="GitHub"
            name="profile.socialLinks.github"
            value={formData.profile.socialLinks.github}
            onChange={handleChange}
          />
          <Input
            placeholder="Twitter"
            name="profile.socialLinks.twitter"
            value={formData.profile.socialLinks.twitter}
            onChange={handleChange}
          />
        </div>
      </div>

      <Button type="submit" className="w-full">Save Changes</Button>
    </form>
>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa
  );
}
