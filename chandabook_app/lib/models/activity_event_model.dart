import 'package:flutter/material.dart';
import '../core/theme/app_theme.dart';

enum ActivityEventType {
  collection,
  expense,
  member,
  pledge,
  prasadam,
}

class ActivityEventModel {
  final String id;
  final ActivityEventType type;
  final String title;
  final String description;
  final double? amount;
  final String timestamp;
  final String? actor;

  ActivityEventModel({
    required this.id,
    required this.type,
    required this.title,
    required this.description,
    this.amount,
    required this.timestamp,
    this.actor,
  });

  IconData get icon {
    switch (type) {
      case ActivityEventType.collection:
        return Icons.volunteer_activism;
      case ActivityEventType.expense:
        return Icons.receipt_long;
      case ActivityEventType.member:
        return Icons.person_add_alt_1;
      case ActivityEventType.pledge:
        return Icons.handshake;
      case ActivityEventType.prasadam:
        return Icons.restaurant;
    }
  }

  Color get color {
    switch (type) {
      case ActivityEventType.collection:
        return AppTheme.devotionalEmerald;
      case ActivityEventType.expense:
        return AppTheme.festiveCrimson;
      case ActivityEventType.member:
        return AppTheme.primarySaffron;
      case ActivityEventType.pledge:
        return Colors.indigo;
      case ActivityEventType.prasadam:
        return Colors.teal;
    }
  }
}
