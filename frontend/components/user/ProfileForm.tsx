// e-commerce/frontend/components/user/ProfileForm.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, Camera, Save, X, Trash2, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ProfileData {
  id: string;
  email: string;
  role: string;
  fullName?: string | null;
  avatarUrl?: string | null;
  createdAt: string;
}

interface ProfileFormProps {
  initialData: ProfileData;
  onUpdate: (data: { fullName?: string; avatarUrl?: string }) => Promise<void>;
  onDelete: () => Promise<void>;
  isLoading?: boolean;
}

export default function ProfileForm({ 
  initialData, 
  onUpdate, 
  onDelete,
  isLoading = false 
}: ProfileFormProps) {
  const [formData, setFormData] = useState({
    fullName: initialData.fullName || "",
    avatarUrl: initialData.avatarUrl || "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form data ketika initialData berubah
  useEffect(() => {
    setFormData({
      fullName: initialData.fullName || "",
      avatarUrl: initialData.avatarUrl || "",
    });
    setPreviewImage(initialData.avatarUrl || null);
  }, [initialData]);

  const handleImageUpload = async (file: File) => {
    if (!file) return;
    
    // Validasi file
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    
    try {
      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setPreviewImage(previewUrl);

      // Upload to Cloudinary
      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;
      const uploadPreset = 'unsigned_products';
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);

      const response = await fetch(cloudinaryUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      
      // Update form data dengan URL dari Cloudinary
      setFormData(prev => ({
        ...prev,
        avatarUrl: data.secure_url,
      }));
      
      toast.success('Image uploaded successfully!');
      
      // Cleanup preview URL
      URL.revokeObjectURL(previewUrl);
      
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
      setPreviewImage(initialData.avatarUrl || null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleImageClick = () => {
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      avatarUrl: "",
    }));
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const updateData: { fullName?: string; avatarUrl?: string } = {};
      
      if (formData.fullName !== initialData.fullName) {
        updateData.fullName = formData.fullName;
      }
      
      if (formData.avatarUrl !== initialData.avatarUrl) {
        updateData.avatarUrl = formData.avatarUrl;
      }
      
      if (Object.keys(updateData).length > 0) {
        await onUpdate(updateData);
        setIsEditing(false);
      } else {
        toast.info("No changes made");
      }
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  const handleClearProfile = async () => {
    if (!window.confirm("Are you sure you want to clear your profile data? This will remove your name and profile picture.")) {
      return;
    }

    setIsDeleting(true);
    try {
      await onDelete();
      setPreviewImage(null);
      toast.success("Profile data cleared successfully");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to clear profile data");
    } finally {
      setIsDeleting(false);
    }
  };

  const getInitials = () => {
    if (initialData.fullName) {
      return initialData.fullName
        .split(" ")
        .map(name => name[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return initialData.email.charAt(0).toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar 
            className="h-24 w-24 border-4 border-white shadow-lg cursor-pointer hover:opacity-90 transition-opacity"
            onClick={handleImageClick}
          >
            {isUploading ? (
              <div className="flex items-center justify-center h-full w-full bg-gray-100">
                <Loader2 className="h-8 w-8 text-red-600 animate-spin" />
              </div>
            ) : (
              <>
                <AvatarImage 
                  src={previewImage || undefined} 
                  alt={formData.fullName || "Profile"} 
                />
                <AvatarFallback className="bg-red-600 text-white text-2xl">
                  {getInitials()}
                </AvatarFallback>
              </>
            )}
          </Avatar>
          
          {isEditing && (
            <>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0 border-2 border-white"
                onClick={handleImageClick}
                disabled={isUploading}
              >
                <Camera className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
        
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {initialData.fullName || "User"}
          </h2>
          <div className="flex items-center gap-2 text-gray-600 mt-1">
            <Mail className="w-4 h-4" />
            <span>{initialData.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
            <User className="w-3 h-3" />
            <span className="capitalize">{initialData.role}</span>
            <span>•</span>
            <span>Joined {new Date(initialData.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Form Fields */}
        <div className="space-y-4">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-gray-700">
              Full Name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                placeholder="Enter your full name"
                className="pl-10"
                disabled={!isEditing || isLoading}
              />
            </div>
            <p className="text-sm text-gray-500">
              Your name will be displayed on your profile and orders
            </p>
          </div>

          {/* Image Upload Section */}
          {isEditing && (
            <div className="space-y-2">
              <Label className="text-gray-700">
                Profile Picture
              </Label>
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="gap-2"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Upload Image
                    </>
                  )}
                </Button>
                
                {previewImage && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveImage}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Remove
                  </Button>
                )}
              </div>
              
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Upload a JPG, PNG, or GIF image (max 5MB)
                </p>
                {previewImage && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-600 mb-1">Preview:</p>
                    <div className="w-32 h-32 border border-gray-300 rounded-lg overflow-hidden">
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Email (Read-only) */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="email"
                value={initialData.email}
                className="pl-10 bg-gray-50"
                disabled
              />
            </div>
            <p className="text-sm text-gray-500">
              Email cannot be changed
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          {isEditing ? (
            <>
              <Button
                type="submit"
                className="flex-1 gap-2 bg-red-600 hover:bg-red-700"
                disabled={isLoading || isUploading}
              >
                <Save className="w-4 h-4" />
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    fullName: initialData.fullName || "",
                    avatarUrl: initialData.avatarUrl || "",
                  });
                  setPreviewImage(initialData.avatarUrl || null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                disabled={isLoading || isUploading}
              >
                <X className="w-4 h-4" />
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                className="flex-1 gap-2 bg-red-600 hover:bg-red-700"
                onClick={() => setIsEditing(true)}
              >
                <User className="w-4 h-4" />
                Edit Profile
              </Button>
              <Button
                type="button"
                variant="outline"
                className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleClearProfile}
                disabled={isDeleting}
              >
                <Trash2 className="w-4 h-4" />
                {isDeleting ? "Clearing..." : "Clear Profile"}
              </Button>
            </>
          )}
        </div>
      </form>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <h3 className="font-semibold text-blue-800 mb-2">Profile Information</h3>
        <p className="text-sm text-blue-700">
          Upload a profile picture to personalize your account. Images are stored securely on Cloudinary.
          The email address cannot be changed as it's used for authentication and order notifications.
        </p>
        <div className="mt-2 text-xs text-blue-600 space-y-1">
          <p>✓ Image formats: JPG, PNG, GIF</p>
          <p>✓ Maximum file size: 5MB</p>
          <p>✓ Recommended dimensions: 400x400 pixels</p>
        </div>
      </div>
    </div>
  );
}