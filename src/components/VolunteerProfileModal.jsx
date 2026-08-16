import React, { useState } from 'react';
import { UserCheck, ShieldCheck, Phone, CheckCircle, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { COMMITTEE_ROLES } from './MembersLeaderboard';

export default function VolunteerProfileModal({ group, currentUser, onSubmitProfile, onClose }) {
  const [fullName, setFullName] = useState(currentUser?.displayName || '');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('Volunteer');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    try {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    } catch (e) {}

    const memberDataObj = {
      id: `mem-${Date.now()}`,
      name: fullName.trim(),
      phone: phone.trim(),
      role,
      email: currentUser?.email || '',
      photoURL: currentUser?.photoURL || '',
      joinedAt: new Date().toISOString().split('T')[0]
    };

    onSubmitProfile(memberDataObj);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" style={{ maxWidth: '440px' }} onClick={e => e.stopPropagation()}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary-500), var(--primary-600))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px auto',
            color: '#0f172a'
          }}>
            <UserCheck size={28} />
          </div>

          <h3 style={{ fontSize: '1.3rem', color: 'var(--text-main)', fontWeight: 800 }}>
            Complete Volunteer Profile
          </h3>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Joining <strong>{group?.name || 'Festival Committee'}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input 
              type="text"
              className="form-input"
              placeholder="e.g. Rahul Kumar"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Mobile / WhatsApp Number</label>
            <input 
              type="tel"
              className="form-input"
              placeholder="e.g. 9848022334"
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Requested Position / Role</label>
            <select 
              className="form-select"
              value={role}
              onChange={e => setRole(e.target.value)}
            >
              {COMMITTEE_ROLES.filter(r => r.id !== 'Admin').map(r => (
                <option key={r.id} value={r.id}>{r.label}</option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '0.95rem', gap: '8px', marginTop: '10px' }}>
            <CheckCircle size={18} /> Submit Profile & Join Committee
          </button>
        </form>
      </div>
    </div>
  );
}
