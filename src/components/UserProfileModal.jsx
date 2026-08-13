import React, { useState } from 'react';
import { User, Phone, MapPin, Save, X, LogOut, CheckCircle, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function UserProfileModal({ currentUser, onLogout, onClose, isFirstTime = false }) {
  const savedProfile = JSON.parse(localStorage.getItem('chandabook_user_profile') || '{}');

  const [fullName, setFullName] = useState(savedProfile.fullName || currentUser?.displayName || '');
  const [phone, setPhone] = useState(savedProfile.phone || '');
  const [city, setCity] = useState(savedProfile.city || '');
  const [savedMsg, setSavedMsg] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      alert("Please enter your Full Name and Mobile Number.");
      return;
    }

    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } catch (err) {}

    const updated = {
      fullName: fullName.trim(),
      phone: phone.trim(),
      city: city.trim(),
      email: currentUser?.email || '',
      isProfileComplete: true
    };

    localStorage.setItem('chandabook_user_profile', JSON.stringify(updated));
    setSavedMsg("Profile saved successfully!");
    setTimeout(() => {
      setSavedMsg('');
      onClose();
    }, 1200);
  };

  return (
    <div className="modal-overlay" onClick={isFirstTime ? undefined : onClose}>
      <div className="modal-container" style={{ maxWidth: '440px' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <span className="badge-pill badge-saffron" style={{ fontSize: '0.68rem', marginBottom: '4px' }}>
              <ShieldCheck size={12} /> {isFirstTime ? 'First Time Member Registration' : 'My User Profile'}
            </span>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', fontWeight: 800 }}>
              {isFirstTime ? 'Welcome! Submit Basic Details' : 'My Profile'}
            </h3>
          </div>
          {!isFirstTime && (
            <button onClick={onClose} className="btn btn-secondary btn-icon"><X size={16} /></button>
          )}
        </div>

        {/* Google User Identity Info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px',
          background: 'var(--bg-input)',
          borderRadius: '12px',
          marginBottom: '20px'
        }}>
          <img 
            src={currentUser?.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser?.email}`} 
            alt={currentUser?.displayName} 
            style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid var(--primary-500)' }}
          />
          <div>
            <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.95rem' }}>
              {currentUser?.displayName || 'Logged In User'}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#34d399' }}>
              ✓ Verified Gmail ({currentUser?.email})
            </div>
          </div>
        </div>

        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input 
              type="text"
              className="form-input"
              placeholder="e.g. Ramesh Kumar"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Mobile / WhatsApp Number *</label>
            <input 
              type="tel"
              className="form-input"
              placeholder="e.g. 9848022334"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">City / Location</label>
            <input 
              type="text"
              className="form-input"
              placeholder="e.g. Hyderabad, Telangana"
              value={city}
              onChange={e => setCity(e.target.value)}
            />
          </div>

          {savedMsg && (
            <p style={{ color: '#34d399', fontSize: '0.825rem', fontWeight: 700, marginBottom: '12px', textAlign: 'center' }}>
              {savedMsg}
            </p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
            <button type="submit" className="btn btn-primary" style={{ padding: '14px', width: '100%', gap: '8px', fontSize: '0.95rem' }}>
              <CheckCircle size={18} /> {isFirstTime ? 'Save & Continue to Festival Ledger' : 'Save Profile Details'}
            </button>

            {onLogout && (
              <button 
                type="button" 
                onClick={() => {
                  onLogout();
                  onClose();
                }} 
                className="btn btn-danger"
                style={{ padding: '10px', width: '100%', gap: '6px' }}
              >
                <LogOut size={16} /> Logout
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
