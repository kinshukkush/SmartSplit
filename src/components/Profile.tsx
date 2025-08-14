import React, { useState } from 'react';

interface User {
  name: string;
  email: string;
  phone: string;
  bio: string;
}

const Profile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState<User>({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    bio: 'Expense tracking enthusiast'
  });

  const handleInputChange = (field: keyof User, value: string) => {
    setUser(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // Add save logic here
    setIsEditing(false);
    console.log('Profile updated:', user);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original values if needed
  };

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-header">
          <div className="avatar-section">
            <img 
              src="https://via.placeholder.com/120" 
              alt="Profile" 
              className="profile-avatar"
            />
            <button className="change-photo-btn">Change Photo</button>
          </div>
        </div>

        <div className="profile-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            {isEditing ? (
              <input
                id="name"
                type="text"
                value={user.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="form-input"
              />
            ) : (
              <span className="form-display">{user.name}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            {isEditing ? (
              <input
                id="email"
                type="email"
                value={user.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="form-input"
              />
            ) : (
              <span className="form-display">{user.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            {isEditing ? (
              <input
                id="phone"
                type="tel"
                value={user.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="form-input"
              />
            ) : (
              <span className="form-display">{user.phone}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            {isEditing ? (
              <textarea
                id="bio"
                value={user.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                className="form-textarea"
                rows={3}
              />
            ) : (
              <span className="form-display">{user.bio}</span>
            )}
          </div>

          <div className="form-actions">
            {isEditing ? (
              <>
                <button onClick={handleSave} className="btn-save">
                  Save Changes
                </button>
                <button onClick={handleCancel} className="btn-cancel">
                  Cancel
                </button>
              </>
            ) : (
              <button onClick={() => setIsEditing(true)} className="btn-edit">
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
