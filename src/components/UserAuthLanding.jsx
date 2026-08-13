import React from 'react';
import { 
  Building2, 
  Plus, 
  Users, 
  LogOut, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Coins,
  Key
} from 'lucide-react';
import { FESTIVAL_TYPES } from '../utils/storage';

export default function UserAuthLanding({ 
  currentUser, 
  onGoogleSignIn, 
  onLogout, 
  groupsList, 
  activeGroupId, 
  onSelectGroup, 
  onOpenCreateGroup, 
  onOpenJoinGroup 
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* USER PROFILE HEADER CARD */}
      <div className="glass-card" style={{
        padding: '24px',
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(15, 23, 42, 0.95)), var(--bg-card)',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          {/* Left: User Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {currentUser ? (
              <img 
                src={currentUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.email}`} 
                alt={currentUser.displayName || 'User'} 
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  border: '2px solid var(--primary-500)',
                  boxShadow: 'var(--shadow-glow)',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'var(--bg-input)',
                border: '2px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.8rem'
              }}>
                👤
              </div>
            )}

            <div>
              {currentUser ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h2 style={{ fontSize: '1.4rem', color: 'var(--text-main)' }}>
                      Welcome, {currentUser.displayName || 'Volunteer'}!
                    </h2>
                    <span className="badge-pill badge-saffron" style={{ fontSize: '0.65rem' }}>
                      Verified Gmail
                    </span>
                  </div>
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                    {currentUser.email}
                  </p>
                </>
              ) : (
                <>
                  <h2 style={{ fontSize: '1.4rem', color: 'var(--text-main)' }}>
                    Welcome to ChandaBook!
                  </h2>
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                    Sign in with Google to sync all your festival groups across phones
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Right: Auth Action */}
          <div>
            {currentUser ? (
              <button onClick={onLogout} className="btn btn-secondary" style={{ gap: '6px' }}>
                <LogOut size={16} /> Sign Out
              </button>
            ) : (
              <button 
                onClick={onGoogleSignIn} 
                className="btn btn-primary"
                style={{ gap: '10px', padding: '12px 20px', background: '#ffffff', color: '#0f172a' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span style={{ fontWeight: 800 }}>Sign In with Google</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS BAR */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
        <button 
          onClick={onOpenCreateGroup}
          className="btn btn-primary"
          style={{ padding: '16px', justifyContent: 'flex-start', gap: '12px' }}
        >
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'rgba(15, 23, 42, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Plus size={22} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '1rem', fontWeight: 800 }}>Create New Group</div>
            <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>Upload photo & set festival budget</div>
          </div>
        </button>

        <button 
          onClick={onOpenJoinGroup}
          className="btn btn-secondary"
          style={{ padding: '16px', justifyContent: 'flex-start', gap: '12px' }}
        >
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'rgba(245, 158, 11, 0.15)',
            color: 'var(--primary-500)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Key size={20} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '1rem', fontWeight: 800 }}>Join Group via Code</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Enter 6-digit committee code</div>
          </div>
        </button>
      </div>

      {/* MY GROUPS LIST */}
      <div>
        <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)', marginBottom: '14px' }}>
          My Joined Festival Groups ({groupsList.length})
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '16px'
        }}>
          {groupsList.map(group => {
            const fest = FESTIVAL_TYPES.find(f => f.id === group.festivalType) || FESTIVAL_TYPES[0];
            const isSelected = group.id === activeGroupId;
            const totalCol = (group.collections || []).reduce((sum, c) => sum + (Number(c.amount) || 0), 0);

            return (
              <div 
                key={group.id}
                className="glass-card glass-card-hover"
                onClick={() => onSelectGroup(group.id)}
                style={{
                  padding: '20px',
                  cursor: 'pointer',
                  borderColor: isSelected ? 'var(--primary-500)' : 'var(--border-color)',
                  background: isSelected ? 'rgba(245, 158, 11, 0.08)' : 'var(--bg-card)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  {/* Custom Group Profile Picture or Festival Emblem */}
                  {group.profilePic ? (
                    <img 
                      src={group.profilePic} 
                      alt={group.name} 
                      style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '14px',
                        objectFit: 'cover',
                        border: '2px solid var(--primary-500)'
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '14px',
                      background: 'linear-gradient(135deg, var(--primary-500), var(--primary-600))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.8rem'
                    }}>
                      {fest.icon}
                    </div>
                  )}

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="badge-pill badge-saffron" style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
                        {fest.icon} {fest.name.split(' ')[0]}
                      </span>
                      {isSelected && (
                        <span className="badge-pill badge-green" style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
                          Active
                        </span>
                      )}
                    </div>
                    <h4 style={{ fontSize: '1.05rem', color: 'var(--text-main)', fontWeight: 800, marginTop: '2px' }}>
                      {group.name}
                    </h4>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '10px',
                  borderTop: '1px solid var(--border-color)',
                  fontSize: '0.8rem'
                }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Code: </span>
                    <strong style={{ color: 'var(--primary-500)', letterSpacing: '0.05em' }}>{group.code}</strong>
                    <span style={{ color: 'var(--text-muted)', marginLeft: '10px' }}>• {group.members?.length || 0} Members</span>
                  </div>

                  <div style={{ fontWeight: 800, color: '#34d399', fontSize: '1rem' }}>
                    {group.currency || '₹'}{totalCol.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
