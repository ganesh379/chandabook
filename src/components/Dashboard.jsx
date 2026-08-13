import React, { useMemo } from 'react';
import { 
  Coins, 
  Receipt, 
  Wallet, 
  Trophy, 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp, 
  Share2, 
  CalendarDays,
  Target
} from 'lucide-react';
import { computeGroupFinancials, FESTIVAL_TYPES } from '../utils/storage';

export default function Dashboard({ 
  group, 
  onOpenAddChanda, 
  onOpenAddExpense, 
  onSelectTab, 
  onViewReceipt 
}) {
  const financials = useMemo(() => computeGroupFinancials(group), [group]);
  const activeFestival = FESTIVAL_TYPES.find(f => f.id === group?.festivalType) || FESTIVAL_TYPES[0];

  const targetGoal = group?.targetGoal || 75000;
  const progressPercent = Math.min(100, Math.round((financials.totalCollected / targetGoal) * 100));

  // Top Collector
  const topCollector = financials.memberStats[0] || { name: 'None', total: 0 };

  // Recent 5 activities combined
  const combinedRecent = useMemo(() => {
    const collections = (group?.collections || []).map(c => ({ ...c, type: 'collection' }));
    const expenses = (group?.expenses || []).map(e => ({ ...e, type: 'expense' }));
    return [...collections, ...expenses]
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
      .slice(0, 5);
  }, [group]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Banner / Header Card */}
      <div className="glass-card" style={{
        padding: '24px',
        background: `linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(15, 23, 42, 0.9)), var(--bg-card)`,
        border: '1px solid rgba(245, 158, 11, 0.3)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge-pill badge-saffron">
                {activeFestival.icon} {activeFestival.name}
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Group Code: <strong style={{ color: 'var(--primary-500)' }}>{group?.code}</strong>
              </span>
            </div>
            <h2 style={{ fontSize: '1.6rem', color: 'var(--text-main)', margin: '4px 0' }}>
              {group?.name || 'Festival Committee'}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Real-time cash ledger & member donation tracker
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={onOpenAddChanda} className="btn btn-primary">
              <Plus size={16} /> Record Chanda
            </button>
            <button onClick={onOpenAddExpense} className="btn btn-secondary">
              <Plus size={16} /> Log Expense
            </button>
          </div>
        </div>

        {/* Target Goal Progress Bar */}
        <div style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
            <span style={{ color: 'var(--text-muted)' }}>
              Target Goal Progress ({group?.currency || '₹'}{financials.totalCollected.toLocaleString('en-IN')} / {group?.currency || '₹'}{targetGoal.toLocaleString('en-IN')})
            </span>
            <span style={{ fontWeight: 700, color: 'var(--primary-500)' }}>{progressPercent}%</span>
          </div>
          <div style={{
            height: '10px',
            background: 'var(--bg-input)',
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: `${progressPercent}%`,
              background: 'linear-gradient(90deg, var(--primary-500), #34d399)',
              borderRadius: 'var(--radius-full)',
              transition: 'width 0.4s ease'
            }} />
          </div>
        </div>
      </div>

      {/* Financial Metrics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '16px'
      }}>
        {/* Total Collected */}
        <div className="glass-card glass-card-hover" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL COLLECTED</span>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <Coins size={20} />
            </div>
          </div>
          <h3 style={{ fontSize: '1.8rem', color: '#34d399', margin: '10px 0 4px 0' }}>
            {group?.currency || '₹'}{financials.totalCollected.toLocaleString('en-IN')}
          </h3>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            From <strong style={{ color: 'var(--text-main)' }}>{financials.donorCount}</strong> donors across committee
          </div>
        </div>

        {/* Total Expenses */}
        <div className="glass-card glass-card-hover" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL EXPENSES</span>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(220, 38, 38, 0.15)', color: '#f87171' }}>
              <Receipt size={20} />
            </div>
          </div>
          <h3 style={{ fontSize: '1.8rem', color: '#f87171', margin: '10px 0 4px 0' }}>
            {group?.currency || '₹'}{financials.totalExpenses.toLocaleString('en-IN')}
          </h3>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Logged across <strong style={{ color: 'var(--text-main)' }}>{financials.expenseCount}</strong> expense items
          </div>
        </div>

        {/* Net Balance Cash in Hand */}
        <div className="glass-card glass-card-hover" style={{ 
          padding: '20px',
          background: 'rgba(245, 158, 11, 0.08)',
          borderColor: 'rgba(245, 158, 11, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.825rem', color: 'var(--primary-500)', fontWeight: 700 }}>NET CASH IN HAND</span>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'var(--primary-500)', color: '#0f172a' }}>
              <Wallet size={20} />
            </div>
          </div>
          <h3 style={{ fontSize: '1.8rem', color: 'var(--primary-500)', margin: '10px 0 4px 0' }}>
            {group?.currency || '₹'}{financials.netBalance.toLocaleString('en-IN')}
          </h3>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Available balance for upcoming expenses
          </div>
        </div>
      </div>

      {/* Member Leaderboard Spotlight & Quick Shortcuts */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px'
      }}>
        {/* Top Collectors Spotlight */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Trophy size={18} style={{ color: '#eab308' }} />
              <h3 style={{ fontSize: '1rem', color: 'var(--text-main)' }}>Volunteer Leaderboard</h3>
            </div>
            <button onClick={() => onSelectTab('leaderboard')} style={{ background: 'none', border: 'none', color: 'var(--primary-500)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
              View All →
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {financials.memberStats.slice(0, 3).map((m, idx) => (
              <div 
                key={m.name} 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-input)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: idx === 0 ? '#eab308' : idx === 1 ? '#94a3b8' : '#b45309',
                    color: '#0f172a',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    #{idx + 1}
                  </span>
                  <div>
                    <h4 style={{ fontSize: '0.875rem', color: 'var(--text-main)' }}>{m.name}</h4>
                    <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>{m.count} donations collected</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#34d399' }}>
                    {group?.currency || '₹'}{m.total.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions Feed */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-main)' }}>Recent Activity Feed</h3>
            <button onClick={() => onSelectTab('chanda')} style={{ background: 'none', border: 'none', color: 'var(--primary-500)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
              Full Ledger →
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {combinedRecent.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>
                No collections or expenses recorded yet.
              </p>
            ) : (
              combinedRecent.map(item => (
                <div 
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-input)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      padding: '6px',
                      borderRadius: '8px',
                      background: item.type === 'collection' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(220, 38, 38, 0.15)',
                      color: item.type === 'collection' ? '#34d399' : '#f87171'
                    }}>
                      {item.type === 'collection' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>
                        {item.type === 'collection' ? item.donorName : item.title}
                      </h4>
                      <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                        {item.type === 'collection' ? `By ${item.collectedBy}` : `Vendor: ${item.vendor}`} • {item.date}
                      </span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ 
                      fontSize: '0.9rem', 
                      fontWeight: 700, 
                      color: item.type === 'collection' ? '#34d399' : '#f87171' 
                    }}>
                      {item.type === 'collection' ? '+' : '-'}{group?.currency || '₹'}{Number(item.amount).toLocaleString('en-IN')}
                    </span>
                    {item.type === 'collection' && (
                      <button 
                        onClick={() => onViewReceipt(item)} 
                        title="View & Share WhatsApp Receipt"
                        style={{ background: 'none', border: 'none', color: '#25d366', cursor: 'pointer' }}
                      >
                        <Share2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
