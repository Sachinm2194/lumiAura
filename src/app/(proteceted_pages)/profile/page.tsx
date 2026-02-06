"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PrimaryHeader } from "@/components/core-components/primary-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Edit2, 
  Save, 
  X, 
  ShoppingBag,
  Heart,
  Shield
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getProfile, updateProfile } from "@/app/api/profile";
import { toast } from "react-toastify";
import { handleApiError } from "@/lib/helpers/handleApiError";

interface ProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  avatar?: string;
}

// Validation functions
const validateFirstName = (firstName: string): string => {
  if (!firstName.trim()) {
    return "First name is required";
  }
  if (firstName.trim().length < 2) {
    return "First name must be at least 2 characters";
  }
  if (firstName.trim().length > 50) {
    return "First name must be no more than 50 characters";
  }
  if (!/^[a-zA-Z\s'-]+$/.test(firstName.trim())) {
    return "First name can only contain letters, spaces, hyphens, and apostrophes";
  }
  return "";
};

const validateLastName = (lastName: string): string => {
  if (lastName.trim() && lastName.trim().length < 1) {
    return "Last name must be at least 1 character";
  }
  if (lastName.trim() && lastName.trim().length > 50) {
    return "Last name must be no more than 50 characters";
  }
  if (lastName.trim() && !/^[a-zA-Z\s'-]+$/.test(lastName.trim())) {
    return "Last name can only contain letters, spaces, hyphens, and apostrophes";
  }
  return "";
};

const validatePhone = (phone: string): string => {
  if (phone.trim()) {
    const cleanedPhone = phone.replace(/[\s\-\(\)]/g, "");
    if (!/^\d+$/.test(cleanedPhone)) {
      return "Phone number can only contain digits, spaces, dashes, and parentheses";
    }
    if (cleanedPhone.length < 10) {
      return "Phone number must be at least 10 digits";
    }
    if (cleanedPhone.length > 15) {
      return "Phone number must be no more than 15 digits";
    }
  }
  return "";
};

const validatePassword = (password: string): string => {
  if (!password) {
    return "Password is required";
  }
  if (password.length < 8) {
    return "Password must be at least 8 characters";
  }
  if (password.length > 128) {
    return "Password must be no more than 128 characters";
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter";
  }
  if (!/[a-z]/.test(password)) {
    return "Password must contain at least one lowercase letter";
  }
  if (!/[0-9]/.test(password)) {
    return "Password must contain at least one number";
  }
  return "";
};

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");
  const [profileData, setProfileData] = useState<ProfileData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const data = await getProfile();
        setProfileData(data);
        setFormData({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          phone: data.phone || "",
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  // Handle form input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors = {
      firstName: validateFirstName(formData.firstName),
      lastName: validateLastName(formData.lastName),
      phone: validatePhone(formData.phone),
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };
    setErrors(newErrors);
    return !newErrors.firstName && !newErrors.lastName && !newErrors.phone;
  };

  // Handle save profile
  const handleSaveProfile = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors before saving");
      return;
    }

    setIsSaving(true);
    try {
      const updatedData = await updateProfile({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
      });
      
      setProfileData(updatedData);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setFormData({
      firstName: profileData.firstName || "",
      lastName: profileData.lastName || "",
      phone: profileData.phone || "",
    });
    setErrors({
      firstName: "",
      lastName: "",
      phone: "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setIsEditing(false);
  };

  // Handle password change
  const handlePasswordChange = async () => {
    // Validate passwords
    const newErrors = {
      firstName: "",
      lastName: "",
      phone: "",
      currentPassword: passwordData.currentPassword ? "" : "Current password is required",
      newPassword: validatePassword(passwordData.newPassword),
      confirmPassword: passwordData.newPassword !== passwordData.confirmPassword ? "Passwords do not match" : "",
    };

    if (newErrors.newPassword || newErrors.confirmPassword || newErrors.currentPassword) {
      setErrors(newErrors);
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      
      setIsPasswordDialogOpen(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      toast.success("Password changed successfully!");
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsSaving(false);
    }
  };

  // Get user initials for avatar
  const getInitials = () => {
    const first = profileData.firstName?.charAt(0) || user?.email?.charAt(0) || "U";
    const last = profileData.lastName?.charAt(0) || "";
    return (first + last).toUpperCase();
  };

  // Get full name
  const getFullName = () => {
    if (profileData.firstName || profileData.lastName) {
      return `${profileData.firstName || ""} ${profileData.lastName || ""}`.trim();
    }
    return user?.email?.split("@")[0] || "User";
  };

  if (isLoading) {
    return (
      <>
        <PrimaryHeader menuActive={menuOpen} onMenuToggle={() => setMenuOpen((v) => !v)} />
        <div className="min-h-screen pt-16 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
      <PrimaryHeader menuActive={menuOpen} onMenuToggle={() => setMenuOpen((v) => !v)} />
      
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/8 pt-4 pb-24 md:pt-6 md:pb-12">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-primary/10 to-accent/5 blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-br from-accent/10 to-primary/5 blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
        </div>

        <div className="container mx-auto  max-w-6xl">
          {/* Profile Header */}
          <Card className="mb-4 md:mb-6 border-primary/20 shadow-lg animate-fade-in-up">
            <CardContent className="pt-4 pb-4 md:pt-6 md:pb-6 px-4 md:px-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 md:gap-6">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <Avatar className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 border-3 md:border-4 border-primary/20 shadow-lg">
                    <AvatarImage src={profileData.avatar} alt={getFullName()} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xl sm:text-2xl md:text-3xl font-bold">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* User Info */}
                <div className="flex-1 text-center sm:text-left min-w-0">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2 break-words">
                    {getFullName()}
                  </h1>
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 text-sm sm:text-base text-muted-foreground">
                    <div className="flex items-center gap-2 min-w-0">
                      <Mail className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{user?.email || profileData.email}</span>
                    </div>
                    {profileData.phone && (
                      <div className="flex items-center gap-2 min-w-0">
                        <Phone className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{profileData.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    onClick={() => router.push("/orders")}
                    className="flex-1 sm:flex-none sm:w-auto text-sm"
                    size="sm"
                  >
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">My Orders</span>
                    <span className="sm:hidden">Orders</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/wishlist")}
                    className="flex-1 sm:flex-none sm:w-auto text-sm"
                    size="sm"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Wishlist
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <div className="flex gap-1 sm:gap-2 mb-4 md:mb-6 border-b border-border overflow-x-auto scrollbar-thin-custom">
            <button
              onClick={() => setActiveTab("profile")}
              className={`px-3 sm:px-6 py-2 sm:py-3 font-medium transition-colors border-b-2 whitespace-nowrap text-sm sm:text-base ${
                activeTab === "profile"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <User className="w-4 h-4 inline mr-1 sm:mr-2" />
              <span className="hidden xs:inline">Personal Information</span>
              <span className="xs:hidden">Profile</span>
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`px-3 sm:px-6 py-2 sm:py-3 font-medium transition-colors border-b-2 whitespace-nowrap text-sm sm:text-base ${
                activeTab === "security"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Shield className="w-4 h-4 inline mr-1 sm:mr-2" />
              Security
            </button>
          </div>

          {/* Tab Content */}
          <div className="animate-fade-in-up">
            {activeTab === "profile" && (
              <Card className="border-border shadow-md">
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 md:px-6 pt-4 md:pt-6">
                  <div>
                    <CardTitle className="text-lg sm:text-xl">Personal Information</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">Update your personal details and contact information</CardDescription>
                  </div>
                  {!isEditing && (
                    <Button onClick={() => setIsEditing(true)} variant="outline" size="sm" className="w-full sm:w-auto">
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="px-4 md:px-6 pb-4 md:pb-6">
                  {isEditing ? (
                    <div className="space-y-4 sm:space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="firstName" className="text-sm">First Name *</Label>
                          <Input
                            id="firstName"
                            value={formData.firstName}
                            onChange={(e) => handleInputChange("firstName", e.target.value)}
                            className={errors.firstName ? "border-destructive" : ""}
                          />
                          {errors.firstName && (
                            <p className="text-xs text-destructive">{errors.firstName}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="lastName" className="text-sm">Last Name</Label>
                          <Input
                            id="lastName"
                            value={formData.lastName}
                            onChange={(e) => handleInputChange("lastName", e.target.value)}
                            className={errors.lastName ? "border-destructive" : ""}
                          />
                          {errors.lastName && (
                            <p className="text-xs text-destructive">{errors.lastName}</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={user?.email || ""}
                          disabled
                          className="bg-muted text-sm"
                        />
                        <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          placeholder="+1 (555) 000-0000"
                          className={errors.phone ? "border-destructive" : ""}
                        />
                        {errors.phone && (
                          <p className="text-xs text-destructive">{errors.phone}</p>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 pt-2 sm:pt-4">
                        <Button
                          onClick={handleSaveProfile}
                          disabled={isSaving}
                          className="flex-1 sm:flex-none order-2 sm:order-1"
                          size="sm"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          {isSaving ? "Saving..." : "Save Changes"}
                        </Button>
                        <Button
                          onClick={handleCancelEdit}
                          variant="outline"
                          disabled={isSaving}
                          className="flex-1 sm:flex-none order-1 sm:order-2"
                          size="sm"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 sm:space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div>
                          <Label className="text-muted-foreground text-xs sm:text-sm">First Name</Label>
                          <p className="text-base sm:text-lg font-medium mt-1">
                            {profileData.firstName || "Not set"}
                          </p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground text-xs sm:text-sm">Last Name</Label>
                          <p className="text-base sm:text-lg font-medium mt-1">
                            {profileData.lastName || "Not set"}
                          </p>
                        </div>
                      </div>
                      <div>
                        <Label className="text-muted-foreground text-xs sm:text-sm">Email</Label>
                        <p className="text-base sm:text-lg font-medium mt-1 break-words">{user?.email}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground text-xs sm:text-sm">Phone Number</Label>
                        <p className="text-base sm:text-lg font-medium mt-1">
                          {profileData.phone || "Not set"}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === "security" && (
              <Card className="border-border shadow-md">
                <CardHeader className="px-4 md:px-6 pt-4 md:pt-6">
                  <CardTitle className="text-lg sm:text-xl">Security Settings</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Manage your password and security preferences</CardDescription>
                </CardHeader>
                <CardContent className="px-4 md:px-6 pb-4 md:pb-6">
                  <div className="p-4 sm:p-6 bg-muted/50 rounded-lg border border-border">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2 text-sm sm:text-base">
                          <Lock className="w-5 h-5 text-primary flex-shrink-0" />
                          Password
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                          Change your password to keep your account secure
                        </p>
                      </div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="inline-block">
                            <Button 
                              onClick={() => toast.info("Coming soon!")} 
                              className="w-full sm:w-auto"
                              size="sm"
                              disabled
                            >
                              Change Password
                            </Button>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="z-50">
                          <p>Coming soon</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Password Change Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="w-[95vw] max-w-md mx-4">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Change Password</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Enter your current password and choose a new one
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-sm">Current Password *</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => {
                  setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }));
                  if (errors.currentPassword) {
                    setErrors((prev) => ({ ...prev, currentPassword: "" }));
                  }
                }}
                className={errors.currentPassword ? "border-destructive" : ""}
              />
              {errors.currentPassword && (
                <p className="text-xs text-destructive">{errors.currentPassword}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-sm">New Password *</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => {
                  setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }));
                  if (errors.newPassword) {
                    setErrors((prev) => ({ ...prev, newPassword: "" }));
                  }
                  // Re-validate confirm password if it's been entered
                  if (passwordData.confirmPassword) {
                    setErrors((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value !== passwordData.confirmPassword ? "Passwords do not match" : "",
                    }));
                  }
                }}
                className={errors.newPassword ? "border-destructive" : ""}
              />
              {errors.newPassword && (
                <p className="text-xs text-destructive">{errors.newPassword}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm">Confirm New Password *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => {
                  setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }));
                  setErrors((prev) => ({
                    ...prev,
                    confirmPassword: e.target.value !== passwordData.newPassword ? "Passwords do not match" : "",
                  }));
                }}
                className={errors.confirmPassword ? "border-destructive" : ""}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-destructive">{errors.confirmPassword}</p>
              )}
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsPasswordDialogOpen(false)}
              className="w-full sm:w-auto order-2 sm:order-1"
              size="sm"
            >
              Cancel
            </Button>
            <Button 
              onClick={handlePasswordChange} 
              disabled={isSaving}
              className="w-full sm:w-auto order-1 sm:order-2"
              size="sm"
            >
              {isSaving ? "Changing..." : "Change Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
