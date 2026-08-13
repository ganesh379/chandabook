import React, { useState } from 'react';
import { 
  Trophy, 
  Users, 
  UserPlus, 
  Trash2, 
  Share2,
  Edit2,
  ShieldCheck,
  Check,
  Phone,
  Crown,
  Briefcase,
  X
} from 'lucide-react';
import { computeGroupFinancials } from '../utils/storage';

export const COMMITTEE_ROLES = [
  { id: 'President', label: '👑 President', badgeClass: 'badge-saffron' },
  { id: 'Treasurer', label: '💼 Treasurer / Cashier', badgeClass: 'badge-green' },
  { id: 'Secretary', label: '📜 General Secretary', badgeClass: 'badge-saffron' },
  { id: 'Vice President', label: '🌟 Vice President', badgeClass: 'badge-saffron' },
  { id: 'Youth Leader', label: '🚩 Youth Leader', badgeClass: 'badge-saffron' },
  { id: 'Pooja In-Charge', label: '🪔 Pooja Committee In-Charge', badgeClass: 'badge-saffron' },
  { id: 'Pandal In-Charge', label: '🎪 Pandal & Decor In-Charge', badgeClass: 'badge-saffron' },
  { id: 'Food In-Charge', label: '🍲 Prasadam / Food In-Charge', badgeClass: 'badge-saffron' },
  { id: 'Volunteer', label: '📢 Committee Volunteer', badgeClass: 'badge-secondary' }
];

export default function MembersLeaderboard({ group, onUpdateGroup, onViewReceipt }) {
  const [selectedMember, setSelectedMember] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [memberToEditRole, setMemberToEditRole] = useState(null);
  const [selectedRoleInput, setSelectedRoleInput] = useState('Volunteer');
  const [copiedLink, setCopiedLink] = useState(false);

  const financials = computeGroupFinancials(group);
  const memberStats = financials.memberStats;

  // Generate 1-Click WhatsApp Member Invite Link
  const getMemberInviteUrl = () => {
    if (!group?.code) return window.location.origin;
    return `${window.location.origin}/?inviteMember=${group.code}`;
  };

  const handleShareMemberInvite = () => {
    const inviteUrl = getMemberInviteUrl();
    const text = encodeURIComponent(
      `🪔 *JOIN COMMITTEE VOLUNTEER TEAM* 🪔\n` +
      `You are invited to join the official volunteer team for *${group?.name}* on ChandaBook!\n\n` +
      `👉 Tap link to sign in & complete your volunteer profile:\n${inviteUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleCopyInviteLink = () => {
    navigator.clipboard.writeText(getMemberInviteUrl());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleOpenEditRole = (memberName) => {
    setMemberToEditRole(memberName);
    const existingMemberObj = (group.membersData || []).find(m => (typeof m === 'object' ? m.name : m) === memberName);
    setSelectedRoleInput(existingMemberObj?.role || 'Volunteer');
    setShowRoleModal(true);
  };

  const handleSaveRole = (e) => {
    e.preventDefault();
    if (!memberToEditRole) return;

    const updatedMembersData = (group.membersData || []).map(m => {
      const name = typeof m === 'object' ? m.name : m;
      if (name === memberToEditRole) {
        return typeof m === 'object' 
          ? { ...m, role: selectedRoleInput }
          : { name: m, role: selectedRoleInput };
      }
      return m;
    });

    // Check if member wasn't in membersData list yet
    const exists = updatedMembersData.some(m => (typeof m === 'object' ? m.name : m) === memberToEditRole);
    if (!exists) {
      updatedMembersData.push({ name: memberToEditRole, role: selectedRoleInput });
    }

    onUpdateGroup({
      ...group,
      membersData: updatedMembersData
    });

    setShowRoleModal(false);
    setMemberToEditRole(null);
  };

  const handleRemoveMember = (memberName) => {
    if (!window.confirm(`Are you sure you want to remove "${memberName}" from the committee members list?`)) return;

    const updatedMembers = (group.members || []).filter(m => (typeof m === 'object' ? m.name : m) !== memberName);
    const updatedMembersData = (group.membersData || []).filter(m => (typeof m === 'object' ? m.name : m) !== memberName);

    onUpdateGroup({
      ...group,
      members: updatedMembers,
      membersData: updatedMembersData
    });
  };

  // Filter collections for selected member modal
  const memberCollections = selectedMember 
    ? (group.collections || []).filter(c => c.collectedBy === selectedMember)
    : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Bar */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Trophy size={20} style={{ color: '#eab308' }} />
              <h2 style={{ fontSize: '1.4rem', color: 'var(--text-main)' }}>Committee Leaderboard & Member Roster</h2>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Track volunteer collections, assign official positions & invite members via WhatsApp
            </p>
          </div>

          <button onClick={() => setShowInviteModal(true)} className="btn btn-primary" style={{ gap: '8px' }}>
            <UserPlus size={16} /> Invite Member via WhatsApp
          </button>
        </div>
      </div>

      {/* Leaderboard Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '16px'
      }}>
        {memberStats.map((member, index) => {
          const isTop3 = index < 3;
          const badgeColor = index === 0 ? '#eab308' : index === 1 ? '#94a3b8' : index === 2 ? '#b45309' : 'transparent';
          
          // Get member role
          const memberObj = (group.membersData || []).find(m => (typeof m === 'object' ? m.name : m) === member.name);
          const memberRole = (typeof memberObj === 'object' ? memberObj.role : '') || (member.name.includes('President') ? 'President' : member.name.includes('Treasurer') ? 'Treasurer' : 'Volunteer');
          const roleObj = COMMITTEE_ROLES.find(r => r.id === memberRole) || COMMITTEE_ROLES[8];

          return (
            <div 
              key={member.name}
              className="glass-card glass-card-hover"
              style={{
                padding: '20px',
                position: 'relative',
                border: isTop3 ? `1px solid ${badgeColor}` : '1px solid var(--border-color)',
                background: isTop3 ? `rgba(${index === 0 ? '234, 179, 8' : index === 1 ? '148, 163, 184' : '180, 83, 9'}, 0.06)` : 'var(--bg-card)'
              }}
            >
              {/* Rank Badge & Controls */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: isTop3 ? badgeColor : 'var(--bg-input)',
                    color: isTop3 ? '#0f172a' : 'var(--text-main)',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: isTop3 ? `0 0 12px ${badgeColor}` : 'none'
                  }}>
                    #{index + 1}
                  </span>
                  <span className="badge-pill badge-saffron" style={{ fontSize: '0.68rem' }}>
                    {roleObj.label}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '4px' }}>
                  <button 
                    onClick={() => handleOpenEditRole(member.name)}
                    style={{ background: 'none', border: 'none', color: 'var(--primary-500)', cursor: 'pointer', padding: '4px' }}
                    title="Assign Official Position / Role"
                  >
                    <Edit2 size={15} />
                  </button>

                  <button 
                    onClick={() => handleRemoveMember(member.name)}
                    style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: '4px' }}
                    title="Remove Volunteer"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '4px', fontWeight: 800 }}>
                {member.name}
              </h3>
              
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                {member.count} donation receipts issued
              </p>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '12px',
                borderTop: '1px solid var(--border-color)'
              }}>
                <div>
                  <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>TOTAL COLLECTED</span>
                  <h4 style={{ fontSize: '1.3rem', color: '#34d399', fontWeight: 800 }}>
                    {group.currency || '₹'}{member.total.toLocaleString('en-IN')}
                  </h4>
                </div>

                <button 
                  onClick={() => setSelectedMember(member.name)}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                >
                  View Log ({member.count})
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* WHATSAPP MEMBER INVITE LINK MODAL */}
      {showInviteModal && (
        <div className="modal-overlay" onClick={() => setShowInviteModal(false)}>
          <div className="modal-container" style={{ maxWidth: '440px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>Invite Volunteer via WhatsApp</h3>
              <button onClick={() => setShowInviteModal(false)} className="btn btn-secondary btn-icon"><X size={16} /></button>
            </div>

            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Share this invite link with your committee member on WhatsApp. When they tap the link, they will sign in with Google and submit their profile details to join the group!
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button onClick={handleShareMemberInvite} className="btn btn-whatsapp" style={{ padding: '12px', fontSize: '0.95rem' }}>
                <Share2 size={18} /> Share Invite Link on WhatsApp
              </button>

              <button onClick={handleCopyInviteLink} className="btn btn-secondary" style={{ padding: '10px', fontSize: '0.85rem' }}>
                {copiedLink ? <Check size={16} style={{ color: '#34d399' }} /> : <Users size={16} />}
                {copiedLink ? 'Invite Link Copied!' : 'Copy Invite Link'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT ROLE / POSITION ASSIGNMENT MODAL */}
      {showRoleModal && (
        <div className="modal-overlay" onClick={() => setShowRoleModal(false)}>
          <div className="modal-container" style={{ maxWidth: '380px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)', marginBottom: '6px' }}>
              Assign Position / Role
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Assign an official committee title to <strong>{memberToEditRole}</strong>:
            </p>

            <form onSubmit={handleSaveRole}>
              <div className="form-group">
                <label className="form-label">Official Designation</label>
                <select 
                  className="form-select"
                  value={selectedRoleInput}
                  onChange={e => setSelectedRoleInput(e.target.value)}
                >
                  {COMMITTEE_ROLES.map(r => (
                    <option key={r.id} value={r.id}>{r.label}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <button type="button" onClick={() => setShowRoleModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Save Position
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MEMBER COLLECTION LOG MODAL */}
      {selectedMember && (
        <div className="modal-overlay" onClick={() => setSelectedMember(null)}>
          <div className="modal-container" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>Collection Log: {selectedMember}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Total {memberCollections.length} receipts collected
                </p>
              </div>
              <button onClick={() => setSelectedMember(null)} className="btn btn-secondary btn-icon">✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '350px', overflowY: 'auto' }}>
              {memberCollections.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>
                  No collection records for this member yet.
                </p>
              ) : (
                memberCollections.map(c => (
                  <div key={c.id} style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-input)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <h4 style={{ fontSize: '0.875rem', color: 'var(--text-main)' }}>{c.donorName}</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {c.address} • {c.paymentMode} • {c.date}
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 800, color: '#34d399', fontSize: '0.95rem' }}>
                        {group.currency || '₹'}{Number(c.amount).toLocaleString('en-IN')}
                      </span>
                      <button onClick={() => onViewReceipt(c)} style={{ background: 'none', border: 'none', color: '#25d366', cursor: 'pointer' }}>
                        <Share2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
