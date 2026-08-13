import React, { useState, useMemo } from 'react';
import {
  HandCoins,
  Plus,
  Trash2,
  Share2,
  CheckCircle2,
  Clock,
  X,
  Bell,
  Send
} from 'lucide-react';

const buildPledgeReminderText = (group, pledge) => {
  const outstanding = Math.max(0, Number(pledge.pledgeAmount) - Number(pledge.collectedAmount || 0));
  return encodeURIComponent(
    `🙏 *CHANDA PLEDGE REMINDER* 🙏\n` +
    `*${group?.name || 'ChandaBook'}*\n` +
    `-----------------------------------\n` +
    `Dear *${pledge.donorName}*,\n` +
    `This is a gentle reminder for your committed festival chanda pledge.\n\n` +
    `💰 Pledged Amount: *${group?.currency || '₹'}${Number(pledge.pledgeAmount).toLocaleString('en-IN')}*\n` +
    `⏳ Outstanding: *${group?.currency || '₹'}${outstanding.toLocaleString('en-IN')}*\n` +
    `📅 Pledged On: ${pledge.date}\n` +
    `-----------------------------------\n` +
    `Please pay at your convenience via Cash / UPI to any committee collector.\n` +
    `🙏 *Thank you for your generous support!* 🙏\n` +
    `ChandaBook Pledge Ledger`
  );
};

export default function PledgesList({ group, onUpdateGroup, onAddCollection }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(null);
  const [showReminderQueue, setShowReminderQueue] = useState(false);

  // Add Pledge form state
  const [donorName, setDonorName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [pledgeAmount, setPledgeAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  // Mark Paid form state
  const [payAmount, setPayAmount] = useState('');
  const [payMode, setPayMode] = useState('Cash');
  const [payCollector, setPayCollector] = useState(group?.members?.[0] || 'Treasurer');

  const pledges = group?.pledges || [];
  const pending = useMemo(() => pledges.filter(p => p.status !== 'fulfilled').sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)), [pledges]);
  const fulfilled = useMemo(() => pledges.filter(p => p.status === 'fulfilled').sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)), [pledges]);

  const totalPledged = pledges.reduce((s, p) => s + (Number(p.pledgeAmount) || 0), 0);
  const totalCollectedFromPledges = pledges.reduce((s, p) => s + (Number(p.collectedAmount) || 0), 0);
  const totalOutstanding = Math.max(0, totalPledged - totalCollectedFromPledges);

  const handleAddPledge = (e) => {
    e.preventDefault();
    const num = Number(pledgeAmount);
    if (!donorName.trim() || !num || num <= 0) return;

    const newPledge = {
      id: `pledge-${Date.now()}`,
      donorName: donorName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      pledgeAmount: num,
      collectedAmount: 0,
      status: 'pending',
      date,
      notes: notes.trim(),
      linkedCollectionIds: [],
      lastReminderSentAt: null
    };

    onUpdateGroup({ ...group, pledges: [newPledge, ...pledges] });

    setDonorName(''); setPhone(''); setAddress(''); setPledgeAmount(''); setNotes('');
    setShowAddModal(false);
  };

  const handleDeletePledge = (id) => {
    if (!window.confirm("Delete this pledge record? (Any linked collections already recorded will NOT be removed.)")) return;
    onUpdateGroup({ ...group, pledges: pledges.filter(p => p.id !== id) });
  };

  const openPayModal = (pledge) => {
    const outstanding = Math.max(0, Number(pledge.pledgeAmount) - Number(pledge.collectedAmount || 0));
    setPayAmount(outstanding.toString());
    setPayMode('Cash');
    setPayCollector(group?.members?.[0] || 'Treasurer');
    setShowPayModal(pledge);
  };

  const handleConfirmPayment = (e) => {
    e.preventDefault();
    const pledge = showPayModal;
    const num = Number(payAmount);
    if (!pledge || !num || num <= 0) return;

    const newCollection = {
      id: `col-${Date.now()}`,
      receiptNo: `CB-${(group?.collections?.length || 0) + 101}`,
      donorName: pledge.donorName,
      phone: pledge.phone,
      address: pledge.address,
      amount: num,
      paymentMode: payMode,
      collectedBy: payCollector,
      date: new Date().toISOString().split('T')[0],
      notes: `Chanda pledge payment (Pledged ${group?.currency || '₹'}${Number(pledge.pledgeAmount).toLocaleString('en-IN')})`
    };

    onAddCollection(newCollection);

    const newCollectedTotal = Number(pledge.collectedAmount || 0) + num;
    const updatedPledges = pledges.map(p => {
      if (p.id !== pledge.id) return p;
      return {
        ...p,
        collectedAmount: newCollectedTotal,
        status: newCollectedTotal >= Number(p.pledgeAmount) ? 'fulfilled' : 'partial',
        linkedCollectionIds: [...(p.linkedCollectionIds || []), newCollection.id]
      };
    });

    onUpdateGroup({ ...group, pledges: updatedPledges });
    setShowPayModal(null);
  };

  const handleSendReminder = (pledge) => {
    const text = buildPledgeReminderText(group, pledge);
    const whatsappUrl = pledge.phone
      ? `https://api.whatsapp.com/send?phone=91${pledge.phone.replace(/\D/g, '')}&text=${text}`
      : `https://api.whatsapp.com/send?text=${text}`;
    window.open(whatsappUrl, '_blank');

    const updatedPledges = pledges.map(p => p.id === pledge.id ? { ...p, lastReminderSentAt: new Date().toISOString() } : p);
    onUpdateGroup({ ...group, pledges: updatedPledges });
  };

  const pendingWithPhone = pending.filter(p => p.phone);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Bar */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HandCoins size={22} style={{ color: '#eab308' }} />
              <h2 style={{ fontSize: '1.4rem', color: 'var(--text-main)' }}>Chanda Pledges (Committed, Not Yet Paid)</h2>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Track donors who committed an amount, chase outstanding pledges, and convert them to real collections
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {pendingWithPhone.length > 0 && (
              <button onClick={() => setShowReminderQueue(true)} className="btn btn-whatsapp">
                <Bell size={16} /> Send Reminders ({pendingWithPhone.length})
              </button>
            )}
            <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
              <Plus size={16} /> Record New Pledge
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
        <div className="glass-card" style={{ padding: '16px' }}>
          <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>TOTAL PLEDGED</span>
          <h3 style={{ fontSize: '1.4rem', color: 'var(--text-main)', marginTop: '4px' }}>
            {group?.currency || '₹'}{totalPledged.toLocaleString('en-IN')}
          </h3>
        </div>
        <div className="glass-card" style={{ padding: '16px' }}>
          <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>COLLECTED FROM PLEDGES</span>
          <h3 style={{ fontSize: '1.4rem', color: '#34d399', marginTop: '4px' }}>
            {group?.currency || '₹'}{totalCollectedFromPledges.toLocaleString('en-IN')}
          </h3>
        </div>
        <div className="glass-card" style={{ padding: '16px', borderColor: totalOutstanding > 0 ? 'rgba(248, 113, 113, 0.4)' : 'var(--border-color)' }}>
          <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>OUTSTANDING</span>
          <h3 style={{ fontSize: '1.4rem', color: totalOutstanding > 0 ? '#f87171' : '#34d399', marginTop: '4px' }}>
            {group?.currency || '₹'}{totalOutstanding.toLocaleString('en-IN')}
          </h3>
        </div>
      </div>

      {/* Pending Pledges */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '1.05rem', color: 'var(--text-main)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Clock size={17} style={{ color: '#eab308' }} /> Pending / Partial ({pending.length})
        </h3>

        {pending.length === 0 ? (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>
            No outstanding pledges. Every committed donation has been fully collected!
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {pending.map(p => {
              const outstanding = Math.max(0, Number(p.pledgeAmount) - Number(p.collectedAmount || 0));
              return (
                <div key={p.id} className="glass-card-hover" style={{ padding: '14px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h4 style={{ fontSize: '0.95rem', color: 'var(--text-main)', fontWeight: 700 }}>{p.donorName}</h4>
                      {p.status === 'partial' && <span className="badge-pill badge-saffron" style={{ fontSize: '0.62rem' }}>Partially Paid</span>}
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {p.address && <span>{p.address} • </span>}{p.phone && <span>📞 {p.phone} • </span>}📅 {p.date}
                      {p.lastReminderSentAt && <span> • Last reminded {new Date(p.lastReminderSentAt).toLocaleDateString('en-IN')}</span>}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Outstanding</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f87171' }}>
                        {group?.currency || '₹'}{outstanding.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <button onClick={() => openPayModal(p)} className="btn btn-success" style={{ fontSize: '0.75rem', padding: '8px 10px' }} title="Mark as Paid">
                      <CheckCircle2 size={14} /> Paid
                    </button>
                    <button onClick={() => handleSendReminder(p)} style={{ background: 'none', border: 'none', color: '#25d366', cursor: 'pointer' }} title="Send WhatsApp Reminder">
                      <Share2 size={16} />
                    </button>
                    <button onClick={() => handleDeletePledge(p.id)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }} title="Delete Pledge">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Fulfilled Pledges */}
      {fulfilled.length > 0 && (
        <div className="glass-card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1.05rem', color: 'var(--text-main)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={17} style={{ color: '#34d399' }} /> Fulfilled ({fulfilled.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {fulfilled.map(p => (
              <div key={p.id} style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: 0.85 }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>{p.donorName}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34d399' }}>
                  {group?.currency || '₹'}{Number(p.pledgeAmount).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ADD PLEDGE MODAL */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.25rem' }}>Record New Chanda Pledge</h3>
              <button onClick={() => setShowAddModal(false)} className="btn btn-secondary btn-icon"><X size={18} /></button>
            </div>

            <form onSubmit={handleAddPledge}>
              <div className="form-group">
                <label className="form-label">Pledged Amount (₹) *</label>
                <input type="number" className="form-input" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-500)' }}
                  placeholder="e.g. 5000" value={pledgeAmount} onChange={e => setPledgeAmount(e.target.value)} required autoFocus />
              </div>

              <div className="form-group">
                <label className="form-label">Donor Full Name *</label>
                <input type="text" className="form-input" placeholder="e.g. K. Venkateshwara Rao" value={donorName} onChange={e => setDonorName(e.target.value)} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label className="form-label">Phone Number (WhatsApp)</label>
                  <input type="tel" className="form-input" placeholder="e.g. 9848022334" value={phone} onChange={e => setPhone(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Flat / Address</label>
                  <input type="text" className="form-input" placeholder="e.g. Flat 402" value={address} onChange={e => setAddress(e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Pledge Date</label>
                <input type="date" className="form-input" value={date} onChange={e => setDate(e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">Notes</label>
                <input type="text" className="form-input" placeholder="e.g. Promised after Aarti" value={notes} onChange={e => setNotes(e.target.value)} />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
                Save Pledge
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MARK AS PAID MODAL */}
      {showPayModal && (
        <div className="modal-overlay" onClick={() => setShowPayModal(null)}>
          <div className="modal-container" style={{ maxWidth: '420px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '4px' }}>Record Payment</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Confirm payment from <strong style={{ color: 'var(--text-main)' }}>{showPayModal.donorName}</strong> — this creates a real Chanda collection entry linked to this pledge.
            </p>

            <form onSubmit={handleConfirmPayment}>
              <div className="form-group">
                <label className="form-label">Amount Received (₹) *</label>
                <input type="number" className="form-input" style={{ fontSize: '1.2rem', fontWeight: 800, color: '#34d399' }}
                  value={payAmount} onChange={e => setPayAmount(e.target.value)} required autoFocus />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label className="form-label">Payment Mode</label>
                  <select className="form-select" value={payMode} onChange={e => setPayMode(e.target.value)}>
                    <option value="Cash">Cash</option>
                    <option value="UPI (GPay/PhonePe)">UPI (GPay / PhonePe / Paytm)</option>
                    <option value="Bank Transfer">Bank Transfer / Cheque</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Collected By</label>
                  <select className="form-select" value={payCollector} onChange={e => setPayCollector(e.target.value)}>
                    {(group?.members || ['Treasurer']).map(m => {
                      const name = typeof m === 'object' ? m.name : m;
                      return <option key={name} value={name}>{name}</option>;
                    })}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                <button type="button" onClick={() => setShowPayModal(null)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-success" style={{ flex: 1 }}>Confirm Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BULK REMINDER QUEUE MODAL */}
      {showReminderQueue && (
        <div className="modal-overlay" onClick={() => setShowReminderQueue(false)}>
          <div className="modal-container" style={{ maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <h3 style={{ fontSize: '1.15rem' }}>Send Pledge Reminders</h3>
              <button onClick={() => setShowReminderQueue(false)} className="btn btn-secondary btn-icon"><X size={16} /></button>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              WhatsApp doesn't allow silently sending messages from a website — tap "Send" per donor, confirm in WhatsApp, then come back for the next one.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '340px', overflowY: 'auto' }}>
              {pendingWithPhone.map(p => {
                const outstanding = Math.max(0, Number(p.pledgeAmount) - Number(p.collectedAmount || 0));
                return (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-input)' }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>{p.donorName}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Outstanding: {group?.currency || '₹'}{outstanding.toLocaleString('en-IN')}
                        {p.lastReminderSentAt && <span> • sent {new Date(p.lastReminderSentAt).toLocaleDateString('en-IN')}</span>}
                      </div>
                    </div>
                    <button onClick={() => handleSendReminder(p)} className="btn btn-whatsapp" style={{ fontSize: '0.75rem', padding: '7px 10px' }}>
                      <Send size={13} /> Send
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
