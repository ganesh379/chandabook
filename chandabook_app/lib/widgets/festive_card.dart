import 'package:flutter/material.dart';
import '../core/theme/app_theme.dart';

class FestiveCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? margin;
  final Gradient? gradient;
  final Color? color;
  final VoidCallback? onTap;
  final Border? border;
  final double borderRadius;

  const FestiveCard({
    super.key,
    required this.child,
    this.padding,
    this.margin,
    this.gradient,
    this.color,
    this.onTap,
    this.border,
    this.borderRadius = 16,
  });

  @override
  Widget build(BuildContext context) {
    Widget content = Container(
      margin: margin,
      padding: padding ?? const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color ?? (gradient == null ? Colors.white : null),
        gradient: gradient,
        borderRadius: BorderRadius.circular(borderRadius),
        border: border ?? Border.all(color: AppTheme.borderSubtle, width: 1),
        boxShadow: [
          BoxShadow(
            color: (gradient != null ? AppTheme.primarySaffron : Colors.black).withOpacity(0.04),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: child,
    );

    if (onTap != null) {
      return Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(borderRadius),
          child: content,
        ),
      );
    }

    return content;
  }
}
