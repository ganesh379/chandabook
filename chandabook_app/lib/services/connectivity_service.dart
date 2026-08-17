import 'package:connectivity_plus/connectivity_plus.dart';

class ConnectivityService {
  static final Connectivity _connectivity = Connectivity();

  static bool _hasConnection(List<ConnectivityResult> results) {
    return results.any((r) => r != ConnectivityResult.none);
  }

  static Future<bool> isOnline() async {
    final results = await _connectivity.checkConnectivity();
    return _hasConnection(results);
  }

  static Stream<bool> get onStatusChanged {
    return _connectivity.onConnectivityChanged.map(_hasConnection);
  }
}
