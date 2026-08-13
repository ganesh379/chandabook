import { computeGroupFinancials, computeExpenseCategoryBreakdown, FESTIVAL_TYPES } from './storage';

const PAGE_MARGIN = 40;
const PAGE_WIDTH = 595.28; // A4 pt
const PAGE_HEIGHT = 841.89;
const CONTENT_WIDTH = PAGE_WIDTH - PAGE_MARGIN * 2;

const SAFFRON = [217, 119, 6];
const GREEN = [5, 150, 105];
const RED = [220, 38, 38];
const MUTED = [100, 116, 139];
const INK = [15, 23, 42];

function newPageIfNeeded(doc, y, needed = 60) {
  if (y + needed > PAGE_HEIGHT - PAGE_MARGIN) {
    doc.addPage();
    return PAGE_MARGIN;
  }
  return y;
}

function drawSectionTitle(doc, y, title) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...INK);
  doc.text(title, PAGE_MARGIN, y);
  doc.setDrawColor(...SAFFRON);
  doc.setLineWidth(1.2);
  doc.line(PAGE_MARGIN, y + 5, PAGE_MARGIN + CONTENT_WIDTH, y + 5);
  return y + 22;
}

function drawTableRow(doc, y, cols, widths, opts = {}) {
  doc.setFont('helvetica', opts.bold ? 'bold' : 'normal');
  doc.setFontSize(opts.size || 9.5);
  doc.setTextColor(...(opts.color || INK));
  let x = PAGE_MARGIN;
  cols.forEach((col, i) => {
    const align = opts.aligns?.[i] || 'left';
    doc.text(String(col), align === 'right' ? x + widths[i] : x, y, { align });
    x += widths[i];
  });
  return y + (opts.lineHeight || 16);
}

const fmt = (n, currencySymbol) => `${currencySymbol}${Number(n || 0).toLocaleString('en-IN')}`;

// jsPDF is only needed for this one action, so it's loaded on demand
// instead of bloating the initial app bundle every visitor downloads.
export async function generateFinancialStatementPDF(group) {
  if (!group) return;
  const { jsPDF } = await import('jspdf');
  const financials = computeGroupFinancials(group);
  const categoryBreakdown = computeExpenseCategoryBreakdown(group);
  const festival = FESTIVAL_TYPES.find(f => f.id === group.festivalType) || FESTIVAL_TYPES[0];
  const currency = group.currency || 'Rs.'; // jsPDF core font lacks the ₹ glyph
  const collections = group.collections || [];
  const expenses = group.expenses || [];

  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  let y = PAGE_MARGIN;

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...SAFFRON);
  doc.text(group.name || 'Festival Committee', PAGE_MARGIN, y);
  y += 20;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(...MUTED);
  doc.text(`${festival.name} - Official Financial Statement`, PAGE_MARGIN, y);
  y += 14;
  doc.text(`Generated on ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}  |  Group Code: ${group.code || '-'}`, PAGE_MARGIN, y);
  y += 26;

  // Summary boxes
  const boxWidth = (CONTENT_WIDTH - 20) / 3;
  const summaryData = [
    { label: 'TOTAL COLLECTED', value: fmt(financials.totalCollected, currency), color: GREEN },
    { label: 'TOTAL EXPENSES', value: fmt(financials.totalExpenses, currency), color: RED },
    { label: 'NET CASH IN HAND', value: fmt(financials.netBalance, currency), color: SAFFRON }
  ];
  summaryData.forEach((s, i) => {
    const bx = PAGE_MARGIN + i * (boxWidth + 10);
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.7);
    doc.roundedRect(bx, y, boxWidth, 52, 4, 4);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(s.label, bx + 10, y + 18);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...s.color);
    doc.text(s.value, bx + 10, y + 38);
  });
  y += 76;

  // Pledge summary (if any)
  if (financials.pledgeCount > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...MUTED);
    doc.text(
      `Pledges: ${financials.pledgeCount} total (${financials.pledgeFulfilledCount} fulfilled) | Pledged ${fmt(financials.totalPledged, currency)} | Outstanding ${fmt(financials.pledgeOutstanding, currency)}`,
      PAGE_MARGIN, y
    );
    y += 22;
  }

  // Expense Category Breakdown
  y = drawSectionTitle(doc, y, 'Expense Category Breakdown');
  if (categoryBreakdown.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9.5);
    doc.setTextColor(...MUTED);
    doc.text('No expenses recorded.', PAGE_MARGIN, y);
    y += 18;
  } else {
    const widths = [CONTENT_WIDTH * 0.5, CONTENT_WIDTH * 0.25, CONTENT_WIDTH * 0.25];
    y = drawTableRow(doc, y, ['Category', 'Amount', '% of Total'], widths, { bold: true, color: MUTED, aligns: ['left', 'right', 'right'] });
    categoryBreakdown.forEach(c => {
      y = newPageIfNeeded(doc, y);
      y = drawTableRow(doc, y, [c.label, fmt(c.amount, currency), `${c.percent}%`], widths, { aligns: ['left', 'right', 'right'] });
    });
    y += 10;
  }

  // Top Donors
  y = newPageIfNeeded(doc, y, 100);
  y = drawSectionTitle(doc, y, 'Top Donors');
  const byDonor = {};
  collections.forEach(c => { byDonor[c.donorName] = (byDonor[c.donorName] || 0) + (Number(c.amount) || 0); });
  const topDonors = Object.entries(byDonor).map(([name, amount]) => ({ name, amount })).sort((a, b) => b.amount - a.amount).slice(0, 15);
  if (topDonors.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9.5);
    doc.setTextColor(...MUTED);
    doc.text('No collections recorded.', PAGE_MARGIN, y);
    y += 18;
  } else {
    const widths = [CONTENT_WIDTH * 0.7, CONTENT_WIDTH * 0.3];
    y = drawTableRow(doc, y, ['Donor Name', 'Amount'], widths, { bold: true, color: MUTED, aligns: ['left', 'right'] });
    topDonors.forEach(d => {
      y = newPageIfNeeded(doc, y);
      y = drawTableRow(doc, y, [d.name, fmt(d.amount, currency)], widths, { aligns: ['left', 'right'] });
    });
    y += 10;
  }

  // Full Expense Ledger
  y = newPageIfNeeded(doc, y, 100);
  y = drawSectionTitle(doc, y, 'Expense Ledger');
  if (expenses.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9.5);
    doc.setTextColor(...MUTED);
    doc.text('No expenses recorded.', PAGE_MARGIN, y);
    y += 18;
  } else {
    const widths = [CONTENT_WIDTH * 0.15, CONTENT_WIDTH * 0.4, CONTENT_WIDTH * 0.25, CONTENT_WIDTH * 0.2];
    y = drawTableRow(doc, y, ['Date', 'Item / Vendor', 'Category', 'Amount'], widths, { bold: true, color: MUTED, aligns: ['left', 'left', 'left', 'right'] });
    [...expenses].sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0)).forEach(e => {
      y = newPageIfNeeded(doc, y);
      y = drawTableRow(doc, y, [e.date || '-', `${e.title} (${e.vendor || '-'})`, e.category || '-', fmt(e.amount, currency)], widths, { aligns: ['left', 'left', 'left', 'right'] });
    });
  }

  // Signature Section
  y = newPageIfNeeded(doc, y, 100);
  y += 40;
  doc.setDrawColor(...MUTED);
  doc.setLineWidth(0.6);
  doc.line(PAGE_MARGIN, y, PAGE_MARGIN + 160, y);
  doc.line(PAGE_MARGIN + CONTENT_WIDTH - 160, y, PAGE_MARGIN + CONTENT_WIDTH, y);
  y += 14;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...INK);
  doc.text('Treasurer Signature', PAGE_MARGIN, y);
  doc.text('President Signature', PAGE_MARGIN + CONTENT_WIDTH - 160, y);

  // Footer on every page
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text('Generated by ChandaBook', PAGE_MARGIN, PAGE_HEIGHT - 24);
    doc.text(`Page ${i} of ${pageCount}`, PAGE_WIDTH - PAGE_MARGIN, PAGE_HEIGHT - 24, { align: 'right' });
  }

  doc.save(`${(group.name || 'ChandaBook').replace(/\s+/g, '_')}_Financial_Statement.pdf`);
}
