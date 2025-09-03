
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
  );
}
