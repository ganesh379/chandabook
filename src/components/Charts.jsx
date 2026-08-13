import React from 'react';

// Lightweight, dependency-free chart primitives built from CSS (conic-gradient
// donuts, flexbox bars) so they stay cheap to render on low-end mobile devices
// and inherit the app's existing theme variables automatically.

export function DonutChart({ data, currency = '₹', size = 170, thickness = 26, centerLabel = 'TOTAL' }) {
  const total = data.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

  let cursor = 0;
  const stops = data.map(d => {
    const pct = total > 0 ? (d.amount / total) * 100 : 0;
    const start = cursor;
    const end = cursor + pct;
    cursor = end;
    return `${d.color} ${start}% ${end}%`;
  });

  const gradient = stops.length > 0
    ? `conic-gradient(${stops.join(', ')})`
    : 'conic-gradient(var(--bg-input) 0% 100%)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
      <div style={{
        position: 'relative',
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        background: gradient,
        flexShrink: 0
      }}>
        <div style={{
          position: 'absolute',
          top: `${thickness}px`,
          left: `${thickness}px`,
          right: `${thickness}px`,
          bottom: `${thickness}px`,
          borderRadius: '50%',
          background: 'var(--bg-card-solid)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '4px'
        }}>
          <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.04em' }}>
            {centerLabel}
          </span>
          <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {currency}{total.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
        {data.length === 0 ? (
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>No data yet.</p>
        ) : (
          data.map(d => (
            <div key={d.id || d.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: d.color, flexShrink: 0 }} />
                <span style={{ color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {d.icon ? `${d.icon} ` : ''}{d.label}
                </span>
              </div>
              <span style={{ color: 'var(--text-muted)', fontWeight: 700, flexShrink: 0 }}>
                {currency}{d.amount.toLocaleString('en-IN')} <span style={{ opacity: 0.7 }}>({d.percent}%)</span>
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function SimpleBarChart({ data, color = 'var(--primary-500)', currency = '₹', height = 140 }) {
  const max = Math.max(1, ...data.map(d => Number(d.value) || 0));

  if (data.length === 0) {
    return <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>No data yet.</p>;
  }

  return (
    <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: '10px',
        height: `${height}px`,
        minWidth: `${Math.max(data.length * 42, 260)}px`,
        padding: '4px 4px 0 4px'
      }}>
        {data.map((d, idx) => {
          const barHeight = Math.max(3, Math.round((Number(d.value) / max) * (height - 34)));
          return (
            <div key={d.label + idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flex: '1 0 auto', width: '32px' }}>
              <div
                title={`${d.label}: ${currency}${Number(d.value).toLocaleString('en-IN')}`}
                style={{
                  width: '100%',
                  maxWidth: '26px',
                  height: `${barHeight}px`,
                  borderRadius: '6px 6px 2px 2px',
                  background: color,
                  transition: 'height 0.3s ease'
                }}
              />
              <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                {d.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function GroupedBarChart({ weeks, series, currency = '₹', height = 160 }) {
  if (!weeks || weeks.length === 0 || !series || series.length === 0) {
    return <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>Not enough data yet to compare collectors over time.</p>;
  }

  const max = Math.max(1, ...series.flatMap(s => s.data));

  return (
    <div>
      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
        {series.map(s => (
          <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: s.color }} />
            <span style={{ color: 'var(--text-main)' }}>{s.name}</span>
          </div>
        ))}
      </div>

      <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '18px',
          height: `${height}px`,
          minWidth: `${Math.max(weeks.length * 70, 280)}px`,
          padding: '4px 4px 0 4px'
        }}>
          {weeks.map((wk, wIdx) => (
            <div key={wk} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: `${height - 26}px` }}>
                {series.map(s => {
                  const val = s.data[wIdx] || 0;
                  const barHeight = Math.max(2, Math.round((val / max) * (height - 26)));
                  return (
                    <div
                      key={s.name}
                      title={`${s.name} • ${wk}: ${currency}${val.toLocaleString('en-IN')}`}
                      style={{
                        width: '10px',
                        height: `${barHeight}px`,
                        borderRadius: '3px 3px 1px 1px',
                        background: s.color,
                        transition: 'height 0.3s ease'
                      }}
                    />
                  );
                })}
              </div>
              <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{wk}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
