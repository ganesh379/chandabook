import React from 'react';
import { 
  LayoutDashboard, 
  Trophy, 
  Coins, 
  Receipt, 
  CalendarDays, 
  Utensils,
  Settings 
} from 'lucide-react';

export default function MobileBottomNav({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'leaderboard', label: 'Members', icon: Trophy },
    { id: 'chanda', label: 'Chanda', icon: Coins },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'prasadam', label: 'Prasadam', icon: Utensils },
    { id: 'ledger', label: 'Ledger', icon: CalendarDays },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
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
      padding: '4px 2px'
    }}>
      <div style={{
        maxWidth: '650px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around'
      }}>
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: 'none',
                border: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
                padding: '4px 6px',
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
  );
}
