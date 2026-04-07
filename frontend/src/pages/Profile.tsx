import { useProfile, useUpdateProfile, useChangePassword } from '../hooks/useUser';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { useState } from 'react';

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [editName, setEditName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { data: profile, isLoading } = useProfile();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();
  const { mutate: changePassword, isPending: isChanging } = useChangePassword();

  if (isLoading) {
    return <div className='p-6 text-center'>Loading profile...</div>;
  }

  if (!profile) {
    return <div className='p-6 text-center'>Profile not found</div>;
  }

  const handleUpdateProfile = () => {
    if (editName) {
      updateProfile(
        { name: editName },
        {
          onSuccess: () => {
            setIsEditing(false);
          },
        }
      );
    }
  };

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    changePassword(
      { oldPassword: currentPassword, newPassword },
      {
        onSuccess: () => {
          setIsChangingPassword(false);
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
        },
      }
    );
  };

  return (
    <div className='p-6 space-y-6 max-w-2xl'>
      <div>
        <h1 className='text-3xl font-bold text-gray-900'>Profile Settings</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          {!isEditing ? (
            <div className='space-y-4'>
              <div>
                <Label className='text-gray-500'>Name</Label>
                <p className='text-lg font-medium text-gray-900 mt-1'>{profile.name}</p>
              </div>
              <div>
                <Label className='text-gray-500'>Email</Label>
                <p className='text-lg font-medium text-gray-900 mt-1'>{profile.email}</p>
              </div>
              <div>
                <Label className='text-gray-500'>Role</Label>
                <p className='text-lg font-medium text-gray-900 mt-1'>{profile.role}</p>
              </div>
              <div>
                <Label className='text-gray-500'>Status</Label>
                <p className={`text-lg font-medium mt-1 ${
                  profile.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {profile.status}
                </p>
              </div>

              <Button
                onClick={() => {
                  setEditName(profile.name);
                  setIsEditing(true);
                }}
              >
                Edit Profile
              </Button>
            </div>
          ) : (
            <div className='space-y-4'>
              <div>
                <Label htmlFor='edit-name'>Name</Label>
                <Input
                  id='edit-name'
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className='mt-1'
                />
              </div>
              <div className='flex gap-2'>
                <Button
                  onClick={handleUpdateProfile}
                  disabled={isUpdating}
                  className='flex-1'
                >
                  Save Changes
                </Button>
                <Button
                  variant='outline'
                  onClick={() => setIsEditing(false)}
                  className='flex-1'
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          {!isChangingPassword ? (
            <Button onClick={() => setIsChangingPassword(true)} variant='outline'>
              Change Password
            </Button>
          ) : (
            <div className='space-y-4'>
              <div>
                <Label htmlFor='current-password'>Current Password</Label>
                <Input
                  id='current-password'
                  type='password'
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className='mt-1'
                />
              </div>

              <div>
                <Label htmlFor='new-password'>New Password</Label>
                <Input
                  id='new-password'
                  type='password'
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className='mt-1'
                />
              </div>

              <div>
                <Label htmlFor='confirm-password'>Confirm Password</Label>
                <Input
                  id='confirm-password'
                  type='password'
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className='mt-1'
                />
              </div>

              <div className='flex gap-2'>
                <Button
                  onClick={handleChangePassword}
                  disabled={isChanging}
                  className='flex-1'
                >
                  Update Password
                </Button>
                <Button
                  variant='outline'
                  onClick={() => {
                    setIsChangingPassword(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  className='flex-1'
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div>
            <p className='text-sm text-gray-500'>User ID</p>
            <p className='font-mono text-sm text-gray-900 mt-1'>{profile.id}</p>
          </div>
          <div>
            <p className='text-sm text-gray-500'>Created</p>
            <p className='text-sm text-gray-900 mt-1'>
              {new Date(profile.createdAt).toLocaleString()}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
