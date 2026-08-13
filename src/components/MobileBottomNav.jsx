import React, { useState } from 'react';
import {
  LayoutDashboard,
  Coins,
  Receipt,
  HandCoins,
  MoreHorizontal,
  Trophy,
  Utensils,
  Gavel,
  PieChart,
  CalendarDays,
  Settings,
  X
} from 'lucide-react';

const PRIMARY_TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'chanda', label: 'Chanda', icon: Coins },
  { id: 'expenses', label: 'Expenses', icon: Receipt },
  { id: 'pledges', label: 'Pledges', icon: HandCoins }
];

const MORE_TABS = [
  { id: 'leaderboard', label: 'Members', icon: Trophy },
  { id: 'prasadam', label: 'Prasadam', icon: Utensils },
  { id: 'auction', label: 'Laddu Auction', icon: Gavel },
  { id: 'analytics', label: 'Analytics', icon: PieChart },
  { id: 'ledger', label: 'Daily Ledger', icon: CalendarDays },
  { id: 'settings', label: 'Settings', icon: Settings }
];

export default function MobileBottomNav({ activeTab, setActiveTab }) {
  const [showMore, setShowMore] = useState(false);
  const isMoreActive = MORE_TABS.some(t => t.id === activeTab);

  const barTabs = [...PRIMARY_TABS, { id: '__more', label: 'More', icon: MoreHorizontal }];

  return (
    <>
      <nav className="no-print" style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid var(--border-color)',
        zIndex: 90,
        padding: '4px 2px',
        paddingBottom: 'calc(4px + env(safe-area-inset-bottom, 0px))'
      }}>
        <div style={{
          maxWidth: '650px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around'
        }}>
          {barTabs.map(tab => {
            const Icon = tab.icon;
            const isMore = tab.id === '__more';
            const isActive = isMore ? isMoreActive : activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => (isMore ? setShowMore(true) : setActiveTab(tab.id))}
                style={{
                  background: 'none',
                  border: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px',
                  padding: '6px 8px',
                  minWidth: '48px',
                  minHeight: '48px',
                  borderRadius: '6px',
                  color: isActive ? 'var(--primary-500)' : 'var(--text-muted)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.65rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 1.8} />
                  {isActive && (
                    <span style={{
                      position: 'absolute',
                      top: '-4px',
                      width: '4px',
                      height: '4px',
                      borderRadius: '50%',
                      background: 'var(--primary-500)'
                    }} />
                  )}
                </div>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* MORE SHEET */}
      {showMore && (
        <div className="modal-overlay no-print" onClick={() => setShowMore(false)} style={{ alignItems: 'flex-end' }}>
          <div
            className="modal-container"
            style={{ maxWidth: '650px', width: '100%', borderRadius: '20px 20px 0 0', maxHeight: '75vh' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)' }}>More Sections</h3>
              <button onClick={() => setShowMore(false)} className="btn btn-secondary btn-icon"><X size={16} /></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(96px, 1fr))', gap: '12px' }}>
              {MORE_TABS.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); setShowMore(false); }}
                    className="glass-card glass-card-hover"
                    style={{
                      padding: '18px 8px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                      border: isActive ? '1px solid var(--primary-500)' : '1px solid var(--border-color)',
                      background: isActive ? 'rgba(245, 158, 11, 0.1)' : 'var(--bg-card)',
                      cursor: 'pointer',
                      minHeight: '80px'
                    }}
                  >
                    <Icon size={22} style={{ color: isActive ? 'var(--primary-500)' : 'var(--text-main)' }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)', textAlign: 'center' }}>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
