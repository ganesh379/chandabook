import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/group_model.dart';
import '../models/user_profile_model.dart';

/// All Firestore access for the app. Mirrors the web client's contract
/// (src/firebase.js) exactly so both clients interoperate through the same
/// documents and the same `notifyCommitteeActivity` Cloud Function:
///  - groups/{id}       full-document merge-writes, read via realtime stream
///  - users/{uid}        profile + groupIds, read via realtime stream
///  - pushTokens/{token} written by PushService, read only by the Cloud Function
class FirestoreService {
  static final FirebaseFirestore _db = FirebaseFirestore.instance;

  static CollectionReference<Map<String, dynamic>> get _groups => _db.collection('groups');
  static CollectionReference<Map<String, dynamic>> get _users => _db.collection('users');

  // --- Groups ---

  static Stream<GroupModel?> watchGroup(String groupId) {
    return _groups.doc(groupId).snapshots().map((snap) {
      final data = snap.data();
      if (data == null) return null;
      return GroupModel.fromJson(data);
    });
  }

  static Future<void> setGroup(GroupModel group) async {
    await _groups.doc(group.id).set(group.toJson(), SetOptions(merge: true));
  }

  static Future<GroupModel?> fetchGroupByCode(String code) async {
    final trimmed = code.trim();
    if (trimmed.isEmpty) return null;
    final snap = await _groups.where('code', isEqualTo: trimmed).limit(1).get();
    if (snap.docs.isEmpty) return null;
    return GroupModel.fromJson(snap.docs.first.data());
  }

  static Future<List<GroupModel>> fetchGroups(List<String> ids) async {
    if (ids.isEmpty) return [];
    final groups = <GroupModel>[];
    for (final id in ids) {
      final snap = await _groups.doc(id).get();
      final data = snap.data();
      if (data != null) groups.add(GroupModel.fromJson(data));
    }
    return groups;
  }

  // --- User Profile ---

  static Stream<UserProfileModel?> watchUserProfile(String uid) {
    return _users.doc(uid).snapshots().map((snap) {
      final data = snap.data();
      if (data == null) return null;
      return UserProfileModel.fromJson(data);
    });
  }

  static Future<void> setUserProfile(UserProfileModel profile) async {
    await _users.doc(profile.uid).set(profile.toJson(), SetOptions(merge: true));
  }

  static Future<void> linkGroupToUser(String uid, String groupId) async {
    await _users.doc(uid).set({
      'groupIds': FieldValue.arrayUnion([groupId]),
    }, SetOptions(merge: true));
  }
}
