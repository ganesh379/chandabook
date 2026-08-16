import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_state_provider.dart';
import '../core/theme/app_theme.dart';
import '../core/utils/date_formatter.dart';
import '../widgets/festive_card.dart';
import '../services/pdf_service.dart';

class DailyLedgerScreen extends StatelessWidget {
  const DailyLedgerScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppStateProvider>();
    final group = state.activeGroup;
    final financials = state.financials;
    final ledger = financials.dailyLedger;

    if (group == null) {
      return const Center(child: CircularProgressIndicator());
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Daily Cash Flow Ledger'),
        actions: [
          IconButton(
            icon: const Icon(Icons.picture_as_pdf_outlined),
            tooltip: 'Export Statement PDF',
            onPressed: () {
              PdfService.printStatement(group);
            },
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        physics: const BouncingScrollPhysics(),
        children: [
          // Executive Balance Card
          FestiveCard(
            gradient: AppTheme.darkCardGradient,
            padding: const EdgeInsets.all(18),
            borderRadius: 18,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'CUMULATIVE NET CASH IN-HAND',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 0.8,
                    color: Colors.white70,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  DateFormatter.formatCurrency(financials.netBalance),
                  style: const TextStyle(
                    fontSize: 30,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFFA7F3D0),
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    _buildLedgerSummaryItem(
                      'Total Inflow (+)',
                      DateFormatter.formatCurrency(financials.totalCollected),
                      const Color(0xFF6EE7B7),
                    ),
                    _buildLedgerSummaryItem(
                      'Total Outflow (-)',
                      DateFormatter.formatCurrency(financials.totalExpenses),
                      const Color(0xFFFCA5A5),
                    ),
                    _buildLedgerSummaryItem(
                      'Days Active',
                      '${ledger.length} Days',
                      Colors.white,
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          const Text(
            'Day-by-Day Cash Reconciliation',
            style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppTheme.textMain),
          ),
          const SizedBox(height: 8),

          if (ledger.isEmpty)
            const Center(
              child: Padding(
                padding: EdgeInsets.all(32),
                child: Text('No daily activity logged yet.', style: TextStyle(color: AppTheme.textMuted)),
              ),
            )
          else
            ...ledger.reversed.map((entry) {
              final isPositive = entry.dayNet >= 0;
              return Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: FestiveCard(
                  padding: const EdgeInsets.all(14),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.calendar_today, size: 14, color: AppTheme.primarySaffron),
                              const SizedBox(width: 6),
                              Text(
                                DateFormatter.formatDisplay(entry.date),
                                style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                              ),
                            ],
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: isPositive ? const Color(0xFFECFDF5) : const Color(0xFFFEF2F2),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              'Day Net: ${isPositive ? '+' : ''}${DateFormatter.formatCurrency(entry.dayNet)}',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                color: isPositive ? const Color(0xFF047857) : const Color(0xFFDC2626),
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      const Divider(color: AppTheme.borderSubtle, height: 1),
                      const SizedBox(height: 8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          _buildCashMetric('Collected', '+${DateFormatter.formatCurrency(entry.collected)}', const Color(0xFF047857)),
                          _buildCashMetric('Expensed', '-${DateFormatter.formatCurrency(entry.expensed)}', const Color(0xFFDC2626)),
                          _buildCashMetric('Running Balance', DateFormatter.formatCurrency(entry.cumulativeBalance), AppTheme.textMain, isBold: true),
                        ],
                      ),
                    ],
                  ),
                ),
              );
            }),
        ],
      ),
    );
  }

  Widget _buildLedgerSummaryItem(String label, String value, Color color) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 10, color: Colors.white70)),
        const SizedBox(height: 2),
        Text(value, style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: color)),
      ],
    );
  }

  Widget _buildCashMetric(String label, String value, Color color, {bool isBold = false}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 10, color: AppTheme.textMuted)),
        const SizedBox(height: 2),
        Text(
          value,
          style: TextStyle(
            fontSize: 12,
            fontWeight: isBold ? FontWeight.bold : FontWeight.w600,
            color: color,
          ),
        ),
      ],
    );
  }
}
