import 'dart:async';
import 'package:app_links/app_links.dart';
import 'package:flutter/foundation.dart';

class DeepLinkService {
  static final AppLinks _appLinks = AppLinks();
  static StreamSubscription<Uri>? _subscription;

  /// Parses a group join code out of either link shape ChandaBook uses:
  ///  - https://chandabook-utsav.web.app/?join=CODE (shared web/App Link)
  ///  - chandabook://join?code=CODE (custom scheme, kept for compatibility)
  static String? _extractJoinCode(Uri uri) {
    final code = uri.queryParameters['join'] ??
        uri.queryParameters['code'] ??
        uri.queryParameters['inviteMember'];
    if (code != null && code.trim().isNotEmpty) {
      return code.trim();
    }
    return null;
  }

  /// Returns the invite code the app was cold-started with, if any.
  static Future<String?> getInitialInviteCode() async {
    try {
      final uri = await _appLinks.getInitialLink();
      if (uri == null) return null;
      return _extractJoinCode(uri);
    } catch (e) {
      debugPrint('DeepLinkService.getInitialInviteCode error: $e');
      return null;
    }
  }

  /// Listens for links received while the app is already running.
  static void listen(void Function(String code) onInviteCode) {
    _subscription?.cancel();
    _subscription = _appLinks.uriLinkStream.listen((uri) {
      final code = _extractJoinCode(uri);
      if (code != null) {
        onInviteCode(code);
      }
    }, onError: (e) {
      debugPrint('DeepLinkService.listen error: $e');
    });
  }

  static void dispose() {
    _subscription?.cancel();
    _subscription = null;
  }
}
