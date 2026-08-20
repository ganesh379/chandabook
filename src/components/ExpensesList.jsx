import React, { useState, useEffect, useMemo } from 'react';
import { 
  Receipt, 
  Plus, 
  Trash2, 
  Search, 
  Printer, 
  X 
} from 'lucide-react';
import { EXPENSE_CATEGORIES } from '../utils/storage';

export default function ExpensesList({ group, onAddExpense, onDeleteExpense, autoOpenAddModal, onResetAutoOpen, isAdmin }) {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Add Expense form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('idol');
  const [vendor, setVendor] = useState('');
  const [amount, setAmount] = useState('');
  const [spentBy, setSpentBy] = useState(group?.members?.[0] || 'Suresh (President)');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (autoOpenAddModal) {
      setShowAddModal(true);
      if (onResetAutoOpen) onResetAutoOpen();
    }
  }, [autoOpenAddModal]);

  const expenses = group?.expenses || [];

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return expenses.filter(e => {
      const matchesCat = activeCategory === 'ALL' || e.category === activeCategory;
      const matchesSearch =
        (e.title || '').toLowerCase().includes(term) ||
        (e.vendor || '').toLowerCase().includes(term) ||
        (e.notes || '').toLowerCase().includes(term);

      return matchesCat && matchesSearch;
    }).sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  }, [expenses, activeCategory, searchTerm]);

  const totalFilteredExpenses = filtered.reduce((sum, e) => sum + Number(e.amount), 0);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!title.trim() || !numAmount || numAmount <= 0) return;

    const newExp = {
      id: `exp-${Date.now()}`,
      category,
      title: title.trim(),
      vendor: vendor.trim() || 'General Vendor',
      amount: numAmount,
      spentBy,
      date,
      notes: notes.trim()
    };

    onAddExpense(newExp);

    // Reset Form
    setTitle('');
    setVendor('');
    setAmount('');
    setNotes('');
    setShowAddModal(false);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Bar */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--text-main)' }}>Festival Daily Expenses Log</h2>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Showing {filtered.length} expenses (Total: <strong style={{ color: '#f87171' }}>{group?.currency || '₹'}{totalFilteredExpenses.toLocaleString('en-IN')}</strong>)
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handlePrintPDF} className="btn btn-secondary no-print">
              <Printer size={16} /> Print / Save PDF
            </button>
            <button onClick={() => setShowAddModal(true)} className="btn btn-primary no-print">
              <Plus size={16} /> Log New Expense
            </button>
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="no-print" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
          <button
            onClick={() => setActiveCategory('ALL')}
            className={`chip-btn ${activeCategory === 'ALL' ? 'active' : ''}`}
          >
            All Categories
          </button>
          {EXPENSE_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`chip-btn ${activeCategory === cat.id ? 'active' : ''}`}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="no-print" style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text"
            className="form-input"
            style={{ paddingLeft: '36px' }}
            placeholder="Search expense item, vendor name, notes..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Expenses Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filtered.length === 0 ? (
          <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
            <Receipt size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>No Expense Logs Found</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Click "Log New Expense" to add festival costs like Idol, Pandal, Pooja, audio, or food.
            </p>
          </div>
        ) : (
          filtered.map(exp => {
            const catObj = EXPENSE_CATEGORIES.find(c => c.id === exp.category) || EXPENSE_CATEGORIES[7];
            return (
              <div 
                key={exp.id}
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
                    fontSize: '1.6rem',
                    padding: '10px',
                    borderRadius: '12px',
                    background: 'rgba(220, 38, 38, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {catObj.icon}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 style={{ fontSize: '1.05rem', color: 'var(--text-main)', fontWeight: 700 }}>
                        {exp.title}
                      </h3>
                      <span className="badge-pill badge-red" style={{ fontSize: '0.65rem' }}>
                        {catObj.label}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Vendor: <strong style={{ color: 'var(--text-main)' }}>{exp.vendor}</strong> • Paid by: {exp.spentBy || 'Committee'} • 📅 {exp.date}
                    </p>

                    {exp.notes && (
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Note: {exp.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: 'auto' }}>
                  <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f87171' }}>
                    -{group?.currency || '₹'}{Number(exp.amount).toLocaleString('en-IN')}
                  </span>

                  {isAdmin && (
                    <button 
                      onClick={() => onDeleteExpense(exp.id)}
                      className="btn btn-danger btn-icon no-print"
                      title="Delete Expense Record"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ADD EXPENSE MODAL */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.25rem' }}>Log New Expense</h2>
              <button onClick={() => setShowAddModal(false)} className="btn btn-secondary btn-icon">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit}>
              <div className="form-group">
                <label className="form-label">Expense Title / Item Name *</label>
                <input 
                  type="text"
                  className="form-input"
                  placeholder="e.g. 9ft Clay Vinayaka Prathima, Pandal Stage Decor"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select 
                    className="form-select"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                  >
                    {EXPENSE_CATEGORIES.map(c => (
                      <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Amount (₹) *</label>
                  <input 
                    type="number"
                    className="form-input"
                    placeholder="e.g. 14000"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label className="form-label">Vendor / Store Name</label>
                  <input 
                    type="text"
                    className="form-input"
                    placeholder="e.g. Shri Ram Tent House"
                    value={vendor}
                    onChange={e => setVendor(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Paid By (Member)</label>
                  <select 
                    className="form-select"
                    value={spentBy}
                    onChange={e => setSpentBy(e.target.value)}
                  >
                    {(group?.members || ['Suresh (President)']).map(m => (
                      <option key={typeof m === 'object' ? m.name : m} value={typeof m === 'object' ? m.name : m}>
                        {typeof m === 'object' ? m.name : m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Expense Date</label>
                <input 
                  type="date"
                  className="form-input"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Notes / Payment Ref</label>
                <input 
                  type="text"
                  className="form-input"
                  placeholder="e.g. Paid via GPay Ref #12345"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', marginTop: '10px' }}>
                Save Expense Record
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
