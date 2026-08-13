// Production Storage & Financial Calculation Manager for ChandaBook

const STORAGE_KEY_GROUPS = 'chandabook_groups';
const STORAGE_KEY_ACTIVE_GROUP = 'chandabook_active_group_id';

export const FESTIVAL_TYPES = [
  { id: 'vinayaka_chavithi', name: 'Vinayaka Chavithi (Ganesh Chaturthi)', icon: '🕉️', color: '#f59e0b', defaultGoal: 75000 },
  { id: 'durga_puja', name: 'Durga Puja / Navratri Utsav', icon: '🌺', color: '#dc2626', defaultGoal: 100000 },
  { id: 'diwali', name: 'Diwali Celebration', icon: '🕯️', color: '#7e22ce', defaultGoal: 50000 },
  { id: 'sankranti', name: 'Sankranti / Pongal Festival', icon: '🌾', color: '#059669', defaultGoal: 40000 },
  { id: 'temple_event', name: 'Temple Chanda & Devotional Utsav', icon: '🚩', color: '#b45309', defaultGoal: 60000 },
  { id: 'custom', name: 'Custom Festival / Colony Celebration', icon: '🎨', color: '#2563eb', defaultGoal: 50000 }
];

export const EXPENSE_CATEGORIES = [
  { id: 'idol', label: 'Idol / Prathima', icon: '🕉️', color: '#f59e0b' },
  { id: 'pandal', label: 'Pandal & Tent Decor', icon: '🎪', color: '#ec4899' },
  { id: 'pooja', label: 'Pooja & Prasadam', icon: '🪔', color: '#eab308' },
  { id: 'audio', label: 'Audio / DJ / Devotional', icon: '🔊', color: '#8b5cf6' },
  { id: 'lighting', label: 'Electricity & Lighting', icon: '💡', color: '#06b6d4' },
  { id: 'nimajjanam', label: 'Nimajjanam / Immersion', icon: '🚌', color: '#10b981' },
  { id: 'printing', label: 'Printing & Banners', icon: '📜', color: '#64748b' },
  { id: 'misc', label: 'Miscellaneous', icon: '📦', color: '#94a3b8' }
];

// Production Load Groups (Zero Dummy Data)
export const loadAllGroups = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_GROUPS);
    if (!raw) {
      return {};
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("Storage error:", e);
    return {};
  }
};

export const saveAllGroups = (groupsMap) => {
  try {
    localStorage.setItem(STORAGE_KEY_GROUPS, JSON.stringify(groupsMap));
  } catch (e) {
    console.error("Failed to save groups to localStorage:", e);
  }
};

export const getActiveGroupId = () => {
  return localStorage.getItem(STORAGE_KEY_ACTIVE_GROUP) || null;
};

export const setActiveGroupId = (groupId) => {
  if (groupId) {
    localStorage.setItem(STORAGE_KEY_ACTIVE_GROUP, groupId);
  } else {
    localStorage.removeItem(STORAGE_KEY_ACTIVE_GROUP);
  }
};

// Financial Calculations Helper
export const computeGroupFinancials = (group) => {
  if (!group) return { totalCollected: 0, totalExpenses: 0, netBalance: 0, memberStats: [], dailyLedger: [] };

  const collections = group.collections || [];
  const expenses = group.expenses || [];

  const totalCollected = collections.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const netBalance = totalCollected - totalExpenses;

  // Member Leaderboard Calculation
  const memberMap = {};
  (group.members || []).forEach(m => {
    memberMap[m] = { name: m, total: 0, count: 0 };
  });

  collections.forEach(c => {
    const collector = c.collectedBy || 'Unassigned';
    if (!memberMap[collector]) {
      memberMap[collector] = { name: collector, total: 0, count: 0 };
    }
    memberMap[collector].total += (Number(c.amount) || 0);
    memberMap[collector].count += 1;
  });

  const memberStats = Object.values(memberMap).sort((a, b) => b.total - a.total);

  // Day-by-Day Cash Flow Ledger Calculation
  const dateMap = {};
  collections.forEach(c => {
    const d = c.date || new Date().toISOString().split('T')[0];
    if (!dateMap[d]) dateMap[d] = { date: d, collected: 0, expensed: 0 };
    dateMap[d].collected += Number(c.amount) || 0;
  });

  expenses.forEach(e => {
    const d = e.date || new Date().toISOString().split('T')[0];
    if (!dateMap[d]) dateMap[d] = { date: d, collected: 0, expensed: 0 };
    dateMap[d].expensed += Number(e.amount) || 0;
  });

  const sortedDates = Object.keys(dateMap).sort();
  let cumulative = 0;
  const dailyLedger = sortedDates.map(d => {
    const dayData = dateMap[d];
    const dayNet = dayData.collected - dayData.expensed;
    cumulative += dayNet;
    return {
      date: d,
      collected: dayData.collected,
      expensed: dayData.expensed,
      dayNet,
      cumulativeBalance: cumulative
    };
  });

  return {
    totalCollected,
    totalExpenses,
    netBalance,
    memberStats,
    dailyLedger,
    donorCount: collections.length,
    expenseCount: expenses.length
  };
};

export const generateNextReceiptNo = (group) => {
  const count = (group?.collections?.length || 0) + 101;
  return `CB-${count}`;
};

export const generateGroupCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
