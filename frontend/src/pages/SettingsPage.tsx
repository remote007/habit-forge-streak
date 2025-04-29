import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input'; // Assuming you have an Input component
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ThemeStyle } from '@/contexts/ThemeContext';
import api from '@/utils/api'; // Assuming you have an api instance

const SettingsPage = () => {
  const { user, logout } = useAuth();
  const { themeMode, themeStyle, toggleThemeMode, setThemeStyle } = useTheme();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleDeleteProfile = async () => {
    // In a real app, we would make an API call here
    setIsDeleting(true);
    try {
      // Call API to delete user
      await api.delete(`/users/profile`);
      
      // Log out the user
      logout();
      navigate('/register');
    } catch (error) {
      console.error('Error deleting profile:', error);
    }
    setIsDeleting(false);
  };

  const handleThemeChange = (value: ThemeStyle) => {
    setThemeStyle(value);
  };

  const updateProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsUpdating(true);
    setUpdateMessage(null);
    
    // Get form data directly from the form elements
    const form = event.currentTarget;
    const emailInput = form.querySelector('#email') as HTMLInputElement;
    const currentPasswordInput = form.querySelector('#current-password') as HTMLInputElement;
    const newPasswordInput = form.querySelector('#new-password') as HTMLInputElement;
    const confirmPasswordInput = form.querySelector('#confirm-password') as HTMLInputElement;
    
    const email = emailInput?.value;
    const currentPassword = currentPasswordInput?.value;
    const newPassword = newPasswordInput?.value;
    const confirmPassword = confirmPasswordInput?.value;

    // Validate form data
    if (newPassword && !currentPassword) {
      setUpdateMessage({ 
        type: 'error', 
        text: 'Current password is required to change password' 
      });
      setIsUpdating(false);
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setUpdateMessage({ 
        type: 'error', 
        text: 'New passwords do not match' 
      });
      setIsUpdating(false);
      return;
    }

    // Call API to update user profile
    try {
      console.log('Sending profile update request:', {
        email,
        hasCurrentPassword: !!currentPassword,
        hasNewPassword: !!newPassword
      });
      
      // Log the actual data being sent to help debug
      console.log('Request payload:', {
        email,
        currentPassword,
        newPassword: newPassword || undefined
      });
      
      // Create request data object, only including fields with values
      const requestData: any = { email };
      
      if (currentPassword) {
        requestData.currentPassword = currentPassword;
      }
      
      if (newPassword) {
        requestData.newPassword = newPassword;
      }
      
      console.log('Sending data to server:', requestData);
      
      const response = await api.patch(`/users/profile`, requestData);
      
      console.log('Profile update response:', response.data);
      
      // Update local storage with new user data
      if (response.data) {
        const updatedUser = {
          ...user,
          email: response.data.email
        };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      }
      
      // Show success message
      setUpdateMessage({ 
        type: 'success', 
        text: 'Profile updated successfully' 
      });
      
      // Clear password fields - only if form is still available
      // Using optional chaining to prevent null reference errors
      event.currentTarget?.reset?.();
      
      // Set email field value if form is still available
      const form = event.currentTarget as HTMLFormElement;
      if (form) {
        const emailInput = form.elements.namedItem('email');
        if (emailInput && emailInput instanceof HTMLInputElement) {
          emailInput.value = email;
        }
      }
      
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setUpdateMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update profile' 
      });
    }
    
    setIsUpdating(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FDF6EC] dark:bg-gray-900">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile">
              <Card className="border-custom-jet-black">
                <CardHeader>
                  <CardTitle className="text-2xl text-custom-jet-black dark:text-custom-muted-mint">Profile Settings</CardTitle>
                  <CardDescription className="text-custom-jet-black/80 dark:text-custom-muted-mint/80">
                    Manage your account settings and profile preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form className="space-y-4" onSubmit={updateProfile}>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-custom-jet-black dark:text-custom-muted-mint">Email</Label>
                      <Input 
                        id="email" 
                        name="email"
                        type="email" 
                        defaultValue={user?.email}
                        className="border-custom-jet-black"
                        placeholder="your@email.com"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="current-password" className="text-custom-jet-black dark:text-custom-muted-mint">Current Password</Label>
                      <Input 
                        id="current-password" 
                        name="current-password"
                        type="password" 
                        className="border-custom-jet-black"
                        placeholder="Enter your current password"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="new-password" className="text-custom-jet-black dark:text-custom-muted-mint">New Password</Label>
                      <Input 
                        id="new-password" 
                        name="new-password"
                        type="password" 
                        className="border-custom-jet-black"
                        placeholder="Enter a new password"
                        minLength={6}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password" className="text-custom-jet-black dark:text-custom-muted-mint">Confirm New Password</Label>
                      <Input 
                        id="confirm-password" 
                        name="confirm-password"
                        type="password" 
                        className="border-custom-jet-black"
                        placeholder="Confirm your new password"
                        minLength={6}
                      />
                    </div>
                    
                    {updateMessage && (
                      <div className={`text-${updateMessage.type === 'success' ? 'green' : 'red'}-500`}>
                        {updateMessage.text}
                      </div>
                    )}
                    
                    <Button type="submit" className="w-full" disabled={isUpdating}>
                      {isUpdating ? 'Updating...' : 'Update Profile'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="appearance">
              <Card className="border-custom-jet-black">
                <CardHeader>
                  <CardTitle className="text-2xl text-custom-jet-black dark:text-custom-muted-mint">Appearance</CardTitle>
                  <CardDescription className="text-custom-jet-black/80 dark:text-custom-muted-mint/80">
                    Customize the look and feel of the application
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-custom-jet-black dark:text-custom-muted-mint">Theme Style</h3>
                    <RadioGroup defaultValue={themeStyle} onValueChange={handleThemeChange} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <RadioGroupItem value="default" id="default" className="peer sr-only" />
                        <Label
                          htmlFor="default"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-custom-jet-black bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          <span className="text-lg font-semibold">Default</span>
                          <span className="text-sm text-muted-foreground">Original Habit Forge style</span>
                        </Label>
                      </div>
                      
                      <div>
                        <RadioGroupItem value="modern-newspaper" id="modern-newspaper" className="peer sr-only" />
                        <Label
                          htmlFor="modern-newspaper"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-custom-jet-black bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          <span className="text-lg font-semibold">Modern Newspaper</span>
                          <span className="text-sm text-muted-foreground">Black, white, serif fonts</span>
                        </Label>
                      </div>
                      
                      <div>
                        <RadioGroupItem value="funky-retro" id="funky-retro" className="peer sr-only" />
                        <Label
                          htmlFor="funky-retro"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-custom-jet-black bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          <span className="text-lg font-semibold">Funky Retro</span>
                          <span className="text-sm text-muted-foreground">Burnt orange, mustard, avocado</span>
                        </Label>
                      </div>
                      
                      <div>
                        <RadioGroupItem value="indie-zine" id="indie-zine" className="peer sr-only" />
                        <Label
                          htmlFor="indie-zine"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-custom-jet-black bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          <span className="text-lg font-semibold">Indie Zine</span>
                          <span className="text-sm text-muted-foreground">Black, white, neon pink & green</span>
                        </Label>
                      </div>
                      
                      <div>
                        <RadioGroupItem value="editorial-funk" id="editorial-funk" className="peer sr-only" />
                        <Label
                          htmlFor="editorial-funk"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-custom-jet-black bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          <span className="text-lg font-semibold">Editorial Funk</span>
                          <span className="text-sm text-muted-foreground">Navy, copper, blush pink</span>
                        </Label>
                      </div>
                      
                      <div>
                        <RadioGroupItem value="pop-art" id="pop-art" className="peer sr-only" />
                        <Label
                          htmlFor="pop-art"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-custom-jet-black bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          <span className="text-lg font-semibold">Pop Art</span>
                          <span className="text-sm text-muted-foreground">Red, yellow, cyan, black</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="account">
              <Card className="border-custom-jet-black">
                <CardHeader>
                  <CardTitle className="text-2xl text-custom-jet-black dark:text-custom-muted-mint">Account Settings</CardTitle>
                  <CardDescription className="text-custom-jet-black/80 dark:text-custom-muted-mint/80">
                    Manage your account and delete your profile if needed
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4 pt-4">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">Delete Account</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="border-custom-jet-black">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-custom-jet-black dark:text-custom-muted-mint">Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription className="text-custom-jet-black/80 dark:text-custom-muted-mint/80">
                            This action cannot be undone. This will permanently delete your account
                            and remove your data from our servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="border-custom-jet-black">Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeleteProfile} disabled={isDeleting}>
                            {isDeleting ? 'Deleting...' : 'Delete Account'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SettingsPage;
