import 'package:flutter/material.dart';
import '../core/constants/app_constants.dart';

class CategoryIconBadge extends StatelessWidget {
  final String categoryId;
  final double size;
  final bool showLabel;

  const CategoryIconBadge({
    super.key,
    required this.categoryId,
    this.size = 38,
    this.showLabel = false,
  });

  @override
  Widget build(BuildContext context) {
    final cat = AppConstants.getExpenseCategory(categoryId);

    final iconWidget = Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: cat.color.withOpacity(0.12),
        borderRadius: BorderRadius.circular(size * 0.3),
        border: Border.all(color: cat.color.withOpacity(0.3), width: 1),
      ),
      child: Center(
        child: Text(
          cat.icon,
          style: TextStyle(fontSize: size * 0.45),
        ),
      ),
    );

    if (!showLabel) return iconWidget;

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        iconWidget,
        const SizedBox(width: 8),
        Text(
          cat.label,
          style: const TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }
}
