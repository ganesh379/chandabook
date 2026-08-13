import React, { useState } from 'react';
import { 
  Trophy, 
  Plus, 
  Share2, 
  Award, 
  Sparkles, 
  Trash2, 
  Flame,
  Crown 
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function LadduAuction({ group, onUpdateGroup }) {
  const [bidderName, setBidderName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const bids = [...(group?.ladduBids || [])].sort((a, b) => Number(b.bidAmount) - Number(a.bidAmount));
  const highestBid = bids[0] || null;

  const quickIncrements = [500, 1000, 5000, 10000];

  const handleAddBid = (e) => {
    e.preventDefault();
    const num = Number(bidAmount);
    if (!bidderName.trim() || !num || num <= 0) return;

    if (highestBid && num <= Number(highestBid.bidAmount)) {
      if (!window.confirm(`Notice: New bid (₹${num}) is lower than current highest bid (₹${highestBid.bidAmount}). Do you still want to record it?`)) {
        return;
      }
    }

    const newBid = {
      id: `bid-${Date.now()}`,
      bidderName: bidderName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      bidAmount: num,
      date: new Date().toISOString().split('T')[0]
    };

    // Confetti for new high bid
    if (!highestBid || num > Number(highestBid.bidAmount)) {
      try {
        confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
      } catch (err) {}
    }

    const updatedBids = [newBid, ...(group.ladduBids || [])];
    onUpdateGroup({
      ...group,
      ladduBids: updatedBids
    });

    setBidderName('');
    setPhone('');
    setAddress('');
    setBidAmount('');
    setShowAddModal(false);
  };

  const handleDeleteBid = (id) => {
    if (!window.confirm("Delete this auction bid?")) return;
    const updatedBids = (group.ladduBids || []).filter(b => b.id !== id);
    onUpdateGroup({
      ...group,
      ladduBids: updatedBids
    });
  };

  // WhatsApp Winner Certificate Share
  const handleShareWinner = (bid) => {
    const text = encodeURIComponent(
      `🥮 *GANESH FESTIVAL LADDU AUCTION WINNER* 🥮\n` +
      `*${group?.name || 'ChandaBook'}*\n` +
      `-----------------------------------\n` +
      `🏆 Winning Bidder: *${bid.bidderName}*\n` +
      (bid.address ? `Address: ${bid.address}\n` : '') +
      `💰 Winning Bid Amount: *${group?.currency || '₹'}${Number(bid.bidAmount).toLocaleString('en-IN')}*\n` +
      `📅 Date: ${bid.date}\n` +
      `-----------------------------------\n` +
      `🙏 *Hearty Congratulations! May Lord Ganesha shower supreme health, wealth & prosperity upon your family!* 🙏\n` +
      `ChandaBook Laddu Pattu Ledger`
    );

    const whatsappUrl = bid.phone 
      ? `https://api.whatsapp.com/send?phone=91${bid.phone.replace(/\D/g, '')}&text=${text}`
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
              <span style={{ fontSize: '1.6rem' }}>🥮</span>
              <h2 style={{ fontSize: '1.4rem', color: 'var(--text-main)' }}>Vinayaka Laddu Auction (Laddu Pattu)</h2>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Live bidder tracking, highest bid ticker, and winner certificate generator
            </p>
          </div>

          <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
            <Plus size={16} /> Place New Bid
          </button>
        </div>
      </div>

      {/* HIGHEST WINNING BIDDER SPOTLIGHT BANNER */}
      {highestBid ? (
        <div className="glass-card" style={{
          padding: '24px',
          background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.2), rgba(15, 23, 42, 0.95))',
          border: '2px solid #eab308',
          boxShadow: '0 0 25px rgba(234, 179, 8, 0.25)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span className="badge-pill badge-saffron" style={{ background: '#eab308', color: '#0f172a', fontWeight: 800 }}>
                  <Crown size={14} /> CURRENT HIGHEST BIDDER
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>📅 {highestBid.date}</span>
              </div>

              <h3 style={{ fontSize: '1.6rem', color: '#ffffff', fontWeight: 800 }}>
                {highestBid.bidderName}
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '2px' }}>
                {highestBid.address && <span>📍 {highestBid.address} • </span>}
                {highestBid.phone && <span>📞 {highestBid.phone}</span>}
              </p>
            </div>

            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', uppercase: true }}>HIGHEST BID AMOUNT</span>
                <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#34d399', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                  {group?.currency || '₹'}{Number(highestBid.bidAmount).toLocaleString('en-IN')}
                </div>
              </div>

              <button 
                onClick={() => handleShareWinner(highestBid)}
                className="btn btn-whatsapp"
                style={{ fontSize: '0.825rem', padding: '8px 14px' }}
              >
                <Share2 size={15} /> Share Winner Certificate
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-card" style={{ padding: '30px', textAlign: 'center' }}>
          <Flame size={36} style={{ color: 'var(--primary-500)', marginBottom: '8px' }} />
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>No Laddu Bids Placed Yet</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Click "Place New Bid" to start the live festival Laddu auction!
          </p>
        </div>
      )}

      {/* BIDDERS RANKING TABLE */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '14px' }}>
          All Auction Bids ({bids.length})
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {bids.map((bid, index) => {
            const isWinner = index === 0;
            return (
              <div 
                key={bid.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: isWinner ? 'rgba(234, 179, 8, 0.12)' : 'var(--bg-input)',
                  border: isWinner ? '1px solid #eab308' : '1px solid transparent'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: isWinner ? '#eab308' : 'var(--bg-card)',
                    color: isWinner ? '#0f172a' : 'var(--text-main)',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    #{index + 1}
                  </span>

                  <div>
                    <h4 style={{ fontSize: '0.95rem', color: 'var(--text-main)', fontWeight: 700 }}>
                      {bid.bidderName} {isWinner && '🏆'}
                    </h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {bid.address} • {bid.phone} • {bid.date}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.15rem', fontWeight: 800, color: isWinner ? '#34d399' : 'var(--text-main)' }}>
                    {group?.currency || '₹'}{Number(bid.bidAmount).toLocaleString('en-IN')}
                  </span>

                  <button 
                    onClick={() => handleShareWinner(bid)} 
                    style={{ background: 'none', border: 'none', color: '#25d366', cursor: 'pointer' }}
                    title="Share Winner Certificate"
                  >
                    <Share2 size={16} />
                  </button>

                  <button 
                    onClick={() => handleDeleteBid(bid.id)} 
                    style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}
                    title="Delete Bid"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PLACE NEW BID MODAL */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Place New Laddu Auction Bid</h3>

            <form onSubmit={handleAddBid}>
              {/* Quick Increments */}
              {highestBid && (
                <div className="form-group">
                  <label className="form-label">Current High: ₹{Number(highestBid.bidAmount).toLocaleString('en-IN')}</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {quickIncrements.map(inc => {
                      const newTarget = Number(highestBid.bidAmount) + inc;
                      return (
                        <button
                          key={inc}
                          type="button"
                          onClick={() => setBidAmount(newTarget.toString())}
                          className="chip-btn"
                        >
                          +₹{inc.toLocaleString('en-IN')} (₹{newTarget.toLocaleString('en-IN')})
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Bid Amount (₹) *</label>
                <input 
                  type="number"
                  className="form-input"
                  style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-500)' }}
                  placeholder="e.g. 25116"
                  value={bidAmount}
                  onChange={e => setBidAmount(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label">Bidder Full Name *</label>
                <input 
                  type="text"
                  className="form-input"
                  placeholder="e.g. K. Venkateshwara Rao"
                  value={bidderName}
                  onChange={e => setBidderName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input 
                    type="tel"
                    className="form-input"
                    placeholder="e.g. 9848022334"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Flat / Address</label>
                  <input 
                    type="text"
                    className="form-input"
                    placeholder="e.g. Flat 402 Sri Sai Towers"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Submit Bid
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
