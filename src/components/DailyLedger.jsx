import React, { useMemo } from 'react';
import { 
  BookOpen, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Printer, 
  ArrowUpRight, 
  ArrowDownRight,
  Wallet
} from 'lucide-react';
import { computeGroupFinancials } from '../utils/storage';

export default function DailyLedger({ group }) {
  const financials = useMemo(() => computeGroupFinancials(group), [group]);
  const dailyLedger = financials.dailyLedger;

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Bar */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--text-main)', fontWeight: 800 }}>
              Day-by-Day Cash Flow Ledger
            </h2>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Complete chronological ledger showing daily collections, daily expenses & closing balances
            </p>
          </div>

          <button onClick={handlePrintPDF} className="btn btn-secondary no-print">
            <Printer size={16} /> Print / Save PDF
          </button>
        </div>
      </div>

      {/* Financial Summary Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
        <div className="glass-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
            <TrendingUp size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>TOTAL COLLECTIONS</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34d399' }}>
              {group?.currency || '₹'}{financials.totalCollected.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>
            <TrendingDown size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>TOTAL EXPENSES</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f87171' }}>
              {group?.currency || '₹'}{financials.totalExpenses.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            <Wallet size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>CLOSING BALANCE</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: financials.netBalance >= 0 ? '#34d399' : '#f87171' }}>
              {group?.currency || '₹'}{financials.netBalance.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="responsive-table">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Daily Collections (+)</th>
                <th>Daily Expenses (-)</th>
                <th>Day Net Cash Flow</th>
                <th>Cumulative Balance</th>
              </tr>
            </thead>
            <tbody>
              {dailyLedger.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    <BookOpen size={36} style={{ margin: '0 auto 8px auto', opacity: 0.5 }} />
                    <p>No transaction history recorded yet.</p>
                  </td>
                </tr>
              ) : (
                dailyLedger.map(day => (
                  <tr key={day.date}>
                    <td>
                      <strong style={{ color: 'var(--text-main)' }}>📅 {day.date}</strong>
                    </td>
                    <td>
                      <span style={{ color: '#34d399', fontWeight: 700 }}>
                        +{group?.currency || '₹'}{day.collected.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: '#f87171', fontWeight: 700 }}>
                        -{group?.currency || '₹'}{day.expensed.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td>
                      <span style={{ 
                        fontWeight: 800, 
                        color: day.dayNet >= 0 ? '#34d399' : '#f87171',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        {day.dayNet >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {group?.currency || '₹'}{day.dayNet.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td>
                      <strong style={{ 
                        fontSize: '1rem', 
                        color: day.cumulativeBalance >= 0 ? '#34d399' : '#f87171' 
                      }}>
                        {group?.currency || '₹'}{day.cumulativeBalance.toLocaleString('en-IN')}
                      </strong>
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
