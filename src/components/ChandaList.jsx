import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Share2, 
  Trash2, 
  Phone, 
  MapPin, 
  Coins, 
  FileText,
  UserCheck 
} from 'lucide-react';

export default function ChandaList({ 
  group, 
  onOpenAddChanda, 
  onDeleteCollection, 
  onViewReceipt 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCollector, setFilterCollector] = useState('ALL');
  const [filterPayment, setFilterPayment] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'amount' | 'name'

  const collections = group?.collections || [];

  // Filter & Search Logic
  const filtered = collections.filter(c => {
    const matchesSearch = 
      (c.donorName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.address || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.phone || '').includes(searchTerm) ||
      (c.receiptNo || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCollector = filterCollector === 'ALL' || c.collectedBy === filterCollector;
    const matchesPayment = filterPayment === 'ALL' || c.paymentMode.toLowerCase().includes(filterPayment.toLowerCase());

    return matchesSearch && matchesCollector && matchesPayment;
  }).sort((a, b) => {
    if (sortBy === 'amount') return Number(b.amount) - Number(a.amount);
    if (sortBy === 'name') return a.donorName.localeCompare(b.donorName);
    return new Date(b.date || 0) - new Date(a.date || 0);
  });

  const totalFilteredAmount = filtered.reduce((sum, c) => sum + Number(c.amount), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header & Controls */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--text-main)' }}>Chanda Collections Ledger</h2>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Showing {filtered.length} of {collections.length} total receipts (Total: <strong style={{ color: '#34d399' }}>{group?.currency || '₹'}{totalFilteredAmount.toLocaleString('en-IN')}</strong>)
            </p>
          </div>

          <button onClick={onOpenAddChanda} className="btn btn-primary">
            <Plus size={16} /> Record New Chanda
          </button>
        </div>

        {/* Search & Filters Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text"
              className="form-input"
              style={{ paddingLeft: '36px' }}
              placeholder="Search donor, flat no, phone..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Collector Filter */}
          <select 
            className="form-select"
            value={filterCollector}
            onChange={e => setFilterCollector(e.target.value)}
          >
            <option value="ALL">All Collectors / Members</option>
            {(group?.members || []).map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          {/* Payment Mode Filter */}
          <select 
            className="form-select"
            value={filterPayment}
            onChange={e => setFilterPayment(e.target.value)}
          >
            <option value="ALL">All Payment Modes</option>
            <option value="Cash">Cash Payments</option>
            <option value="UPI">UPI / GPay / PhonePe</option>
            <option value="Bank">Bank Transfer</option>
          </select>

          {/* Sort By */}
          <select 
            className="form-select"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
          >
            <option value="newest">Sort: Newest First</option>
            <option value="amount">Sort: Amount High → Low</option>
            <option value="name">Sort: Donor Name A → Z</option>
          </select>
        </div>
      </div>

      {/* Cards List / Ledger Table */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filtered.length === 0 ? (
          <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
            <Coins size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>No Chanda Records Found</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Try adjusting your search filters or click "Record New Chanda" to add a donation.
            </p>
          </div>
        ) : (
          filtered.map(c => (
            <div 
              key={c.id}
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
              {/* Left Details */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{
                  padding: '10px',
                  borderRadius: '12px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#34d399',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  textAlign: 'center',
                  minWidth: '60px'
                }}>
                  <div>{c.receiptNo}</div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 500, color: 'var(--text-muted)' }}>Receipt</div>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: '1.05rem', color: 'var(--text-main)', fontWeight: 700 }}>
                      {c.donorName}
                    </h3>
                    <span className="badge-pill badge-saffron" style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
                      {c.paymentMode}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px', flexWrap: 'wrap' }}>
                    {c.address && <span>📍 {c.address}</span>}
                    {c.phone && <span>📞 {c.phone}</span>}
                    <span>📅 {c.date}</span>
                  </p>

                  <p style={{ fontSize: '0.75rem', color: 'var(--primary-500)', marginTop: '2px' }}>
                    Collected by: <strong>{c.collectedBy || 'Committee'}</strong>
                    {c.notes && <span style={{ color: 'var(--text-muted)', marginLeft: '8px' }}>• {c.notes}</span>}
                  </p>
                </div>
              </div>

              {/* Right Amount & Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: 'auto' }}>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#34d399' }}>
                    {group?.currency || '₹'}{Number(c.amount).toLocaleString('en-IN')}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button 
                    onClick={() => onViewReceipt(c)}
                    className="btn btn-whatsapp"
                    style={{ fontSize: '0.78rem', padding: '8px 12px' }}
                    title="Send WhatsApp Receipt"
                  >
                    <Share2 size={14} /> Receipt
                  </button>

                  <button 
                    onClick={() => onDeleteCollection(c.id)}
                    className="btn btn-danger btn-icon"
                    title="Delete Receipt Entry"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
