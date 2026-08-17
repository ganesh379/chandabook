import 'package:flutter/material.dart';
import '../core/theme/app_theme.dart';

class NoInternetScreen extends StatelessWidget {
  final VoidCallback onRetry;
  final bool isRetrying;

  const NoInternetScreen({super.key, required this.onRetry, this.isRetrying = false});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(28),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 84,
                  height: 84,
                  decoration: BoxDecoration(
                    color: AppTheme.primarySaffron.withOpacity(0.1),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.wifi_off_rounded, size: 40, color: AppTheme.primarySaffron),
                ),
                const SizedBox(height: 20),
                Text("You're Offline", style: Theme.of(context).textTheme.headlineLarge),
                const SizedBox(height: 8),
                const Text(
                  'ChandaBook needs an internet connection to keep your\n'
                  "committee's collections, expenses & alerts in sync in\nreal time.",
                  textAlign: TextAlign.center,
                  style: TextStyle(color: AppTheme.textMuted, fontSize: 13),
                ),
                const SizedBox(height: 28),
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton.icon(
                    onPressed: isRetrying ? null : onRetry,
                    icon: isRetrying
                        ? const SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                          )
                        : const Icon(Icons.refresh),
                    label: Text(isRetrying ? 'Checking...' : 'Try Again'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
