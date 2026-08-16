import 'package:flutter/material.dart';
import '../core/theme/app_theme.dart';
import '../core/utils/date_formatter.dart';

class TargetProgressBar extends StatelessWidget {
  final double collected;
  final double target;
  final bool isDark;

  const TargetProgressBar({
    super.key,
    required this.collected,
    required this.target,
    this.isDark = false,
  });

  @override
  Widget build(BuildContext context) {
    final double percent = target > 0 ? (collected / target).clamp(0.0, 1.0) : 0.0;
    final int percentDisplay = target > 0 ? ((collected / target) * 100).round() : 0;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Target Goal Progress',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w500,
                color: isDark ? Colors.white70 : AppTheme.textMuted,
              ),
            ),
            Text(
              '$percentDisplay% (${DateFormatter.formatCurrency(target)})',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                color: isDark ? AppTheme.marigold : AppTheme.primarySaffronDark,
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Stack(
          children: [
            Container(
              height: 10,
              decoration: BoxDecoration(
                color: isDark ? Colors.white.withOpacity(0.15) : AppTheme.borderSubtle,
                borderRadius: BorderRadius.circular(10),
              ),
            ),
            LayoutBuilder(
              builder: (context, constraints) {
                return Container(
                  height: 10,
                  width: constraints.maxWidth * percent,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFFFFB800), Color(0xFFFF7A00)],
                    ),
                    borderRadius: BorderRadius.circular(10),
                    boxShadow: [
                      BoxShadow(
                        color: AppTheme.marigold.withOpacity(0.4),
                        blurRadius: 4,
                        offset: const Offset(0, 1),
                      ),
                    ],
                  ),
                );
              },
            ),
          ],
        ),
      ],
    );
  }
}
