import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/group_model.dart';
import '../models/user_profile_model.dart';

class LocalStorageService {
  static const String _keyGroups = 'chandabook_groups';
  static const String _keyActiveGroupId = 'chandabook_active_group_id';
  static const String _keyUserProfile = 'chandabook_user_profile';
  static const String _keyActiveVolunteer = 'chandabook_active_volunteer';

  static Future<Map<String, GroupModel>> loadAllGroups() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final raw = prefs.getString(_keyGroups);
      if (raw == null || raw.isEmpty) {
        return {};
      }
      final Map<String, dynamic> decoded = jsonDecode(raw);
      return decoded.map((key, value) => MapEntry(key, GroupModel.fromJson(value as Map<String, dynamic>)));
    } catch (e) {
      return {};
    }
  }

  static Future<void> saveAllGroups(Map<String, GroupModel> groups) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final map = groups.map((key, value) => MapEntry(key, value.toJson()));
      await prefs.setString(_keyGroups, jsonEncode(map));
    } catch (e) {
      // Handle or log error
    }
  }

  static Future<String?> getActiveGroupId() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_keyActiveGroupId);
  }

  static Future<void> setActiveGroupId(String? groupId) async {
    final prefs = await SharedPreferences.getInstance();
    if (groupId != null && groupId.isNotEmpty) {
      await prefs.setString(_keyActiveGroupId, groupId);
    } else {
      await prefs.remove(_keyActiveGroupId);
    }
  }

  static Future<UserProfileModel?> getUserProfile() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final raw = prefs.getString(_keyUserProfile);
      if (raw == null) return null;
      return UserProfileModel.fromJson(jsonDecode(raw));
    } catch (e) {
      return null;
    }
  }

  static Future<void> saveUserProfile(UserProfileModel profile) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keyUserProfile, jsonEncode(profile.toJson()));
  }

  static Future<String?> getActiveVolunteer() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_keyActiveVolunteer);
  }

  static Future<void> setActiveVolunteer(String? name) async {
    final prefs = await SharedPreferences.getInstance();
    if (name != null) {
      await prefs.setString(_keyActiveVolunteer, name);
    } else {
      await prefs.remove(_keyActiveVolunteer);
    }
  }
}
