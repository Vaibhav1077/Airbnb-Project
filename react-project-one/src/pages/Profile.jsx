import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../api';
import { toast } from 'react-toastify';
import './Profile.css';

export default function Profile() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files[0];
    if (!file) {
      toast.error('Please select an image first');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('profilePic', file);
      const res = await updateProfile(formData);
      updateUser(res.data);
      setPreview(null);
      fileInputRef.current.value = '';
      toast.success('Profile picture updated!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate('/');
  };

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-avatar-section">
          <img
            src={preview || user.profile_pic}
            alt={user.username}
            className="profile-avatar"
          />
          <div className="profile-upload">
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              id="profile-pic-input"
            />
            <label htmlFor="profile-pic-input" className="btn-choose">
              Choose Photo
            </label>
            {(preview || fileInputRef.current?.files?.[0]) && (
              <button className="btn-upload" onClick={handleUpload} disabled={uploading}>
                {uploading ? 'Uploading...' : 'Save'}
              </button>
            )}
          </div>
        </div>

        <div className="profile-info">
          <h1>@{user.username}</h1>
          <p className="profile-email">{user.email}</p>
        </div>

        <div className="profile-actions">
          <button className="btn-logout-profile" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
