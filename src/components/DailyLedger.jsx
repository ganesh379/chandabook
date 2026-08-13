import React from 'react';
import { 
  CalendarDays, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Printer, 
  Coins,
  Wallet 
} from 'lucide-react';
import { computeGroupFinancials } from '../utils/storage';

export default function DailyLedger({ group }) {
  const financials = computeGroupFinancials(group);
  const ledger = financials.dailyLedger;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Bar */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CalendarDays size={22} style={{ color: 'var(--primary-500)' }} />
              <h2 style={{ fontSize: '1.4rem', color: 'var(--text-main)' }}>Day-by-Day Financial Ledger</h2>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Daily closing balances and cash flow breakdown for festival auditing
            </p>
          </div>

          <button onClick={handlePrint} className="btn btn-secondary no-print">
            <Printer size={16} /> Print Audit Statement
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px'
      }}>
        <div className="glass-card" style={{ padding: '16px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL FESTIVAL DAYS</span>
          <h3 style={{ fontSize: '1.5rem', color: 'var(--text-main)', marginTop: '4px' }}>
            {ledger.length} Days Tracked
          </h3>
        </div>

        <div className="glass-card" style={{ padding: '16px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>CUMULATIVE COLLECTIONS</span>
          <h3 style={{ fontSize: '1.5rem', color: '#34d399', marginTop: '4px' }}>
            {group?.currency || '₹'}{financials.totalCollected.toLocaleString('en-IN')}
          </h3>
        </div>

        <div className="glass-card" style={{ padding: '16px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>CUMULATIVE EXPENSES</span>
          <h3 style={{ fontSize: '1.5rem', color: '#f87171', marginTop: '4px' }}>
            {group?.currency || '₹'}{financials.totalExpenses.toLocaleString('en-IN')}
          </h3>
        </div>

        <div className="glass-card" style={{ padding: '16px', background: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--primary-500)', fontWeight: 700 }}>FINAL CLOSING BALANCE</span>
          <h3 style={{ fontSize: '1.5rem', color: 'var(--primary-500)', marginTop: '4px' }}>
            {group?.currency || '₹'}{financials.netBalance.toLocaleString('en-IN')}
          </h3>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="glass-card printable-area" style={{ padding: '20px', overflowX: 'auto' }}>
        {ledger.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px' }}>
            No daily transactions recorded yet.
          </p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '12px' }}>Date</th>
                <th style={{ padding: '12px', color: '#34d399' }}>Collections (+)</th>
                <th style={{ padding: '12px', color: '#f87171' }}>Expenses (-)</th>
                <th style={{ padding: '12px' }}>Net Daily Cash Flow</th>
                <th style={{ padding: '12px', color: 'var(--primary-500)', textAlign: 'right' }}>Cumulative Closing Balance</th>
              </tr>
            </thead>
            <tbody>
              {ledger.map((row, idx) => (
                <tr key={row.date} style={{ 
                  borderBottom: '1px solid var(--border-color)',
                  background: idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.02)'
                }}>
                  <td style={{ padding: '14px', fontWeight: 700, color: 'var(--text-main)' }}>
                    📅 {row.date}
                  </td>
                  <td style={{ padding: '14px', color: '#34d399', fontWeight: 700 }}>
                    +{group?.currency || '₹'}{row.collected.toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '14px', color: '#f87171', fontWeight: 700 }}>
                    -{group?.currency || '₹'}{row.expensed.toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '14px', fontWeight: 700, color: row.dayNet >= 0 ? '#34d399' : '#f87171' }}>
                    {row.dayNet >= 0 ? '+' : ''}{group?.currency || '₹'}{row.dayNet.toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '14px', fontWeight: 800, color: 'var(--primary-500)', textAlign: 'right', fontSize: '1.05rem' }}>
                    {group?.currency || '₹'}{row.cumulativeBalance.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
