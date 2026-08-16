import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/group_model.dart';
import '../models/user_profile_model.dart';

class FirebaseService {
  // Configured for chandabook-utsav
  static const String projectId = 'chandabook-utsav';
  static const String firestoreBaseUrl = 'https://firestore.googleapis.com/v1/projects/$projectId/databases/(default)/documents';

  // Fetch Group by 6-digit Join Code
  static Future<GroupModel?> fetchGroupByCode(String code) async {
    if (code.trim().isEmpty) return null;
    try {
      final url = Uri.parse('$firestoreBaseUrl/groups');
      final response = await http.get(url).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final documents = data['documents'] as List<dynamic>?;
        if (documents != null) {
          for (final doc in documents) {
            final fields = doc['fields'] as Map<String, dynamic>?;
            if (fields != null) {
              final docCode = fields['code']?['stringValue']?.toString();
              if (docCode == code.trim()) {
                final groupMap = _convertFirestoreDocToMap(fields);
                return GroupModel.fromJson(groupMap);
              }
            }
          }
        }
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  // Sync group payload to Cloud Firestore
  static Future<bool> syncGroupToFirestore(GroupModel group) async {
    try {
      final docId = group.id;
      final url = Uri.parse('$firestoreBaseUrl/groups/$docId');
      final payload = {
        'fields': _convertMapToFirestoreDoc(group.toJson()),
      };

      final response = await http.patch(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(payload),
      ).timeout(const Duration(seconds: 12));

      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }

  // Fetch User Profile
  static Future<UserProfileModel?> fetchUserProfile(String uid) async {
    try {
      final url = Uri.parse('$firestoreBaseUrl/users/$uid');
      final response = await http.get(url).timeout(const Duration(seconds: 8));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final fields = data['fields'] as Map<String, dynamic>?;
        if (fields != null) {
          return UserProfileModel.fromJson(_convertFirestoreDocToMap(fields));
        }
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  // Save User Profile
  static Future<bool> saveUserProfile(UserProfileModel profile) async {
    try {
      final url = Uri.parse('$firestoreBaseUrl/users/${profile.uid}');
      final payload = {
        'fields': _convertMapToFirestoreDoc(profile.toJson()),
      };

      final response = await http.patch(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(payload),
      ).timeout(const Duration(seconds: 8));

      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }

  // Helper converters
  static Map<String, dynamic> _convertMapToFirestoreDoc(Map<String, dynamic> map) {
    final Map<String, dynamic> result = {};
    map.forEach((key, value) {
      if (value is String) {
        result[key] = {'stringValue': value};
      } else if (value is int) {
        result[key] = {'integerValue': value.toString()};
      } else if (value is double) {
        result[key] = {'doubleValue': value};
      } else if (value is bool) {
        result[key] = {'booleanValue': value};
      } else if (value is List) {
        result[key] = {
          'arrayValue': {
            'values': value.map((item) {
              if (item is Map<String, dynamic>) {
                return {'mapValue': {'fields': _convertMapToFirestoreDoc(item)}};
              } else if (item is String) {
                return {'stringValue': item};
              } else {
                return {'stringValue': item.toString()};
              }
            }).toList()
          }
        };
      } else if (value is Map<String, dynamic>) {
        result[key] = {'mapValue': {'fields': _convertMapToFirestoreDoc(value)}};
      }
    });
    return result;
  }

  static Map<String, dynamic> _convertFirestoreDocToMap(Map<String, dynamic> fields) {
    final Map<String, dynamic> result = {};
    fields.forEach((key, value) {
      if (value is Map<String, dynamic>) {
        if (value.containsKey('stringValue')) {
          result[key] = value['stringValue'];
        } else if (value.containsKey('integerValue')) {
          result[key] = int.tryParse(value['integerValue'].toString()) ?? 0;
        } else if (value.containsKey('doubleValue')) {
          result[key] = (value['doubleValue'] as num).toDouble();
        } else if (value.containsKey('booleanValue')) {
          result[key] = value['booleanValue'];
        } else if (value.containsKey('arrayValue')) {
          final arrayItems = value['arrayValue']['values'] as List<dynamic>? ?? [];
          result[key] = arrayItems.map((item) {
            if (item is Map<String, dynamic>) {
              if (item.containsKey('mapValue')) {
                return _convertFirestoreDocToMap(item['mapValue']['fields'] as Map<String, dynamic>? ?? {});
              } else if (item.containsKey('stringValue')) {
                return item['stringValue'];
              }
            }
            return item.toString();
          }).toList();
        } else if (value.containsKey('mapValue')) {
          result[key] = _convertFirestoreDocToMap(value['mapValue']['fields'] as Map<String, dynamic>? ?? {});
        }
      }
    });
    return result;
  }
}
