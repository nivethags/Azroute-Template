// File: components/profile/ProfileImage.js
import { useState, useRef } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

export function ProfileImage({ user, onUpdate }) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null); // Reference to the file input

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      console.error('No file selected');
      return;
    }

    try {
      setUploading(true);

      // Create a reference to the storage path
      const storageRef = ref(storage, `avatars/${user.id}/${file.name}`);

      // Upload the file to Firebase Storage
      await uploadBytes(storageRef, file);

      // Get the download URL of the uploaded file
      const downloadURL = await getDownloadURL(storageRef);

      // Call the onUpdate callback with the new avatar URL
      await onUpdate({ profile: { avatar: downloadURL } });

      console.log('Image uploaded successfully:', downloadURL);
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploading(false);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="relative group">
      {/* Avatar display */}
      <Avatar className="h-24 w-24">
        <AvatarImage src={user.profile?.avatar || ''} alt={user.firstName || 'Avatar'} />
        <AvatarFallback>{user.initials || 'NA'}</AvatarFallback>
      </Avatar>

      {/* Upload button */}
      <Button
        variant="outline"
        size="icon"
        className="rounded-full absolute bottom-0 right-0"
        onClick={triggerFileInput}
        disabled={uploading}
      >
        {uploading ? '...' : '📷'}
      </Button>

      {/* Hidden file input */}
      <input
        type="file"
        className="hidden"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleImageUpload}
      />
    </div>
  );
}
