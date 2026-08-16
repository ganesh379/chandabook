import 'package:flutter/material.dart';
import '../core/constants/app_constants.dart';
import '../core/theme/app_theme.dart';
import '../core/utils/date_formatter.dart';

class QuickAmountChips extends StatelessWidget {
  final double? selectedAmount;
  final ValueChanged<double> onAmountSelected;

  const QuickAmountChips({
    super.key,
    this.selectedAmount,
    required this.onAmountSelected,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            const Text(
              'Auspicious Preset Amounts (₹)',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: AppTheme.textMuted,
              ),
            ),
            const SizedBox(width: 6),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(
                color: AppTheme.marigold.withOpacity(0.2),
                borderRadius: BorderRadius.circular(4),
              ),
              child: const Text(
                'Subh Chanda',
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFFB45309),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          physics: const BouncingScrollPhysics(),
          child: Row(
            children: AppConstants.auspiciousAmounts.map((amt) {
              final isSelected = selectedAmount == amt.toDouble();
              return Padding(
                padding: const EdgeInsets.only(right: 8),
                child: ChoiceChip(
                  label: Text(
                    '+${DateFormatter.formatCurrency(amt)}',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: isSelected ? Colors.white : AppTheme.primarySaffronDark,
                    ),
                  ),
                  selected: isSelected,
                  selectedColor: AppTheme.primarySaffron,
                  backgroundColor: Colors.white,
                  side: BorderSide(
                    color: isSelected ? AppTheme.primarySaffron : AppTheme.borderSubtle,
                    width: 1.2,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(20),
                  ),
                  onSelected: (selected) {
                    if (selected) {
                      onAmountSelected(amt.toDouble());
                    }
                  },
                ),
              );
            }).toList(),
          ),
        ),
      ],
    );
  }
}
