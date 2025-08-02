import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

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
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Name *</label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your name"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Bio</label>
            <Textarea
              name="profile.bio"
              value={formData.profile.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Location</label>
            <Input
              name="profile.location"
              value={formData.profile.location}
              onChange={handleChange}
              placeholder="Your location"
            />
          </div>

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
            Save Changes
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}