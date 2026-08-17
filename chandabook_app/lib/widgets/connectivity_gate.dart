import 'package:flutter/material.dart';
import '../services/connectivity_service.dart';
import '../screens/no_internet_screen.dart';

/// Wraps [child] and swaps it out for a blocking [NoInternetScreen] whenever
/// the device loses connectivity - ChandaBook has no offline mode, so there's
/// nothing useful to show without a network.
class ConnectivityGate extends StatefulWidget {
  final Widget child;

  const ConnectivityGate({super.key, required this.child});

  @override
  State<ConnectivityGate> createState() => _ConnectivityGateState();
}

class _ConnectivityGateState extends State<ConnectivityGate> {
  bool? _isOnline;
  bool _isRetrying = false;

  @override
  void initState() {
    super.initState();
    _checkNow();
    ConnectivityService.onStatusChanged.listen((online) {
      if (mounted) setState(() => _isOnline = online);
    });
  }

  Future<void> _checkNow() async {
    setState(() => _isRetrying = true);
    final online = await ConnectivityService.isOnline();
    if (!mounted) return;
    setState(() {
      _isOnline = online;
      _isRetrying = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_isOnline == false) {
      return NoInternetScreen(onRetry: _checkNow, isRetrying: _isRetrying);
    }
    return widget.child;
  }
}
