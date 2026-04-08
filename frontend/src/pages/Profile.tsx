import { useProfile, useUpdateProfile, useChangePassword } from '../hooks/useUser';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { useEffect, useState } from 'react';
import { Eye, EyeOff, Lock, User } from 'lucide-react';
import { toast } from 'sonner';

export default function Profile() {
  const [editName, setEditName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const { data: profile, isLoading } = useProfile();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();
  const { mutate: changePassword, isPending: isChanging } = useChangePassword();

  useEffect(() => {
    if (!profile) return;
    setEditName(profile.name || '');
    setAvatarUrl(profile.avatar || '');
  }, [profile]);

  useEffect(() => {
    setAvatarError(false);
  }, [avatarUrl]);

  if (isLoading) {
    return <div className='p-6 text-center'>Loading profile...</div>;
  }

  if (!profile) {
    return <div className='p-6 text-center'>Profile not found</div>;
  }

  const handleUpdateProfile = () => {
    updateProfile({ name: editName.trim(), avatar: avatarUrl.trim() || undefined });
  };

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      toast.error('Xác nhận mật khẩu không khớp');
      return;
    }
    if (!currentPassword || !newPassword) {
      toast.error('Vui lòng nhập đầy đủ mật khẩu');
      return;
    }

    changePassword(
      { oldPassword: currentPassword, newPassword },
      {
        onSuccess: () => {
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
        },
      }
    );
  };

  return (
    <div className='p-6'>
      <div className='grid grid-cols-1 gap-6 xl:grid-cols-[2fr_1fr]'>
        <Card className='rounded-2xl border-gray-100 bg-white shadow-none'>
          <CardHeader className='pb-2'>
            <CardTitle className='flex items-center gap-2 text-2xl font-semibold text-gray-800'>
              <User size={22} className='text-blue-600' />
              Thông tin cá nhân
            </CardTitle>
          </CardHeader>
          <CardContent className='pt-4'>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-[260px_1fr]'>
              <div className='flex flex-col items-center'>
                <div className='relative'>
                  {avatarUrl && !avatarError ? (
                    <img
                      src={avatarUrl}
                      alt='avatar'
                      className='h-[240px] w-[240px] rounded-full border-4 border-white object-cover shadow-sm'
                      onError={() => setAvatarError(true)}
                    />
                  ) : (
                    <div className='h-[240px] w-[240px] rounded-full border-4 border-white bg-gradient-to-br from-blue-600 to-blue-700 shadow-sm flex items-center justify-center text-white text-7xl font-semibold'>
                      {(editName || profile.name || '?').charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <p className='mt-3 text-xs font-semibold uppercase tracking-wide text-gray-400'>
                  Ảnh đại diện
                </p>
              </div>

              <div className='space-y-4'>
                <div>
                  <Label htmlFor='name' className='mb-2 block font-medium text-gray-700'>
                    Họ và tên
                  </Label>
                  <Input
                    id='name'
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className='h-12 rounded-full border-0 bg-[#e8edf7] px-5 text-gray-800 placeholder:text-gray-400 focus:ring-blue-500'
                  />
                </div>

                <div>
                  <Label htmlFor='email' className='mb-2 block font-medium text-gray-700'>
                    Email
                  </Label>
                  <Input
                    id='email'
                    value={profile.email}
                    disabled
                    className='h-12 rounded-full border-0 bg-[#e8edf7] px-5 text-gray-700'
                  />
                </div>

                <div>
                  <Label htmlFor='avatar-url' className='mb-2 block font-medium text-gray-700'>
                    URL ảnh đại diện
                  </Label>
                  <Input
                    id='avatar-url'
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder='https://...'
                    className='h-12 rounded-full border-0 bg-[#e8edf7] px-5 text-gray-800 placeholder:text-gray-400'
                  />
                </div>

                <div className='flex justify-end pt-2'>
                  <Button
                    onClick={handleUpdateProfile}
                    disabled={isUpdating}
                    className='h-12 rounded-full px-8 font-semibold shadow-sm'
                  >
                    {isUpdating ? 'Đang lưu...' : 'Lưu thông tin'}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='rounded-2xl border-gray-100 bg-white shadow-none'>
          <CardHeader className='pb-2'>
            <CardTitle className='flex items-center gap-2 text-2xl font-semibold text-gray-800'>
              <Lock size={22} className='text-red-600' />
              Đổi mật khẩu
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4 pt-4'>
            <div>
              <Label htmlFor='current-password' className='mb-2 block font-medium text-gray-700'>
                Mật khẩu cũ
              </Label>
              <div className='relative'>
                <Input
                  id='current-password'
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  autoComplete='new-password'
                  placeholder='••••••••'
                  className='h-12 rounded-full border-0 bg-[#e8edf7] px-5 pr-12'
                />
                <button
                  type='button'
                  onClick={() => setShowCurrentPassword((prev) => !prev)}
                  className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700'
                >
                  {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor='new-password' className='mb-2 block font-medium text-gray-700'>
                Mật khẩu mới
              </Label>
              <div className='relative'>
                <Input
                  id='new-password'
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete='new-password'
                  placeholder='Password'
                  className='h-12 rounded-full border-0 bg-[#e8edf7] px-5 pr-12'
                />
                <button
                  type='button'
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700'
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor='confirm-password' className='mb-2 block font-medium text-gray-700'>
                Xác nhận mật khẩu
              </Label>
              <div className='relative'>
                <Input
                  id='confirm-password'
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete='new-password'
                  placeholder='Nhập lại mật khẩu mới'
                  className='h-12 rounded-full border-0 bg-[#e8edf7] px-5 pr-12'
                />
                <button
                  type='button'
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700'
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button
              onClick={handleChangePassword}
              disabled={isChanging}
              className='h-12 w-full rounded-full font-semibold'
            >
              {isChanging ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
