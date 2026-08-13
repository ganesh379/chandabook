import React, { useState, useEffect, useMemo } from 'react';
import { ShieldCheck, Target, Loader2, AlertTriangle, Smartphone, ExternalLink } from 'lucide-react';
import { fetchGroupByCode } from '../firebase';
import { computeGroupFinancials, computeExpenseCategoryBreakdown, FESTIVAL_TYPES } from '../utils/storage';
import { DonutChart } from './Charts';

// Public, read-only, no-login-required transparency report for a group.
// Deliberately strips donor phone numbers / addresses before anything renders.
export default function TransparencyPage({ code, groupsList }) {
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const local = (groupsList || []).find(g => g.code === code);
      if (local) {
        setGroup(local);
        setLoading(false);
        return;
      }
      const remote = await fetchGroupByCode(code);
      if (cancelled) return;
      if (remote) {
        setGroup(remote);
      } else {
        setNotFound(true);
      }
      setLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, [code]);

  const financials = useMemo(() => computeGroupFinancials(group), [group]);
  const categoryBreakdown = useMemo(() => computeExpenseCategoryBreakdown(group), [group]);

  const topContributors = useMemo(() => {
    if (!group) return [];
    const byDonor = {};
    (group.collections || []).forEach(c => {
      const name = c.donorName || 'Anonymous';
      byDonor[name] = (byDonor[name] || 0) + (Number(c.amount) || 0);
    });
    return Object.entries(byDonor)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 15);
  }, [group]);

  const activeFestival = FESTIVAL_TYPES.find(f => f.id === group?.festivalType) || FESTIVAL_TYPES[0];
  const targetGoal = group?.targetGoal || 75000;
  const progressPercent = Math.min(100, Math.round((financials.totalCollected / targetGoal) * 100));
  const currency = group?.currency || '₹';

  const upiPayLink = group?.upiId
    ? `upi://pay?pa=${encodeURIComponent(group.upiId)}&pn=${encodeURIComponent(group.name || 'ChandaBook')}&cu=INR`
    : null;

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={28} className="spin" style={{ color: 'var(--primary-500)' }} />
      </div>
    );
  }

  if (notFound || !group) {
    return (
      <div style={{ maxWidth: '480px', margin: '60px auto', textAlign: 'center' }} className="glass-card">
        <div style={{ padding: '32px 24px' }}>
          <AlertTriangle size={36} style={{ color: '#f87171', marginBottom: '12px' }} />
          <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main)' }}>Report Not Found</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            No public group matches code "{code}". Please check the link with your committee.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px 14px 60px 14px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', padding: '10px 0' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: '20px', background: 'rgba(52, 211, 153, 0.12)', border: '1px solid rgba(52, 211, 153, 0.3)', color: '#34d399', fontSize: '0.75rem', fontWeight: 700, marginBottom: '10px' }}>
          <ShieldCheck size={13} /> Public Transparency Report — Read Only
        </div>
        <h1 style={{ fontSize: '1.5rem', color: 'var(--text-main)', fontWeight: 800 }}>
          {group.name}
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {activeFestival.icon} {activeFestival.name}
        </p>
      </div>

      {/* Progress Card */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
          <span style={{ color: 'var(--text-muted)' }}>
            <Target size={13} style={{ verticalAlign: '-2px' }} /> Goal Progress ({currency}{financials.totalCollected.toLocaleString('en-IN')} / {currency}{targetGoal.toLocaleString('en-IN')})
          </span>
          <span style={{ fontWeight: 700, color: 'var(--primary-500)' }}>{progressPercent}%</span>
        </div>
        <div style={{ height: '10px', background: 'var(--bg-input)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progressPercent}%`, background: 'linear-gradient(90deg, var(--primary-500), #34d399)', borderRadius: 'var(--radius-full)' }} />
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        <div className="glass-card" style={{ padding: '18px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Collected</span>
          <h3 style={{ fontSize: '1.5rem', color: '#34d399', marginTop: '4px' }}>{currency}{financials.totalCollected.toLocaleString('en-IN')}</h3>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>From {financials.donorCount} donors</span>
        </div>
        <div className="glass-card" style={{ padding: '18px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Expenses</span>
          <h3 style={{ fontSize: '1.5rem', color: '#f87171', marginTop: '4px' }}>{currency}{financials.totalExpenses.toLocaleString('en-IN')}</h3>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{financials.expenseCount} expense items</span>
        </div>
        <div className="glass-card" style={{ padding: '18px', background: 'rgba(245, 158, 11, 0.08)' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--primary-500)', fontWeight: 700, textTransform: 'uppercase' }}>Net Cash In Hand</span>
          <h3 style={{ fontSize: '1.5rem', color: 'var(--primary-500)', marginTop: '4px' }}>{currency}{financials.netBalance.toLocaleString('en-IN')}</h3>
        </div>
      </div>

      {/* Donate CTA */}
      {upiPayLink && (
        <a href={upiPayLink} className="btn btn-primary" style={{ padding: '14px', textDecoration: 'none' }}>
          <Smartphone size={18} /> Donate via UPI ({group.upiId})
        </a>
      )}

      {/* Expense Breakdown */}
      {categoryBreakdown.length > 0 && (
        <div className="glass-card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1.05rem', color: 'var(--text-main)', marginBottom: '16px' }}>Where the Money Went</h3>
          <DonutChart
            data={categoryBreakdown.map(c => ({ id: c.id, label: c.label, icon: c.icon, color: c.color, amount: c.amount, percent: c.percent }))}
            currency={currency}
            centerLabel="EXPENSES"
          />
        </div>
      )}

      {/* Top Contributors — names & amounts only, never phone/address */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '1.05rem', color: 'var(--text-main)', marginBottom: '14px' }}>Contributors</h3>
        {topContributors.length === 0 ? (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '10px' }}>No donations recorded yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {topContributors.map(c => (
              <div key={c.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-input)', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-main)' }}>{c.name}</span>
                <span style={{ fontWeight: 700, color: '#34d399' }}>{currency}{c.amount.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        )}
        <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '12px', textAlign: 'center' }}>
          Phone numbers and addresses are private and never shown on this public report.
        </p>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '20px 0 0 0' }}>
        <a href="/" style={{ fontSize: '0.8rem', color: 'var(--primary-500)', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <ExternalLink size={13} /> Open Full ChandaBook App
        </a>
      </div>
    </div>
  );
}
