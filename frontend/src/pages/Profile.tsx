import React, { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { userApi } from '@/services/api.service';
import {
  User as UserIcon,
  Mail,
  Building,
  Briefcase,
  Upload,
  Lock,
  Trash2,
  CheckCircle2,
  Plus,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const Profile: React.FC = () => {
  const { user, updateUser, logout } = useAuthStore();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    education: user?.education || '',
    experience: user?.experience || '',
    targetCompany: user?.targetCompany || '',
    targetRole: user?.targetRole || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
  });

  const [passData, setPassData] = useState({ currentPassword: '', newPassword: '' });
  const [newSkill, setNewSkill] = useState('');
  const [saving, setSaving] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await userApi.updateProfile(formData);
      updateUser(res.data?.data?.user);
      toast.success('Profile updated!');
    } catch (err: any) {
      toast.error('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    const data = new FormData();
    data.append('avatar', file);

    try {
      const res = await userApi.uploadAvatar(data);
      updateUser(res.data?.data?.user);
      toast.success('Avatar updated!');
    } catch (err) {
      toast.error('Failed to upload avatar.');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await userApi.changePassword(passData);
      toast.success('Password changed successfully.');
      setPassData({ currentPassword: '', newPassword: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Password update failed.');
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }
    try {
      await userApi.deleteAccount();
      toast.success('Account deleted.');
      logout();
    } catch (err) {
      toast.error('Failed to delete account.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-lg md:text-xl font-semibold text-[#fafafa] tracking-tight">User Profile & Settings</h1>
        <p className="text-xs text-gray-400 mt-1">
          Manage your account information, target position, skills, and security credentials.
        </p>
      </div>

      {/* Avatar & General Profile Form */}
      <div className="border border-zinc-800 p-6 md:p-8 rounded-xl bg-zinc-900/30 space-y-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-16 h-16 rounded-full object-cover border border-zinc-700"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 font-bold text-xl">
                {user?.name?.[0]?.toUpperCase()}
              </div>
            )}
            <label className="absolute bottom-0 right-0 p-1.5 bg-zinc-800 border border-zinc-700 text-white rounded-full cursor-pointer hover:bg-zinc-750 transition-all shadow-md">
              <Upload className="w-3.5 h-3.5" />
              <input type="file" onChange={handleAvatarChange} accept="image/*" className="hidden" />
            </label>
          </div>

          <div>
            <h3 className="text-base font-semibold text-white">{user?.name}</h3>
            <p className="text-xs text-gray-450">{user?.email}</p>
            <span className="badge badge-purple text-[10px] mt-1">{user?.role} Account</span>
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4 pt-4 border-t border-zinc-800/80">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Target Role</label>
              <input
                type="text"
                value={formData.targetRole}
                onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                placeholder="e.g. Senior Frontend Engineer"
                className="input-field text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Target Company</label>
              <input
                type="text"
                value={formData.targetCompany}
                onChange={(e) => setFormData({ ...formData, targetCompany: e.target.value })}
                placeholder="e.g. Google, Meta, Startup"
                className="input-field text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Experience</label>
              <input
                type="text"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                placeholder="e.g. 3 years"
                className="input-field text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Education</label>
            <input
              type="text"
              value={formData.education}
              onChange={(e) => setFormData({ ...formData, education: e.target.value })}
              placeholder="e.g. B.S. Computer Science"
              className="input-field text-xs"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" disabled={saving} className="btn-primary text-xs py-2 px-5">
              {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Password & Security */}
      <div className="border border-zinc-800 p-6 rounded-xl bg-zinc-900/30 space-y-4">
        <h3 className="text-xs font-semibold text-gray-200 flex items-center gap-2 uppercase tracking-wider">
          Security & Password
        </h3>

        <form onSubmit={handleChangePassword} className="space-y-3 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Current Password</label>
            <input
              type="password"
              required
              value={passData.currentPassword}
              onChange={(e) => setPassData({ ...passData, currentPassword: e.target.value })}
              className="input-field text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">New Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={passData.newPassword}
              onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })}
              className="input-field text-xs"
            />
          </div>

          <button type="submit" className="btn-secondary text-xs py-2 px-4">
            Update Password
          </button>
        </form>
      </div>

      {/* Account Deletion */}
      <div className="border border-rose-500/10 bg-rose-500/5 p-6 rounded-xl space-y-3">
        <h3 className="text-xs font-semibold text-rose-455 uppercase tracking-wider flex items-center gap-2">
          Danger Zone
        </h3>
        <p className="text-xs text-gray-450 leading-relaxed">
          Deleting your account will deactivate your profile and soft-delete all associated interview data.
        </p>
        <button onClick={handleDeleteAccount} className="btn-danger text-xs py-2 px-4">
          Delete Account Permanently
        </button>
      </div>
    </div>
  );
};
