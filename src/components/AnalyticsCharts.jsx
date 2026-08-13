import React, { useMemo } from 'react';
import { PieChart, TrendingUp, Users2 } from 'lucide-react';
import { computeExpenseCategoryBreakdown, computeCollectionsTrend, computeCollectorWeeklyTrend } from '../utils/storage';
import { DonutChart, SimpleBarChart, GroupedBarChart } from './Charts';

const shortDate = (isoDate) => {
  if (!isoDate) return '';
  const d = new Date(isoDate);
  if (isNaN(d)) return isoDate;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
};

export default function AnalyticsCharts({ group }) {
  const categoryBreakdown = useMemo(() => computeExpenseCategoryBreakdown(group), [group]);
  const collectionsTrend = useMemo(() => computeCollectionsTrend(group), [group]);
  const collectorTrend = useMemo(() => computeCollectorWeeklyTrend(group), [group]);

  const currency = group?.currency || '₹';

  const collectionsBarData = collectionsTrend.map(d => ({ label: shortDate(d.date), value: d.amount }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <h2 style={{ fontSize: '1.4rem', color: 'var(--text-main)' }}>Analytics & Reports</h2>
        <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
          Visual breakdown of expenses, collection trends, and volunteer performance over time
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Expense Category Breakdown */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1.05rem', color: 'var(--text-main)', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PieChart size={18} style={{ color: 'var(--primary-500)' }} /> Expense Category Breakdown
          </h3>
          <DonutChart data={categoryBreakdown.map(c => ({ id: c.id, label: c.label, icon: c.icon, color: c.color, amount: c.amount, percent: c.percent }))} currency={currency} centerLabel="EXPENSES" />
        </div>

        {/* Collections Over Time */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1.05rem', color: 'var(--text-main)', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} style={{ color: '#34d399' }} /> Daily Collections
          </h3>
          <SimpleBarChart data={collectionsBarData} color="#34d399" currency={currency} />
        </div>
      </div>

      {/* Top Collector Comparison */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '1.05rem', color: 'var(--text-main)', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users2 size={18} style={{ color: '#818cf8' }} /> Top Collector Performance (Weekly)
        </h3>
        <GroupedBarChart weeks={collectorTrend.weeks} series={collectorTrend.series} currency={currency} />
      </div>
    </div>
  );
}
