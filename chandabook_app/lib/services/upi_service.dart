import 'package:url_launcher/url_launcher.dart';

class UpiService {
  static String buildUpiUriString({
    required String upiId,
    required String payeeName,
    double? amount,
    String? note,
    String? transactionRef,
  }) {
    final cleanUpi = upiId.trim();
    final cleanName = payeeName.trim().replaceAll('&', 'and');
    final queryParams = <String, String>{
      'pa': cleanUpi,
      'pn': cleanName,
      'cu': 'INR',
    };

    if (amount != null && amount > 0) {
      queryParams['am'] = amount.toStringAsFixed(2);
    }
    if (note != null && note.isNotEmpty) {
      queryParams['tn'] = note.trim();
    }
    if (transactionRef != null && transactionRef.isNotEmpty) {
      queryParams['tr'] = transactionRef.trim();
    }

    final queryString = queryParams.entries
        .map((e) => '${e.key}=${Uri.encodeComponent(e.value)}')
        .join('&');

    return 'upi://pay?$queryString';
  }

  static Future<bool> launchUpiIntent({
    required String upiId,
    required String payeeName,
    double? amount,
    String? note,
  }) async {
    final uriStr = buildUpiUriString(
      upiId: upiId,
      payeeName: payeeName,
      amount: amount,
      note: note,
    );
    final Uri uri = Uri.parse(uriStr);

    try {
      if (await canLaunchUrl(uri)) {
        return await launchUrl(uri, mode: LaunchMode.externalApplication);
      }
      return false;
    } catch (e) {
      return false;
    }
  }
}
