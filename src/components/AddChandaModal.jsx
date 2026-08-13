import React, { useState } from 'react';
import { X, Sparkles, Share2, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { generateNextReceiptNo } from '../utils/storage';

export default function AddChandaModal({ group, onAddCollection, onClose, onViewReceipt }) {
  const [donorName, setDonorName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [collectedBy, setCollectedBy] = useState(group?.members?.[0] || 'Rahul (Treasurer)');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [openReceiptAfterSave, setOpenReceiptAfterSave] = useState(true);
  const [autoSendWhatsApp, setAutoSendWhatsApp] = useState(true);

  const quickAmounts = [116, 501, 1116, 2016, 5016, 10016];

  // Opens WhatsApp with a pre-filled thank-you text receipt. This is the
  // closest an unauthenticated static site can get to "auto-send" — WhatsApp
  // doesn't allow a website to silently deliver a message on someone's
  // behalf, so the donor's phone opens with one tap left to hit send.
  const sendWhatsAppTextReceipt = (collection) => {
    if (!collection.phone) return;
    const text = encodeURIComponent(
      `🙏 *CHANDA DONATION RECEIVED* 🙏\n` +
      `*${group?.name || 'ChandaBook'}*\n` +
      `-----------------------------------\n` +
      `Dear *${collection.donorName}*,\n` +
      `Thank you for your generous contribution!\n\n` +
      `🧾 Receipt No: *${collection.receiptNo}*\n` +
      `💰 Amount: *${group?.currency || '₹'}${Number(collection.amount).toLocaleString('en-IN')}*\n` +
      `📅 Date: ${collection.date}\n` +
      `-----------------------------------\n` +
      `🙏 *May Lord Ganesha bless your family with health & prosperity!* 🙏\n` +
      `ChandaBook Digital Receipt`
    );
    window.open(`https://api.whatsapp.com/send?phone=91${collection.phone.replace(/\D/g, '')}&text=${text}`, '_blank');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!donorName.trim() || !numAmount || numAmount <= 0) return;

    const receiptNo = generateNextReceiptNo(group);

    const newCollection = {
      id: `col-${Date.now()}`,
      receiptNo,
      donorName: donorName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      amount: numAmount,
      paymentMode,
      collectedBy,
      date,
      notes: notes.trim()
    };

    // Confetti Celebration
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (e) {}

    onAddCollection(newCollection);

    if (autoSendWhatsApp && newCollection.phone) {
      sendWhatsAppTextReceipt(newCollection);
    }

    if (openReceiptAfterSave) {
      onViewReceipt(newCollection);
    }

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <span className="badge-pill badge-saffron" style={{ fontSize: '0.68rem', marginBottom: '4px' }}>
              Receipt No: {generateNextReceiptNo(group)}
            </span>
            <h2 style={{ fontSize: '1.3rem', color: 'var(--text-main)' }}>Record Chanda Donation</h2>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-icon">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Quick Amount Chips */}
          <div className="form-group">
            <label className="form-label">Auspicious Preset Amounts (₹)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {quickAmounts.map(a => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAmount(a.toString())}
                  className={`chip-btn ${amount === a.toString() ? 'active' : ''}`}
                >
                  +₹{a.toLocaleString('en-IN')}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Donation Amount (₹) *</label>
            <input 
              type="number"
              className="form-input"
              style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-500)' }}
              placeholder="e.g. 1116"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Donor Full Name *</label>
            <input 
              type="text"
              className="form-input"
              placeholder="e.g. K. Venkateshwara Rao"
              value={donorName}
              onChange={e => setDonorName(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label">Phone Number (WhatsApp)</label>
              <input 
                type="tel"
                className="form-input"
                placeholder="e.g. 9848022334"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Flat / House / Address</label>
              <input 
                type="text"
                className="form-input"
                placeholder="e.g. Flat 402 Lotus Apts"
                value={address}
                onChange={e => setAddress(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label">Payment Mode</label>
              <select 
                className="form-select"
                value={paymentMode}
                onChange={e => setPaymentMode(e.target.value)}
              >
                <option value="Cash">Cash</option>
                <option value="UPI (GPay/PhonePe)">UPI (GPay / PhonePe / Paytm)</option>
                <option value="Bank Transfer">Bank Transfer / Cheque</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Collected By (Member)</label>
              <select 
                className="form-select"
                value={collectedBy}
                onChange={e => setCollectedBy(e.target.value)}
              >
                {(group?.members || ['Rahul (Treasurer)']).map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Collection Date</label>
            <input 
              type="date"
              className="form-input"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Optional Notes</label>
            <input 
              type="text"
              className="form-input"
              placeholder="e.g. Annadhanam Special Sponsor"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          {phone.trim() && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <input
                type="checkbox"
                id="autoWhatsAppCheck"
                checked={autoSendWhatsApp}
                onChange={e => setAutoSendWhatsApp(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: '#25d366' }}
              />
              <label htmlFor="autoWhatsAppCheck" style={{ fontSize: '0.8rem', color: 'var(--text-main)', cursor: 'pointer' }}>
                📱 Auto-open WhatsApp with thank-you text receipt on save
              </label>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <input
              type="checkbox"
              id="openReceiptCheck"
              checked={openReceiptAfterSave}
              onChange={e => setOpenReceiptAfterSave(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: 'var(--primary-500)' }}
            />
            <label htmlFor="openReceiptCheck" style={{ fontSize: '0.8rem', color: 'var(--text-main)', cursor: 'pointer' }}>
              Auto-open Digital Receipt card for WhatsApp sharing
            </label>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
            Save Donation & Generate Receipt
          </button>
        </form>
      </div>
    </div>
  );
}
