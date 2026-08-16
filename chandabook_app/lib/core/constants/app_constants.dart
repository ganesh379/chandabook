import 'package:flutter/material.dart';

class FestivalType {
  final String id;
  final String name;
  final String icon;
  final Color color;
  final double defaultGoal;

  const FestivalType({
    required this.id,
    required this.name,
    required this.icon,
    required this.color,
    required this.defaultGoal,
  });
}

class ExpenseCategory {
  final String id;
  final String label;
  final String icon;
  final Color color;

  const ExpenseCategory({
    required this.id,
    required this.label,
    required this.icon,
    required this.color,
  });
}

class AppConstants {
  static const String appName = 'ChandaBook';
  static const String appTagline = 'Utsav Chanda & Finance Manager';
  static const String defaultCurrency = '₹';

  // Auspicious Preset Chanda Amounts in INR
  static const List<int> auspiciousAmounts = [116, 501, 1116, 2116, 5016, 10016];

  // Festival Types
  static const List<FestivalType> festivalTypes = [
    FestivalType(
      id: 'vinayaka_chavithi',
      name: 'Vinayaka Chavithi (Ganesh Utsav)',
      icon: '🕉️',
      color: Color(0xFFF59E0B),
      defaultGoal: 75000,
    ),
    FestivalType(
      id: 'durga_puja',
      name: 'Durga Puja / Navratri Utsav',
      icon: '🌺',
      color: Color(0xFFDC2626),
      defaultGoal: 100000,
    ),
    FestivalType(
      id: 'diwali',
      name: 'Diwali Celebration',
      icon: '🕯️',
      color: Color(0xFF7E22CE),
      defaultGoal: 50000,
    ),
    FestivalType(
      id: 'sankranti',
      name: 'Sankranti / Pongal Festival',
      icon: '🌾',
      color: Color(0xFF059669),
      defaultGoal: 40000,
    ),
    FestivalType(
      id: 'temple_event',
      name: 'Temple Chanda & Devotional Utsav',
      icon: '🚩',
      color: Color(0xFFB45309),
      defaultGoal: 60000,
    ),
    FestivalType(
      id: 'custom',
      name: 'Custom Festival / Colony Celebration',
      icon: '🎨',
      color: Color(0xFF2563EB),
      defaultGoal: 50000,
    ),
  ];

  // Expense Categories
  static const List<ExpenseCategory> expenseCategories = [
    ExpenseCategory(
      id: 'idol',
      label: 'Idol / Prathima',
      icon: '🕉️',
      color: Color(0xFFF59E0B),
    ),
    ExpenseCategory(
      id: 'pandal',
      label: 'Pandal & Tent Decor',
      icon: '🎪',
      color: Color(0xFFEC4899),
    ),
    ExpenseCategory(
      id: 'pooja',
      label: 'Pooja & Prasadam',
      icon: '🪔',
      color: Color(0xFFEAB308),
    ),
    ExpenseCategory(
      id: 'audio',
      label: 'Audio / DJ / Devotional',
      icon: '🔊',
      color: Color(0xFF8B5CF6),
    ),
    ExpenseCategory(
      id: 'lighting',
      label: 'Electricity & Lighting',
      icon: '💡',
      color: Color(0xFF06B6D4),
    ),
    ExpenseCategory(
      id: 'nimajjanam',
      label: 'Nimajjanam / Immersion',
      icon: '🚌',
      color: Color(0xFF10B981),
    ),
    ExpenseCategory(
      id: 'printing',
      label: 'Printing & Banners',
      icon: '📜',
      color: Color(0xFF64748B),
    ),
    ExpenseCategory(
      id: 'misc',
      label: 'Miscellaneous',
      icon: '📦',
      color: Color(0xFF94A3B8),
    ),
  ];

  // Payment Modes
  static const List<String> paymentModes = ['Cash', 'UPI / GPay / PhonePe', 'Online Transfer', 'Cheque'];

  static FestivalType getFestivalType(String? id) {
    return festivalTypes.firstWhere(
      (f) => f.id == id,
      orElse: () => festivalTypes[0],
    );
  }

  static ExpenseCategory getExpenseCategory(String? id) {
    return expenseCategories.firstWhere(
      (c) => c.id == id,
      orElse: () => expenseCategories[7],
    );
  }
}
