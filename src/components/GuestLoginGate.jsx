import React, { useState } from 'react';
import { Key, ShieldCheck, Lock, Users, Sparkles, Building2, UserCheck, Receipt } from 'lucide-react';

export default function GuestLoginGate({ currentUser, onGoogleSignIn, onJoinViaCode, onOpenReceiptLookup }) {
  const [joinCode, setJoinCode] = useState('');
  const [groupPasscode, setGroupPasscode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [showCodeBox, setShowCodeBox] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    setJoinError('');
    const cleanCode = joinCode.trim();
    if (!cleanCode) return;

    setIsJoining(true);
    const success = await onJoinViaCode(cleanCode, groupPasscode.trim());
    setIsJoining(false);
    if (!success) {
      setJoinError('Invalid Group Code or Passcode. Please check with your committee leader.');
    }
  };

  return (
    <div style={{ maxWidth: '580px', margin: '20px auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* LOGIN BOX — kept first so signing in is the immediate action; the
          branding card sits below as supporting context. */}
      {!currentUser ? (
        <div className="glass-card" style={{ padding: '28px 24px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', fontWeight: 800, marginBottom: '6px' }}>
            Sign In to Access or Create Group
          </h3>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
            Log in with your Gmail account to manage your festival groups and donor receipts
          </p>

          <button 
            onClick={onGoogleSignIn}
            className="btn btn-primary"
            style={{
              padding: '14px 28px',
              background: '#ffffff',
              color: '#0f172a',
              fontWeight: 800,
              fontSize: '1rem',
              gap: '10px',
              width: '100%',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            Sign In with Google / Gmail
          </button>

          {!showCodeBox ? (
            <button 
              type="button" 
              onClick={() => setShowCodeBox(true)}
              style={{ background: 'none', border: 'none', color: 'var(--primary-500)', fontSize: '0.8rem', fontWeight: 600, marginTop: '16px', cursor: 'pointer' }}
            >
              🔑 Have a 6-Digit Group Code? Click here
            </button>
          ) : (
            <form onSubmit={handleCodeSubmit} style={{ marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <div className="form-group">
                <label className="form-label">Enter 6-Digit Group Join Code</label>
                <input 
                  type="text"
                  maxLength="6"
                  className="form-input"
                  placeholder="e.g. 884920"
                  value={joinCode}
                  onChange={e => setJoinCode(e.target.value)}
                  style={{ fontSize: '1.2rem', letterSpacing: '0.15em', textAlign: 'center', fontWeight: 800 }}
                  required
                />
              </div>

              <div className="form-group">
                <input 
                  type="password"
                  className="form-input"
                  placeholder="Group Passcode (Optional)"
                  value={groupPasscode}
                  onChange={e => setGroupPasscode(e.target.value)}
                  style={{ textAlign: 'center' }}
                />
              </div>

              {joinError && (
                <p style={{ color: '#f87171', fontSize: '0.75rem', marginBottom: '10px' }}>
                  {joinError}
                </p>
              )}

              <button type="submit" disabled={isJoining} className="btn btn-secondary" style={{ width: '100%', padding: '10px' }}>
                {isJoining ? 'Searching...' : 'Join Group via Code'}
              </button>
            </form>
          )}

          {onOpenReceiptLookup && (
            <button
              type="button"
              onClick={onOpenReceiptLookup}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 600, marginTop: '18px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Receipt size={14} /> Already donated? Find my receipt
            </button>
          )}
        </div>
      ) : null}

      {/* BRANDING CARD */}
      <div className="glass-card" style={{
        padding: '32px 24px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.18), rgba(15, 23, 42, 0.98))',
        border: '1.5px solid var(--primary-500)',
        boxShadow: 'var(--shadow-glow)'
      }}>
        <img
          src="/icon-192.png"
          alt=""
          width="68"
          height="68"
          style={{
            display: 'block',
            margin: '0 auto 16px auto',
            borderRadius: '20px',
            boxShadow: '0 8px 24px rgba(245, 158, 11, 0.4)'
          }}
        />

        <h2 style={{ fontSize: '1.85rem', color: 'var(--text-main)', fontWeight: 800 }}>
          Chanda<span style={{ color: 'var(--primary-500)' }}>Book</span>
        </h2>
        <p style={{ fontSize: '0.9rem', color: '#cbd5e1', marginTop: '6px', maxWidth: '460px', margin: '6px auto 0 auto' }}>
          Universal Festival Donation & Daily Expense Ledger for Vinayaka Chavithi, Durga Puja & Community Events
        </p>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 14px',
          borderRadius: '20px',
          background: 'rgba(245, 158, 11, 0.12)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          color: '#fbbf24',
          fontSize: '0.78rem',
          fontWeight: 700,
          marginTop: '16px'
        }}>
          <ShieldCheck size={14} /> Verified Real-Time Committee Ledgers
        </div>
      </div>
    </div>
  );
}
