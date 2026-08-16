import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Users, 
  Sparkles, 
  CheckCircle2, 
  Upload, 
  Camera,
  Image as ImageIcon 
} from 'lucide-react';
import { FESTIVAL_TYPES, generateGroupCode } from '../utils/storage';
import { fetchGroupByCode } from '../firebase';
import { downscaleImageFile } from '../utils/image';

export default function GroupSelectorModal({
  groupsMap,
  activeGroupId,
  onSelectGroup,
  onCreateGroup,
  onImportGroup,
  onClose,
  initialMode = 'list',
  currentUser
}) {
  const [mode, setMode] = useState(initialMode); // 'list' | 'create' | 'join'
  const [isJoining, setIsJoining] = useState(false);
  
  // Create form state
  const [groupName, setGroupName] = useState('');
  const [address, setAddress] = useState('');
  const [festivalType, setFestivalType] = useState('vinayaka_chavithi');
  const [targetGoal, setTargetGoal] = useState(75000);
  const [currency, setCurrency] = useState('₹');
  const [membersInput, setMembersInput] = useState('');
  const [passcode, setPasscode] = useState('1234');
  const [profilePic, setProfilePic] = useState('');

  // Join form state
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');

  const groupsList = Object.values(groupsMap || {});

  // Profile Picture File Upload Handler
  const handleImageUpload = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      alert("Please select an image smaller than 8MB.");
      return;
    }
    try {
      setProfilePic(await downscaleImageFile(file));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    const typedMembers = membersInput
      .split(',')
      .map(m => m.trim())
      .filter(m => m.length > 0);

    const adminName = (currentUser?.displayName || currentUser?.email?.split('@')[0] || '').trim();
    const membersArray = adminName && !typedMembers.includes(adminName)
      ? [adminName, ...typedMembers]
      : typedMembers;

    const newGroup = {
      id: `GROUP-${Date.now()}`,
      code: generateGroupCode(),
      name: groupName.trim(),
      address: address.trim(),
      festivalType,
      targetGoal: Number(targetGoal) || 50000,
      currency,
      adminPasscode: passcode.trim() || '1234',
      profilePic,
      createdAt: new Date().toISOString(),
      members: membersArray.length > 0 ? membersArray : ['Default Collector'],
      membersData: adminName ? [{ name: adminName, role: 'Admin' }] : [],
      collections: [],
      expenses: []
    };

    onCreateGroup(newGroup);
    onClose();
  };

  const handleJoinSubmit = async (e) => {
    e.preventDefault();
    setJoinError('');
    const codeClean = joinCode.trim();
    if (!codeClean) return;

    const matchedGroup = groupsList.find(g => g.code === codeClean);
    if (matchedGroup) {
      onSelectGroup(matchedGroup.id);
      onClose();
      return;
    }

    // Not cached locally yet - try Firestore directly (fresh device)
    setIsJoining(true);
    const remoteGroup = await fetchGroupByCode(codeClean);
    setIsJoining(false);

    if (remoteGroup && onImportGroup) {
      onImportGroup(remoteGroup);
      onClose();
    } else {
      setJoinError('Invalid 6-digit Group Code. Please check with your committee leader.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main)' }}>
              {mode === 'list' && 'Select Festival Group'}
              {mode === 'create' && 'Create Festival Group'}
              {mode === 'join' && 'Join Group via Code'}
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {mode === 'list' && 'Switch active ledger or manage your groups'}
              {mode === 'create' && 'Upload group photo & configure budget'}
              {mode === 'join' && 'Enter 6-digit committee join code'}
            </p>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-icon">
            <X size={18} />
          </button>
        </div>

        {/* Mode Navigation Pills */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '6px',
          background: 'var(--bg-input)',
          padding: '4px',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '20px'
        }}>
          <button 
            onClick={() => setMode('list')}
            style={{
              padding: '8px',
              borderRadius: '6px',
              border: 'none',
              background: mode === 'list' ? 'var(--primary-500)' : 'transparent',
              color: mode === 'list' ? '#0f172a' : 'var(--text-main)',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            My Groups
          </button>
          <button 
            onClick={() => setMode('create')}
            style={{
              padding: '8px',
              borderRadius: '6px',
              border: 'none',
              background: mode === 'create' ? 'var(--primary-500)' : 'transparent',
              color: mode === 'create' ? '#0f172a' : 'var(--text-main)',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            + Create New
          </button>
          <button 
            onClick={() => setMode('join')}
            style={{
              padding: '8px',
              borderRadius: '6px',
              border: 'none',
              background: mode === 'join' ? 'var(--primary-500)' : 'transparent',
              color: mode === 'join' ? '#0f172a' : 'var(--text-main)',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            Join Code
          </button>
        </div>

        {/* LIST MODE */}
        {mode === 'list' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {groupsList.map(group => {
              const fest = FESTIVAL_TYPES.find(f => f.id === group.festivalType) || FESTIVAL_TYPES[0];
              const isSelected = group.id === activeGroupId;
              const totalCol = (group.collections || []).reduce((acc, c) => acc + (Number(c.amount) || 0), 0);

              return (
                <div 
                  key={group.id}
                  onClick={() => {
                    onSelectGroup(group.id);
                    onClose();
                  }}
                  className="glass-card"
                  style={{
                    padding: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    borderColor: isSelected ? 'var(--primary-500)' : 'var(--border-color)',
                    background: isSelected ? 'rgba(245, 158, 11, 0.08)' : 'var(--bg-card)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {group.profilePic ? (
                      <img 
                        src={group.profilePic} 
                        alt={group.name}
                        style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '12px',
                          objectFit: 'cover',
                          border: '2px solid var(--primary-500)'
                        }}
                      />
                    ) : (
                      <div style={{ fontSize: '1.8rem' }}>{fest.icon}</div>
                    )}
                    <div>
                      <h3 style={{ fontSize: '0.95rem', color: 'var(--text-main)', fontWeight: 700 }}>{group.name}</h3>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Code: <strong style={{ color: 'var(--primary-500)' }}>{group.code}</strong> • {group.members?.length || 0} Members
                      </p>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '0.95rem', fontWeight: 800, color: '#34d399' }}>
                      {group.currency}{totalCol.toLocaleString('en-IN')}
                    </p>
                    {isSelected ? (
                      <span className="badge-pill badge-saffron" style={{ fontSize: '0.65rem' }}>Active</span>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Switch →</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CREATE MODE WITH PROFILE PICTURE UPLOAD */}
        {mode === 'create' && (
          <form onSubmit={handleCreateSubmit}>
            {/* Group Profile Picture Upload */}
            <div className="form-group" style={{ alignItems: 'center', textAlign: 'center', marginBottom: '16px' }}>
              <label className="form-label" style={{ marginBottom: '8px' }}>Group Profile Photo / Pandal Banner</label>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                {profilePic ? (
                  <img 
                    src={profilePic} 
                    alt="Group Profile" 
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '20px',
                      objectFit: 'cover',
                      border: '3px solid var(--primary-500)',
                      boxShadow: 'var(--shadow-glow)'
                    }}
                  />
                ) : (
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '20px',
                    background: 'var(--bg-input)',
                    border: '2px dashed var(--primary-500)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary-500)',
                    cursor: 'pointer'
                  }}>
                    <Camera size={26} />
                    <span style={{ fontSize: '0.65rem', marginTop: '2px', fontWeight: 700 }}>Upload</span>
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0,
                    cursor: 'pointer'
                  }}
                />
              </div>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Tap to upload Pandal Idol or Committee logo
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">Festival Type</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {FESTIVAL_TYPES.map(f => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      setFestivalType(f.id);
                      setTargetGoal(f.defaultGoal);
                    }}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      border: `1px solid ${festivalType === f.id ? 'var(--primary-500)' : 'var(--border-color)'}`,
                      background: festivalType === f.id ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg-input)',
                      color: 'var(--text-main)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      textAlign: 'left',
                      cursor: 'pointer'
                    }}
                  >
                    <span>{f.icon}</span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{f.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Group / Committee Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Ganesh Utsav Committee - Main Street"
                value={groupName}
                onChange={e => setGroupName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Committee / Pandal Address</label>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '-4px', marginBottom: '6px' }}>
                Shown on official PDF statements. You can add this later in Settings too.
              </p>
              <textarea
                rows="2"
                className="form-textarea"
                placeholder="e.g. Lotus Apartments, MG Road, Hyderabad - 500081"
                value={address}
                onChange={e => setAddress(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-group">
                <label className="form-label">Target Budget (₹)</label>
                <input 
                  type="number"
                  className="form-input"
                  value={targetGoal}
                  onChange={e => setTargetGoal(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Admin Passcode</label>
                <input 
                  type="text"
                  className="form-input"
                  value={passcode}
                  onChange={e => setPasscode(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Additional Committee Members / Collectors (Comma Separated)</label>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '-4px', marginBottom: '6px' }}>
                You'll be added automatically as Admin. List anyone else here.
              </p>
              <textarea
                rows="2"
                className="form-textarea"
                value={membersInput}
                onChange={e => setMembersInput(e.target.value)}
                placeholder="e.g. Rahul, Suresh, Pawan, Sneha"
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px', padding: '12px' }}>
              Create Group & Get 6-Digit Code
            </button>
          </form>
        )}

        {/* JOIN MODE */}
        {mode === 'join' && (
          <form onSubmit={handleJoinSubmit}>
            <div className="form-group">
              <label className="form-label">Enter 6-Digit Group Join Code</label>
              <input 
                type="text"
                maxLength="6"
                className="form-input"
                placeholder="e.g. 884920"
                value={joinCode}
                onChange={e => setJoinCode(e.target.value)}
                style={{ fontSize: '1.4rem', letterSpacing: '0.2em', textAlign: 'center', fontWeight: 800 }}
                required
              />
            </div>

            {joinError && (
              <p style={{ color: '#f87171', fontSize: '0.8rem', marginBottom: '12px', textAlign: 'center' }}>
                {joinError}
              </p>
            )}

            <button type="submit" disabled={isJoining} className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
              {isJoining ? 'Searching...' : 'Join Group'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
