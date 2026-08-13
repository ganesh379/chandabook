import React, { useState } from 'react';
import { Utensils, Plus, Share2, Calendar, Phone, Trash2 } from 'lucide-react';

export default function PrasadamSchedule({ group, onUpdateGroup }) {
  const [sponsorName, setSponsorName] = useState('');
  const [phone, setPhone] = useState('');
  const [item, setItem] = useState('');
  const [slot, setSlot] = useState('Evening');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAddModal, setShowAddModal] = useState(false);

  const sponsors = group?.prasadamSponsors || [];

  const handleAddSponsor = (e) => {
    e.preventDefault();
    if (!sponsorName.trim() || !item.trim()) return;

    const newSponsor = {
      id: `p-${Date.now()}`,
      sponsorName: sponsorName.trim(),
      phone: phone.trim(),
      item: item.trim(),
      slot,
      date
    };

    const updated = [newSponsor, ...sponsors];
    onUpdateGroup({
      ...group,
      prasadamSponsors: updated
    });

    setSponsorName('');
    setPhone('');
    setItem('');
    setShowAddModal(false);
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this Prasadam sponsor?")) return;
    const updated = sponsors.filter(s => s.id !== id);
    onUpdateGroup({
      ...group,
      prasadamSponsors: updated
    });
  };

  const handleShareConfirmation = (s) => {
    const text = encodeURIComponent(
      `🍲 *PRASADAM & ANNADHANAM SPONSORSHIP CONFIRMATION* 🍲\n` +
      `*${group?.name || 'ChandaBook'}*\n` +
      `-----------------------------------\n` +
      `Dear *${s.sponsorName}*,\n` +
      `Thank you for sponsoring the festival Prasadam!\n\n` +
      `📅 Date: *${s.date}*\n` +
      `⏰ Slot: *${s.slot} Prasadam / Annadhanam*\n` +
      `🍲 Menu Item: *${s.item}*\n` +
      `-----------------------------------\n` +
      `🙏 *May Lord Ganesha bless your family with divine joy and prosperity!* 🙏\n` +
      `ChandaBook Prasadam Ledger`
    );

    const whatsappUrl = s.phone 
      ? `https://api.whatsapp.com/send?phone=91${s.phone.replace(/\D/g, '')}&text=${text}`
      : `https://api.whatsapp.com/send?text=${text}`;

    window.open(whatsappUrl, '_blank');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Bar */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Utensils size={22} style={{ color: '#eab308' }} />
              <h2 style={{ fontSize: '1.4rem', color: 'var(--text-main)' }}>Daily Prasadam & Annadhanam Sponsors</h2>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Schedule morning & evening food prasadam sponsors for each festival day
            </p>
          </div>

          <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
            <Plus size={16} /> Schedule Sponsor
          </button>
        </div>
      </div>

      {/* Sponsors List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {sponsors.length === 0 ? (
          <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
            <Utensils size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>No Prasadam Sponsors Scheduled</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Click "Schedule Sponsor" to add daily food & laddu prasadam contributors.
            </p>
          </div>
        ) : (
          sponsors.map(s => (
            <div 
              key={s.id}
              className="glass-card glass-card-hover"
              style={{
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  fontSize: '1.5rem',
                  padding: '10px',
                  borderRadius: '12px',
                  background: 'rgba(234, 179, 8, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  🍲
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: '1.05rem', color: 'var(--text-main)', fontWeight: 700 }}>
                      {s.sponsorName}
                    </h3>
                    <span className="badge-pill badge-saffron" style={{ fontSize: '0.65rem' }}>
                      {s.slot} Slot
                    </span>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: '#eab308', fontWeight: 600, marginTop: '2px' }}>
                    Item: {s.item}
                  </p>

                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    📅 Date: {s.date} {s.phone && `• 📞 ${s.phone}`}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
                <button 
                  onClick={() => handleShareConfirmation(s)}
                  className="btn btn-whatsapp"
                  style={{ fontSize: '0.78rem', padding: '8px 12px' }}
                >
                  <Share2 size={14} /> Send WhatsApp Confirmation
                </button>

                <button 
                  onClick={() => handleDelete(s.id)}
                  className="btn btn-danger btn-icon"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ADD SPONSOR MODAL */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Schedule Prasadam / Annadhanam Sponsor</h3>

            <form onSubmit={handleAddSponsor}>
              <div className="form-group">
                <label className="form-label">Sponsor Full Name *</label>
                <input 
                  type="text"
                  className="form-input"
                  placeholder="e.g. N. Lakshmi & Family"
                  value={sponsorName}
                  onChange={e => setSponsorName(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label">Prasadam Menu / Items *</label>
                <input 
                  type="text"
                  className="form-input"
                  placeholder="e.g. Chakra Pongal & 108 Laddus, Annadhanam"
                  value={item}
                  onChange={e => setItem(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label className="form-label">Slot</label>
                  <select 
                    className="form-select"
                    value={slot}
                    onChange={e => setSlot(e.target.value)}
                  >
                    <option value="Morning">Morning Tiffin / Prasadam</option>
                    <option value="Afternoon">Afternoon Annadhanam</option>
                    <option value="Evening">Evening Harathi & Laddu</option>
                    <option value="Night">Night Mahaprasadam</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input 
                    type="date"
                    className="form-input"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">WhatsApp Phone Number</label>
                <input 
                  type="tel"
                  className="form-input"
                  placeholder="e.g. 9177889900"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Save Sponsor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
