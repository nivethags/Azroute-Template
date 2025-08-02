// components/profile/EditAboutDialog.jsx
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
  } from "../ui/dialog";
  import { Button } from "../ui/button";
  import { Input } from "../ui/input";
  import { Textarea } from "../ui/textarea";
  import { Label } from "../ui/label";
  
  export function EditAboutDialog({ user, open, onOpenChange }) {
    const onSubmit = (e) => {
      e.preventDefault();
      // Handle form submission
      onOpenChange(false);
    };
  
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your profile information
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="grid w-full gap-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  defaultValue={user.bio}
                  placeholder="Tell us about yourself..."
                  className="min-h-[100px]"
                />
              </div>
              <div className="grid w-full gap-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  defaultValue={user.location}
                  placeholder="City, Country"
                />
              </div>
              <div className="grid w-full gap-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  defaultValue={user.website}
                  placeholder="https://example.com"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  }