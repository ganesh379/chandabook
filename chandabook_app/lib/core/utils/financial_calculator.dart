import '../../models/group_model.dart';
import '../../models/collection_model.dart';
import '../../models/expense_model.dart';
import '../../models/pledge_model.dart';
import '../constants/app_constants.dart';

class MemberStat {
  final String name;
  final double total;
  final int count;

  MemberStat({required this.name, required this.total, required this.count});
}

class DailyLedgerEntry {
  final String date;
  final double collected;
  final double expensed;
  final double dayNet;
  final double cumulativeBalance;

  DailyLedgerEntry({
    required this.date,
    required this.collected,
    required this.expensed,
    required this.dayNet,
    required this.cumulativeBalance,
  });
}

class CategoryBreakdown {
  final String id;
  final String label;
  final String icon;
  final Color color;
  final double amount;
  final int percent;

  CategoryBreakdown({
    required this.id,
    required this.label,
    required this.icon,
    required this.color,
    required this.amount,
    required this.percent,
  });
}

class GroupFinancials {
  final double totalCollected;
  final double totalExpenses;
  final double netBalance;
  final double totalPledged;
  final double totalPledgeCollected;
  final double pledgeOutstanding;
  final int donorCount;
  final int expenseCount;
  final int pledgeCount;
  final int pledgeFulfilledCount;
  final int pledgePendingCount;
  final List<MemberStat> memberStats;
  final List<DailyLedgerEntry> dailyLedger;
  final List<CategoryBreakdown> categoryBreakdowns;

  GroupFinancials({
    required this.totalCollected,
    required this.totalExpenses,
    required this.netBalance,
    required this.totalPledged,
    required this.totalPledgeCollected,
    required this.pledgeOutstanding,
    required this.donorCount,
    required this.expenseCount,
    required this.pledgeCount,
    required this.pledgeFulfilledCount,
    required this.pledgePendingCount,
    required this.memberStats,
    required this.dailyLedger,
    required this.categoryBreakdowns,
  });
}

class FinancialCalculator {
  static GroupFinancials compute(GroupModel? group) {
    if (group == null) {
      return GroupFinancials(
        totalCollected: 0,
        totalExpenses: 0,
        netBalance: 0,
        totalPledged: 0,
        totalPledgeCollected: 0,
        pledgeOutstanding: 0,
        donorCount: 0,
        expenseCount: 0,
        pledgeCount: 0,
        pledgeFulfilledCount: 0,
        pledgePendingCount: 0,
        memberStats: [],
        dailyLedger: [],
        categoryBreakdowns: [],
      );
    }

    final collections = group.collections;
    final expenses = group.expenses;
    final pledges = group.pledges;

    final totalCollected = collections.fold<double>(0.0, (sum, c) => sum + c.amount);
    final totalExpenses = expenses.fold<double>(0.0, (sum, e) => sum + e.amount);
    final netBalance = totalCollected - totalExpenses;

    // Pledges
    final totalPledged = pledges.fold<double>(0.0, (sum, p) => sum + p.pledgeAmount);
    final totalPledgeCollected = pledges.fold<double>(0.0, (sum, p) => sum + p.collectedAmount);
    final pledgeOutstanding = (totalPledged - totalPledgeCollected) > 0 ? (totalPledged - totalPledgeCollected) : 0.0;
    final pledgeFulfilledCount = pledges.where((p) => p.isFulfilled).length;
    final pledgePendingCount = pledges.length - pledgeFulfilledCount;

    // Leaderboard calculation
    final Map<String, _MemberAccumulator> memberMap = {};
    for (final member in group.members) {
      memberMap[member] = _MemberAccumulator(name: member, total: 0, count: 0);
    }

    for (final c in collections) {
      final collector = c.collectedBy.isNotEmpty ? c.collectedBy : 'Unassigned';
      if (!memberMap.containsKey(collector)) {
        memberMap[collector] = _MemberAccumulator(name: collector, total: 0, count: 0);
      }
      memberMap[collector]!.total += c.amount;
      memberMap[collector]!.count += 1;
    }

    final memberStats = memberMap.values
        .map((m) => MemberStat(name: m.name, total: m.total, count: m.count))
        .toList()
      ..sort((a, b) => b.total.compareTo(a.total));

    // Daily Ledger calculation
    final Map<String, _DateAccumulator> dateMap = {};
    for (final c in collections) {
      final d = c.date.isNotEmpty ? c.date : 'Unknown Date';
      dateMap.putIfAbsent(d, () => _DateAccumulator(date: d));
      dateMap[d]!.collected += c.amount;
    }

    for (final e in expenses) {
      final d = e.date.isNotEmpty ? e.date : 'Unknown Date';
      dateMap.putIfAbsent(d, () => _DateAccumulator(date: d));
      dateMap[d]!.expensed += e.amount;
    }

    final sortedDates = dateMap.keys.toList()..sort();
    double cumulative = 0.0;
    final List<DailyLedgerEntry> dailyLedger = [];

    for (final d in sortedDates) {
      final item = dateMap[d]!;
      final dayNet = item.collected - item.expensed;
      cumulative += dayNet;
      dailyLedger.add(DailyLedgerEntry(
        date: d,
        collected: item.collected,
        expensed: item.expensed,
        dayNet: dayNet,
        cumulativeBalance: cumulative,
      ));
    }

    // Expense Categories Breakdown
    final Map<String, double> categorySums = {};
    for (final e in expenses) {
      final cat = e.category.isNotEmpty ? e.category : 'misc';
      categorySums[cat] = (categorySums[cat] ?? 0.0) + e.amount;
    }

    final List<CategoryBreakdown> categoryBreakdowns = categorySums.entries.map((entry) {
      final catInfo = AppConstants.getExpenseCategory(entry.key);
      final percent = totalExpenses > 0 ? ((entry.value / totalExpenses) * 100).round() : 0;
      return CategoryBreakdown(
        id: entry.key,
        label: catInfo.label,
        icon: catInfo.icon,
        color: catInfo.color,
        amount: entry.value,
        percent: percent,
      );
    }).toList()
      ..sort((a, b) => b.amount.compareTo(a.amount));

    return GroupFinancials(
      totalCollected: totalCollected,
      totalExpenses: totalExpenses,
      netBalance: netBalance,
      totalPledged: totalPledged,
      totalPledgeCollected: totalPledgeCollected,
      pledgeOutstanding: pledgeOutstanding,
      donorCount: collections.length,
      expenseCount: expenses.length,
      pledgeCount: pledges.length,
      pledgeFulfilledCount: pledgeFulfilledCount,
      pledgePendingCount: pledgePendingCount,
      memberStats: memberStats,
      dailyLedger: dailyLedger,
      categoryBreakdowns: categoryBreakdowns,
    );
  }
}

class _MemberAccumulator {
  final String name;
  double total;
  int count;

  _MemberAccumulator({required this.name, required this.total, required this.count});
}

class _DateAccumulator {
  final String date;
  double collected = 0;
  double expensed = 0;

  _DateAccumulator({required this.date});
}
