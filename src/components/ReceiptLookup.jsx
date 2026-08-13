import React, { useState } from 'react';
import { X, Search, Receipt, Loader2, ShieldCheck } from 'lucide-react';
import { fetchGroupByCode } from '../firebase';
import ReceiptModal from './ReceiptModal';

export default function ReceiptLookup({ groupsList, onClose }) {
  const [code, setCode] = useState('');
  const [phone, setPhone] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);
  const [matchedGroup, setMatchedGroup] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setResults(null);

    const cleanCode = code.trim();
    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (!cleanCode || !cleanPhone) return;

    setIsSearching(true);
    try {
      let group = (groupsList || []).find(g => g.code === cleanCode);
      if (!group) {
        group = await fetchGroupByCode(cleanCode);
      }

      if (!group) {
        setError('No group found with that code. Please check with your committee.');
        setIsSearching(false);
        return;
      }

      const matches = (group.collections || []).filter(c => (c.phone || '').replace(/\D/g, '') === cleanPhone);
      setMatchedGroup(group);
      setResults(matches);
    } catch (err) {
      setError('Something went wrong while searching. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" style={{ maxWidth: '460px' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Receipt size={20} style={{ color: 'var(--primary-500)' }} />
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>Find My Donation Receipt</h3>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-icon"><X size={16} /></button>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
          No login needed. Enter the committee's 6-digit group code and the phone number you donated with.
        </p>

        <form onSubmit={handleSearch}>
          <div className="form-group">
            <label className="form-label">6-Digit Group Code</label>
            <input
              type="text"
              maxLength="6"
              className="form-input"
              placeholder="e.g. 884920"
              value={code}
              onChange={e => setCode(e.target.value)}
              style={{ fontSize: '1.15rem', letterSpacing: '0.15em', textAlign: 'center', fontWeight: 800 }}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number Used for Donation</label>
            <input
              type="tel"
              className="form-input"
              placeholder="e.g. 9848022334"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              required
            />
          </div>

          {error && (
            <p style={{ color: '#f87171', fontSize: '0.78rem', marginBottom: '10px' }}>{error}</p>
          )}

          <button type="submit" disabled={isSearching} className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
            {isSearching ? (
              <><Loader2 size={16} className="spin" /> Searching...</>
            ) : (
              <><Search size={16} /> Find My Receipts</>
            )}
          </button>
        </form>

        {results !== null && (
          <div style={{ marginTop: '18px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            {results.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                No receipts found for that phone number in this group yet.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldCheck size={13} /> Found {results.length} receipt{results.length !== 1 ? 's' : ''}
                </p>
                {results.map(c => (
                  <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-input)' }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>#{c.receiptNo}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{c.date} • {c.paymentMode}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontWeight: 800, color: '#34d399' }}>
                        {matchedGroup?.currency || '₹'}{Number(c.amount).toLocaleString('en-IN')}
                      </span>
                      <button onClick={() => setSelectedReceipt(c)} className="btn btn-secondary" style={{ fontSize: '0.72rem', padding: '6px 10px' }}>
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {selectedReceipt && matchedGroup && (
        <ReceiptModal collection={selectedReceipt} group={matchedGroup} onClose={() => setSelectedReceipt(null)} />
      )}
    </div>
  );
}
