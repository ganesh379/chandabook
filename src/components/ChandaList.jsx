import React, { useState, useMemo } from 'react';
import { 
  Receipt, 
  Plus, 
  Trash2, 
  Search, 
  Filter, 
  Share2, 
  Smartphone, 
  Calendar,
  UserCheck,
  Printer
} from 'lucide-react';

export default function ChandaList({ group, onOpenAddChanda, onDeleteCollection, onViewReceipt }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [collectorFilter, setCollectorFilter] = useState('ALL');

  const collections = group?.collections || [];

  const filteredCollections = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return collections.filter(c => {
      const matchesSearch =
        (c.donorName || '').toLowerCase().includes(term) ||
        (c.receiptNo || '').toLowerCase().includes(term) ||
        (c.address || '').toLowerCase().includes(term) ||
        (c.phone || '').includes(searchTerm);

      const matchesPayment = paymentFilter === 'ALL' || c.paymentMode === paymentFilter;
      const matchesCollector = collectorFilter === 'ALL' || c.collectedBy === collectorFilter;

      return matchesSearch && matchesPayment && matchesCollector;
    }).sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  }, [collections, searchTerm, paymentFilter, collectorFilter]);

  const totalFilteredAmount = filteredCollections.reduce((sum, c) => sum + Number(c.amount), 0);

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Bar */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--text-main)' }}>Chanda Collection Ledger</h2>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Showing {filteredCollections.length} receipts (Total: <strong style={{ color: '#34d399' }}>{group?.currency || '₹'}{totalFilteredAmount.toLocaleString('en-IN')}</strong>)
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handlePrintPDF} className="btn btn-secondary no-print">
              <Printer size={16} /> Print / Save PDF
            </button>
            <button onClick={onOpenAddChanda} className="btn btn-primary no-print">
              <Plus size={16} /> + Record New Chanda
            </button>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="no-print" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          {/* Search Input */}
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text"
              className="form-input"
              style={{ paddingLeft: '36px' }}
              placeholder="Search donor name, receipt #, phone, flat..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Payment Mode Filter */}
          <select 
            className="form-select"
            value={paymentFilter}
            onChange={e => setPaymentFilter(e.target.value)}
          >
            <option value="ALL">All Payment Modes</option>
            <option value="Cash">Cash</option>
            <option value="UPI (GPay/PhonePe)">UPI (GPay / PhonePe)</option>
            <option value="Bank Transfer">Bank Transfer</option>
          </select>

          {/* Collector Filter */}
          <select 
            className="form-select"
            value={collectorFilter}
            onChange={e => setCollectorFilter(e.target.value)}
          >
            <option value="ALL">All Committee Collectors</option>
            {(group?.members || []).map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Ledger Records Table */}
      <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="responsive-table">
          <table>
            <thead>
              <tr>
                <th>Receipt #</th>
                <th>Donor Name & Address</th>
                <th>Amount</th>
                <th>Payment Mode</th>
                <th>Collector</th>
                <th>Date</th>
                <th className="no-print" style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCollections.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    <Receipt size={36} style={{ margin: '0 auto 8px auto', opacity: 0.5 }} />
                    <p>No donation collections found matching filters.</p>
                  </td>
                </tr>
              ) : (
                filteredCollections.map(c => (
                  <tr key={c.id}>
                    <td>
                      <span className="badge-pill badge-saffron" style={{ fontSize: '0.725rem', fontFamily: 'monospace' }}>
                        #{c.receiptNo}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{c.donorName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {c.address && <span>{c.address} • </span>}
                        {c.phone && <span>📞 {c.phone}</span>}
                      </div>
                    </td>
                    <td>
                      <strong style={{ color: '#34d399', fontSize: '1.05rem' }}>
                        {group?.currency || '₹'}{Number(c.amount).toLocaleString('en-IN')}
                      </strong>
                    </td>
                    <td>
                      <span className={`badge-pill ${c.paymentMode === 'Cash' ? 'badge-green' : 'badge-saffron'}`} style={{ fontSize: '0.7rem' }}>
                        {c.paymentMode}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>
                        {c.collectedBy || 'Unassigned'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {c.date}
                      </span>
                    </td>
                    <td className="no-print" style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                        <button 
                          onClick={() => onViewReceipt(c)}
                          className="btn btn-secondary"
                          style={{ fontSize: '0.75rem', padding: '5px 10px', gap: '4px' }}
                          title="View / Share WhatsApp Receipt"
                        >
                          <Share2 size={13} style={{ color: '#25d366' }} /> Receipt
                        </button>

                        <button 
                          onClick={() => onDeleteCollection(c.id)}
                          className="btn btn-danger btn-icon"
                          style={{ padding: '6px' }}
                          title="Delete Collection Entry"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
