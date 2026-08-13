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
  if (!group) return { totalCollected: 0, totalExpenses: 0, netBalance: 0, memberStats: [], dailyLedger: [], totalPledged: 0, pledgeOutstanding: 0, pledgeCount: 0, pledgeFulfilledCount: 0 };

  const collections = group.collections || [];
  const expenses = group.expenses || [];
  const pledges = group.pledges || [];

  const totalCollected = collections.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const netBalance = totalCollected - totalExpenses;

  // Pledge Tracking Calculations
  const totalPledged = pledges.reduce((sum, p) => sum + (Number(p.pledgeAmount) || 0), 0);
  const totalPledgeCollected = pledges.reduce((sum, p) => sum + (Number(p.collectedAmount) || 0), 0);
  const pledgeOutstanding = Math.max(0, totalPledged - totalPledgeCollected);
  const pledgeFulfilledCount = pledges.filter(p => p.status === 'fulfilled').length;
  const pledgePendingCount = pledges.filter(p => p.status !== 'fulfilled').length;

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
    expenseCount: expenses.length,
    totalPledged,
    totalPledgeCollected,
    pledgeOutstanding,
    pledgeCount: pledges.length,
    pledgeFulfilledCount,
    pledgePendingCount
  };
};

export const generateNextReceiptNo = (group) => {
  const count = (group?.collections?.length || 0) + 101;
  return `CB-${count}`;
};

export const generateGroupCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Expense Category Breakdown (for charts)
export const computeExpenseCategoryBreakdown = (group) => {
  const expenses = group?.expenses || [];
  const total = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  const byCategory = {};
  expenses.forEach(e => {
    const catId = e.category || 'misc';
    if (!byCategory[catId]) byCategory[catId] = 0;
    byCategory[catId] += Number(e.amount) || 0;
  });

  return Object.keys(byCategory)
    .map(catId => {
      const catObj = EXPENSE_CATEGORIES.find(c => c.id === catId) || EXPENSE_CATEGORIES[7];
      const amount = byCategory[catId];
      return {
        id: catId,
        label: catObj.label,
        icon: catObj.icon,
        color: catObj.color,
        amount,
        percent: total > 0 ? Math.round((amount / total) * 100) : 0
      };
    })
    .sort((a, b) => b.amount - a.amount);
};

// Daily Collections Trend (for line/bar charts)
export const computeCollectionsTrend = (group) => {
  const collections = group?.collections || [];
  const dateMap = {};
  collections.forEach(c => {
    const d = c.date || new Date().toISOString().split('T')[0];
    dateMap[d] = (dateMap[d] || 0) + (Number(c.amount) || 0);
  });

  const sortedDates = Object.keys(dateMap).sort();
  let cumulative = 0;
  return sortedDates.map(d => {
    cumulative += dateMap[d];
    return { date: d, amount: dateMap[d], cumulative };
  });
};

// Top Collector Weekly Comparison (for grouped bar chart)
export const computeCollectorWeeklyTrend = (group, topN = 4) => {
  const collections = group?.collections || [];
  if (collections.length === 0) return { weeks: [], series: [] };

  const getWeekLabel = (dateStr) => {
    const d = new Date(dateStr || Date.now());
    const jan1 = new Date(d.getFullYear(), 0, 1);
    const dayOfYear = Math.floor((d - jan1) / 86400000) + 1;
    const week = Math.ceil((dayOfYear + jan1.getDay()) / 7);
    return `${d.getFullYear()}-W${week}`;
  };

  // Determine top N collectors by total
  const totals = {};
  collections.forEach(c => {
    const name = c.collectedBy || 'Unassigned';
    totals[name] = (totals[name] || 0) + (Number(c.amount) || 0);
  });
  const topCollectors = Object.keys(totals).sort((a, b) => totals[b] - totals[a]).slice(0, topN);

  // Bucket by week per collector
  const weekSet = new Set();
  const weekCollectorMap = {};
  collections.forEach(c => {
    if (!topCollectors.includes(c.collectedBy)) return;
    const wk = getWeekLabel(c.date);
    weekSet.add(wk);
    if (!weekCollectorMap[wk]) weekCollectorMap[wk] = {};
    weekCollectorMap[wk][c.collectedBy] = (weekCollectorMap[wk][c.collectedBy] || 0) + (Number(c.amount) || 0);
  });

  const weeks = Array.from(weekSet).sort();
  const palette = ['#f59e0b', '#34d399', '#60a5fa', '#f87171', '#a78bfa', '#fb923c'];
  const series = topCollectors.map((name, idx) => ({
    name,
    color: palette[idx % palette.length],
    data: weeks.map(wk => weekCollectorMap[wk]?.[name] || 0)
  }));

  return { weeks, series };
};
