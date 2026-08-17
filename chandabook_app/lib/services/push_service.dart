import 'dart:io';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import '../firebase_options.dart';
import '../models/group_model.dart';

const AndroidNotificationChannel _activityChannel = AndroidNotificationChannel(
  'chandabook_activity',
  'Committee Activity',
  description: 'Donations, expenses, pledges & team updates for your festival group',
  importance: Importance.high,
);

final FlutterLocalNotificationsPlugin _localNotifications = FlutterLocalNotificationsPlugin();

/// Must be a top-level (or static) function - the plugin spawns a separate
/// background isolate for it, which has no access to the running app's state
/// and needs its own Firebase init.
@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
  await _showLocalNotification(message);
}

Future<void> _showLocalNotification(RemoteMessage message) async {
  final data = message.data;
  final title = data['title'] as String? ?? 'ChandaBook';
  final body = data['body'] as String? ?? '';
  final tag = data['tag'] as String?;

  await _localNotifications.show(
    tag?.hashCode ?? message.hashCode,
    title,
    body,
    NotificationDetails(
      android: AndroidNotificationDetails(
        _activityChannel.id,
        _activityChannel.name,
        channelDescription: _activityChannel.description,
        importance: Importance.high,
        priority: Priority.high,
        icon: '@mipmap/ic_launcher',
      ),
    ),
  );
}

class PushService {
  static bool _initialized = false;

  /// Sets up the notification channel + foreground/background message
  /// handling. Safe to call multiple times (only runs once).
  static Future<void> initialize() async {
    if (_initialized) return;
    _initialized = true;

    await _localNotifications.initialize(
      const InitializationSettings(
        android: AndroidInitializationSettings('@mipmap/ic_launcher'),
      ),
    );
    await _localNotifications
        .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(_activityChannel);

    FirebaseMessaging.onBackgroundMessage(firebaseMessagingBackgroundHandler);
    FirebaseMessaging.onMessage.listen(_showLocalNotification);
  }

  /// Requests notification permission and registers this device's FCM token
  /// for the given group's activity notifications, matching the schema
  /// `functions/index.js` (tokensForGroup) already expects.
  static Future<void> registerPushToken(GroupModel group, String memberName) async {
    try {
      final settings = await FirebaseMessaging.instance.requestPermission();
      if (settings.authorizationStatus == AuthorizationStatus.denied) return;

      final token = await FirebaseMessaging.instance.getToken();
      if (token == null) return;

      await FirebaseFirestore.instance.collection('pushTokens').doc(token).set({
        'token': token,
        'groupId': group.id,
        'groupCode': group.code,
        'memberName': memberName,
        'platform': 'Android ${Platform.operatingSystemVersion}',
        'updatedAt': DateTime.now().toIso8601String(),
      }, SetOptions(merge: true));
    } catch (e) {
      debugPrint('PushService.registerPushToken error: $e');
    }
  }

  static Future<void> unregisterPushToken() async {
    try {
      final token = await FirebaseMessaging.instance.getToken();
      if (token == null) return;
      await FirebaseFirestore.instance.collection('pushTokens').doc(token).delete();
      await FirebaseMessaging.instance.deleteToken();
    } catch (e) {
      debugPrint('PushService.unregisterPushToken error: $e');
    }
  }
}
