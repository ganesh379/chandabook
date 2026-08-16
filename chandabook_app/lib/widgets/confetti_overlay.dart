import 'package:flutter/material.dart';
import 'package:confetti/confetti.dart';
import '../core/theme/app_theme.dart';

class ConfettiCelebrationOverlay extends StatefulWidget {
  final Widget child;
  final ConfettiController confettiController;

  const ConfettiCelebrationOverlay({
    super.key,
    required this.child,
    required this.confettiController,
  });

  @override
  State<ConfettiCelebrationOverlay> createState() => _ConfettiCelebrationOverlayState();
}

class _ConfettiCelebrationOverlayState extends State<ConfettiCelebrationOverlay> {
  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        widget.child,
        Align(
          alignment: Alignment.topCenter,
          child: ConfettiWidget(
            confettiController: widget.confettiController,
            blastDirectionality: BlastDirectionality.explosive,
            shouldLoop: false,
            colors: const [
              AppTheme.primarySaffron,
              AppTheme.marigold,
              AppTheme.festiveCrimson,
              AppTheme.devotionalEmerald,
              Colors.amber,
              Colors.orange,
            ],
            numberOfParticles: 40,
            gravity: 0.2,
            emissionFrequency: 0.05,
          ),
        ),
      ],
    );
  }
}
