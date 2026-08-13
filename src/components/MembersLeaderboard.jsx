import React, { useState } from 'react';
import { 
  Trophy, 
  Users, 
  Plus, 
  Trash2, 
  UserCheck, 
  Share2,
  Lock,
  ShieldAlert
} from 'lucide-react';
import { computeGroupFinancials } from '../utils/storage';

export default function MembersLeaderboard({ group, onUpdateGroup, onViewReceipt }) {
  const [selectedMember, setSelectedMember] = useState(null);
  const [newMemberName, setNewMemberName] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const financials = computeGroupFinancials(group);
  const memberStats = financials.memberStats;

  const handleAddMember = (e) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    const updatedMembers = [...(group.members || []), newMemberName.trim()];
    onUpdateGroup({
      ...group,
      members: updatedMembers
    });
    setNewMemberName('');
    setShowAddModal(false);
  };

  const handleRemoveMember = (memberName) => {
    if (!window.confirm(`Are you sure you want to remove "${memberName}" from the committee members list?`)) return;

    const updatedMembers = (group.members || []).filter(m => m !== memberName);
    onUpdateGroup({
      ...group,
      members: updatedMembers
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
              <h2 style={{ fontSize: '1.4rem', color: 'var(--text-main)' }}>Committee Member Leaderboard</h2>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Track volunteer collections & manage committee member roster
            </p>
          </div>

          <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
            <Plus size={16} /> Add Member / Volunteer
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
              {/* Rank Badge & Remove Button */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
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
                    {index === 0 ? '🏆 Top Collector' : index === 1 ? '🥈 2nd Rank' : index === 2 ? '🥉 3rd Rank' : 'Committee Member'}
                  </span>
                </div>

                <button 
                  onClick={() => handleRemoveMember(member.name)}
                  style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: '4px' }}
                  title="Remove Volunteer from Committee"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '4px' }}>
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

      {/* ADD MEMBER MODAL */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Add Committee Member / Volunteer</h3>
            <form onSubmit={handleAddMember}>
              <div className="form-group">
                <label className="form-label">Volunteer Full Name</label>
                <input 
                  type="text"
                  className="form-input"
                  placeholder="e.g. Ramesh Babu (Secretary)"
                  value={newMemberName}
                  onChange={e => setNewMemberName(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Save Member
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
