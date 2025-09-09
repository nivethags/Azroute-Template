<<<<<<< HEAD
"use client";

import { useState } from "react";
=======
import React, { useState } from 'react';
>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
<<<<<<< HEAD
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";

export default function ProfileEditForm({ user, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    Student_name: user?.Student_name || "",
    mobile: user?.mobile || "",
    bio: user?.bio || "",
    location: user?.location || "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
=======
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ProfileEditForm({ user, onUpdate, onCancel }) {
  const [formData, setFormData] = useState({
    name: user.name || '',
    profile: {
      bio: user.profile?.bio || '',
      location: user.profile?.location || '',
      website: user.profile?.website || '',
      socialLinks: {
        linkedin: user.profile?.socialLinks?.linkedin || '',
        github: user.profile?.socialLinks?.github || '',
        twitter: user.profile?.socialLinks?.twitter || ''
      }
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('socialLinks.')) {
      const socialNetwork = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          socialLinks: {
            ...prev.profile.socialLinks,
            [socialNetwork]: value
          }
        }
      }));
    } else if (name.startsWith('profile.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
<<<<<<< HEAD
    setError("");

    try {
      if (!formData.Student_name.trim()) throw new Error("Name is required");
      await onSubmit(formData);

      if (onCancel) onCancel();
    } catch (err) {
      setError(err.message || "Failed to update profile");
=======
    setError('');

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        throw new Error('Name is required');
      }

      // Validate website URL if provided
      if (formData.profile.website && !isValidURL(formData.profile.website)) {
        throw new Error('Please enter a valid website URL');
      }

      // Validate social links if provided
      const socialLinks = formData.profile.socialLinks;
      Object.entries(socialLinks).forEach(([platform, url]) => {
        if (url && !isValidURL(url)) {
          throw new Error(`Please enter a valid ${platform} URL`);
        }
      });

      await onUpdate(formData);
      onCancel(); // Close the form after successful update
    } catch (err) {
      setError(err.message || 'Failed to update profile');
>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
  return (
    <Card className="w-full max-w-xl mx-auto">
=======
  const isValidURL = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
<<<<<<< HEAD
        <CardContent className="space-y-4">
=======
        <CardContent className="space-y-6">
>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
<<<<<<< HEAD

          <div className="space-y-1">
            <label className="text-sm font-medium">Name *</label>
            <Input
              name="Student_name"
              value={formData.Student_name}
=======
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Name *</label>
            <Input
              name="name"
              value={formData.name}
>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa
              onChange={handleChange}
              placeholder="Your name"
              required
            />
          </div>

<<<<<<< HEAD
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
            <label className="text-sm font-medium">Bio</label>
            <Textarea
              name="bio"
              value={formData.bio}
=======
          <div className="space-y-2">
            <label className="text-sm font-medium">Bio</label>
            <Textarea
              name="profile.bio"
              value={formData.profile.bio}
>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa
              onChange={handleChange}
              placeholder="Tell us about yourself"
              rows={4}
            />
          </div>

<<<<<<< HEAD
          <div className="space-y-1">
            <label className="text-sm font-medium">Location</label>
            <Input
              name="location"
              value={formData.location}
=======
          <div className="space-y-2">
            <label className="text-sm font-medium">Location</label>
            <Input
              name="profile.location"
              value={formData.profile.location}
>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa
              onChange={handleChange}
              placeholder="Your location"
            />
          </div>
<<<<<<< HEAD
        </CardContent>

        <CardFooter className="flex justify-end space-x-2">
          <Button variant="outline" type="button" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
=======

          <div className="space-y-2">
            <label className="text-sm font-medium">Website</label>
            <Input
              name="profile.website"
              value={formData.profile.website}
              onChange={handleChange}
              placeholder="https://your-website.com"
              type="url"
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Social Links</h3>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">LinkedIn</label>
              <Input
                name="socialLinks.linkedin"
                value={formData.profile.socialLinks.linkedin}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/your-profile"
                type="url"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">GitHub</label>
              <Input
                name="socialLinks.github"
                value={formData.profile.socialLinks.github}
                onChange={handleChange}
                placeholder="https://github.com/your-username"
                type="url"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Twitter</label>
              <Input
                name="socialLinks.twitter"
                value={formData.profile.socialLinks.twitter}
                onChange={handleChange}
                placeholder="https://twitter.com/your-handle"
                type="url"
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa
            Save Changes
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa
