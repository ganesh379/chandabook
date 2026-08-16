import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  Copy, 
  Check, 
  Cloud, 
  CloudOff, 
  QrCode,
  Share2 
} from 'lucide-react';
import { FESTIVAL_TYPES } from '../utils/storage';

export default function Navbar({ 
  activeGroup, 
  onOpenGroupModal, 
  firebaseConnected,
  currentUser,
  onGoogleSignIn,
  onLogout,
  onSelectTab,
  onOpenUpiQr 
}) {
  const [copied, setCopied] = useState(false);

  const isAuthenticated = !!currentUser || !!activeGroup;
  const activeFestival = FESTIVAL_TYPES.find(f => f.id === activeGroup?.festivalType) || FESTIVAL_TYPES[0];

  const handleShareInviteLink = () => {
    if (!activeGroup?.code) return;
    const inviteUrl = `${window.location.origin}/?join=${activeGroup.code}`;
    const text = encodeURIComponent(
      `🪔 *JOIN FESTIVAL COMMITTEE LEDGER* 🪔\n` +
      `You are invited to join *${activeGroup.name}* on ChandaBook!\n\n` +
      `🔑 6-Digit Group Code: *${activeGroup.code}*\n` +
      `👉 Tap link to open & join: ${inviteUrl}`
    );

    const whatsappUrl = `https://api.whatsapp.com/send?text=${text}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleCopyCode = () => {
    if (activeGroup?.code) {
      const inviteUrl = `${window.location.origin}/?join=${activeGroup.code}`;
      navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <header className="no-print" style={{
      background: 'var(--bg-card-solid)',
      borderBottom: '1px solid var(--border-color)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        {/* Brand Logo & Active Group Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isAuthenticated && activeGroup?.profilePic ? (
            <img 
              src={activeGroup.profilePic} 
              alt={activeGroup.name}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                objectFit: 'cover',
                border: '2px solid var(--primary-500)'
              }}
            />
          ) : (
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--primary-500), var(--primary-600))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-glow)',
              fontSize: '1.25rem'
            }}>
              📖
            </div>
          )}

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <h1 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Chanda<span style={{ color: 'var(--primary-500)' }}>Book</span>
              </h1>
              {isAuthenticated && activeGroup && (
                <span className="badge-pill badge-saffron" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                  {activeFestival.icon} {activeFestival.name.split(' ')[0]}
                </span>
              )}
            </div>
            <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
              {isAuthenticated && activeGroup ? activeGroup.name : 'Festival Ledger'}
            </p>
          </div>
        </div>

        {/* Controls - ONLY SHOWN WHEN AUTHENTICATED */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>


          {isAuthenticated ? (
            <>
              {/* UPI QR Button */}
              {activeGroup && (
                <button 
                  onClick={onOpenUpiQr}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.78rem', padding: '5px 10px', gap: '4px', border: '1px solid var(--primary-500)', color: 'var(--primary-500)' }}
                  title="Display Committee UPI QR Code"
                >
                  <QrCode size={14} />
                  <span>UPI QR</span>
                </button>
              )}

              {/* Share WhatsApp Invite Link */}
              {activeGroup?.code && (
                <button 
                  onClick={handleShareInviteLink}
                  className="btn btn-whatsapp"
                  style={{ fontSize: '0.78rem', padding: '5px 10px', gap: '4px' }}
                  title="Share WhatsApp Invite Link"
                >
                  <Share2 size={13} />
                  <span>Share Link</span>
                </button>
              )}

              {/* Copy Group Join Code */}
              {activeGroup?.code && (
                <button 
                  onClick={handleCopyCode}
                  title="Click to copy WhatsApp Invite Link"
                  className="btn btn-secondary"
                  style={{ fontSize: '0.78rem', padding: '5px 10px', gap: '4px' }}
                >
                  <Users size={13} style={{ color: 'var(--primary-500)' }} />
                  <span>Code: <strong style={{ color: 'var(--primary-500)' }}>{activeGroup.code}</strong></span>
                  {copied ? <Check size={13} style={{ color: '#34d399' }} /> : <Copy size={12} />}
                </button>
              )}

              {/* User Profile Avatar */}
              {currentUser ? (
                <button 
                  onClick={() => onSelectTab('landing')}
                  title="My Profile & Groups"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <img 
                    src={currentUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.email}`} 
                    alt={currentUser.displayName} 
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      border: '2px solid var(--primary-500)',
                      objectFit: 'cover'
                    }}
                  />
                </button>
              ) : null}

              {/* Groups Switch Button */}
              <button 
                onClick={onOpenGroupModal}
                className="btn btn-primary" 
                style={{ fontSize: '0.78rem', padding: '6px 12px' }}
              >
                <Building2 size={14} />
                <span>Groups</span>
              </button>
            </>
          ) : (
            /* LOGGED OUT: ONLY SHOW SIGN IN BUTTON */
            <button 
              onClick={onGoogleSignIn}
              className="btn btn-primary"
              style={{ fontSize: '0.825rem', padding: '8px 14px', gap: '8px' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path fill="#ffffff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#ffffff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#ffffff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#ffffff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Sign In with Google</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
