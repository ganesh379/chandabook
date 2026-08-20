import 'dart:async';
import 'dart:math';
import 'package:flutter/foundation.dart';
import 'package:firebase_auth/firebase_auth.dart' show User;
import '../models/group_model.dart';
import '../models/group_member_model.dart';
import '../models/collection_model.dart';
import '../models/expense_model.dart';
import '../models/pledge_model.dart';
import '../models/prasadam_model.dart';
import '../models/user_profile_model.dart';
import '../services/firestore_service.dart';
import '../services/auth_service.dart';
import '../services/deep_link_service.dart';
import '../services/push_service.dart';
import '../core/utils/financial_calculator.dart';
import '../core/utils/date_formatter.dart';

/// App state is entirely realtime and in-memory - there is no local disk
/// cache. Every group the user belongs to has a live Firestore
/// `snapshots()` listener; mutation methods only ever write to Firestore,
/// never touch `_allGroups` directly - the listener callback is the single
/// place that updates state and calls `notifyListeners()`. This means a
/// teammate's change on another phone and your own change arrive through the
/// exact same code path.
class AppStateProvider extends ChangeNotifier {
  Map<String, GroupModel> _allGroups = {};
  String? _activeGroupId;
  String _activeVolunteer = 'Volunteer';
  UserProfileModel? _userProfile;
  bool _isLoading = true;
  String _searchQuery = '';
  String? _selectedCategoryFilter;
  String? _selectedPaymentModeFilter;

  User? _firebaseUser;
  bool _authResolved = false;
  String? _pendingInviteCode;

  StreamSubscription<UserProfileModel?>? _profileSub;
  final Map<String, StreamSubscription<GroupModel?>> _groupSubs = {};

  Map<String, GroupModel> get allGroups => _allGroups;
  String? get activeGroupId => _activeGroupId;
  String get activeVolunteer => _activeVolunteer;
  UserProfileModel? get userProfile => _userProfile;
  bool get isLoading => _isLoading;
  String get searchQuery => _searchQuery;
  String? get selectedCategoryFilter => _selectedCategoryFilter;
  String? get selectedPaymentModeFilter => _selectedPaymentModeFilter;

  User? get firebaseUser => _firebaseUser;
  bool get isAuthenticated => _firebaseUser != null;
  bool get authResolved => _authResolved;
  String? get pendingInviteCode => _pendingInviteCode;

  /// Returns true if the currently signed-in user has the 'admin' role in
  /// the active group. The group creator is always admin; joiners are volunteers.
  bool get isCurrentUserAdmin {
    final user = _firebaseUser;
    final group = activeGroup;
    if (user == null || group == null) return false;

    final uid = user.uid;
    final profile = _userProfile;
    final userName = (profile?.fullName ?? user.displayName ?? '').trim().toLowerCase();
    final userEmail = (profile?.email ?? user.email ?? '').trim().toLowerCase();

    // 1. Direct UID match in memberAccounts
    final memberByUid = group.memberAccounts.where((m) => m.uid.isNotEmpty && m.uid == uid).firstOrNull;
    if (memberByUid != null) {
      return memberByUid.role == 'admin' || memberByUid.designation.toLowerCase() == 'admin';
    }

    // 2. Name or Email match in memberAccounts
    final memberByNameOrEmail = group.memberAccounts.where((m) {
      final mName = m.name.trim().toLowerCase();
      final mEmail = m.email.trim().toLowerCase();
      return (userName.isNotEmpty && mName == userName) || (userEmail.isNotEmpty && mEmail == userEmail);
    }).firstOrNull;
    if (memberByNameOrEmail != null) {
      return memberByNameOrEmail.role == 'admin' || memberByNameOrEmail.designation.toLowerCase() == 'admin';
    }

    // 3. Fallback: If createdBy matches current user UID
    if (group.createdBy != null && group.createdBy == uid) {
      return true;
    }

    // 4. Fallback: If current user matches first member in group.members
    if (group.members.isNotEmpty && userName.isNotEmpty) {
      if (group.members.first.trim().toLowerCase() == userName) {
        return true;
      }
    }

    // 5. Fallback: If legacy group has no memberAccounts configured yet, allow admin access
    if (group.memberAccounts.isEmpty) {
      return true;
    }

    return false;
  }

  GroupModel? get activeGroup {
    if (_activeGroupId != null && _allGroups.containsKey(_activeGroupId)) {
      return _allGroups[_activeGroupId];
    }
    if (_allGroups.isNotEmpty) {
      return _allGroups.values.first;
    }
    return null;
  }

  GroupFinancials get financials => FinancialCalculator.compute(activeGroup);

  Future<void> initialize() async {
    _isLoading = true;
    notifyListeners();

    try {
      // Capture a cold-start invite link (?join=CODE / chandabook://join?code=CODE)
      // before wiring up the live listener, so it isn't missed.
      final initialInvite = await DeepLinkService.getInitialInviteCode();
      if (initialInvite != null) {
        _pendingInviteCode = initialInvite;
      }
      DeepLinkService.listen((code) {
        _pendingInviteCode = code;
        notifyListeners();
      });

      await PushService.initialize();

      AuthService.authStateChanges.listen(_onAuthStateChanged);
    } catch (e) {
      debugPrint('Init error: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> _onAuthStateChanged(User? user) async {
    await _profileSub?.cancel();
    await _cancelGroupSubscriptions();

    _firebaseUser = user;
    _authResolved = true;

    if (user == null) {
      _userProfile = null;
      _allGroups = {};
      _activeGroupId = null;
      notifyListeners();
      return;
    }

    _profileSub = FirestoreService.watchUserProfile(user.uid).listen((profile) async {
      if (profile == null) {
        // First sign-in for this account - no Firestore profile yet. Create
        // one; the write re-triggers this listener with the saved profile.
        await FirestoreService.setUserProfile(UserProfileModel(
          uid: user.uid,
          fullName: user.displayName ?? 'Committee Volunteer',
          email: user.email ?? '',
          photoURL: user.photoURL ?? '',
          isProfileComplete: false,
        ));
        return;
      }

      _userProfile = profile;
      if (_activeVolunteer == 'Volunteer' && profile.fullName.isNotEmpty) {
        _activeVolunteer = profile.fullName;
      }
      notifyListeners();
      await _syncGroupSubscriptions(profile.groupIds);
    });
  }

  // Keeps one realtime listener per group the user's profile says they
  // belong to, adding/removing subscriptions as `groupIds` changes.
  Future<void> _syncGroupSubscriptions(List<String> groupIds) async {
    final toRemove = _groupSubs.keys.where((id) => !groupIds.contains(id)).toList();
    for (final id in toRemove) {
      await _groupSubs.remove(id)?.cancel();
      _allGroups.remove(id);
    }

    for (final id in groupIds) {
      if (_groupSubs.containsKey(id)) continue;
      _groupSubs[id] = FirestoreService.watchGroup(id).listen((group) async {
        if (group == null) {
          _allGroups.remove(id);
        } else {
          // Auto-backfill memberAccounts if missing on Firestore
          if (group.memberAccounts.isEmpty && group.members.isNotEmpty) {
            final accounts = <GroupMemberModel>[];
            for (int i = 0; i < group.members.length; i++) {
              final mName = group.members[i];
              final isMe = (_userProfile != null && mName == _userProfile!.fullName);
              final isFirst = (i == 0);
              accounts.add(GroupMemberModel(
                uid: isMe ? (_firebaseUser?.uid ?? '') : '',
                name: mName,
                email: isMe ? (_userProfile?.email ?? '') : '',
                photoURL: isMe ? (_userProfile?.photoURL ?? '') : '',
                role: isFirst ? 'admin' : 'volunteer',
                designation: isFirst ? 'Admin' : 'Volunteer',
              ));
            }
            final fixedGroup = group.copyWith(memberAccounts: accounts);
            _allGroups[id] = fixedGroup;
            await FirestoreService.setGroup(fixedGroup);
          } else {
            _allGroups[id] = group;
          }
        }
        notifyListeners();
      });
    }

    if (_activeGroupId == null && _allGroups.isNotEmpty) {
      _activeGroupId = _allGroups.keys.first;
    }

    if (toRemove.isNotEmpty) notifyListeners();
    await _registerPushForActiveGroup();
  }

  Future<void> _cancelGroupSubscriptions() async {
    for (final sub in _groupSubs.values) {
      await sub.cancel();
    }
    _groupSubs.clear();
  }

  Future<void> _registerPushForActiveGroup() async {
    final group = activeGroup;
    if (group != null) {
      await PushService.registerPushToken(group, _activeVolunteer);
    }
  }

  // --- Auth Actions ---
  Future<bool> signInWithGoogle() async {
    final user = await AuthService.signInWithGoogle();
    return user != null;
  }

  Future<void> completeProfile({
    required String fullName,
    String phone = '',
    String city = '',
  }) async {
    final user = _firebaseUser;
    if (user == null) return;

    final updatedProfile = (_userProfile ?? UserProfileModel(uid: user.uid, fullName: fullName)).copyWith(
      uid: user.uid,
      fullName: fullName,
      phone: phone,
      city: city,
      email: user.email ?? _userProfile?.email ?? '',
      photoURL: user.photoURL ?? _userProfile?.photoURL ?? '',
      isProfileComplete: true,
    );

    await FirestoreService.setUserProfile(updatedProfile);
    // No manual state update needed - the watchUserProfile listener picks this up.
  }

  void clearPendingInvite() {
    _pendingInviteCode = null;
    notifyListeners();
  }

  Future<void> signOut() async {
    await PushService.unregisterPushToken();
    await _profileSub?.cancel();
    await _cancelGroupSubscriptions();
    await AuthService.signOut();
    _allGroups = {};
    _activeGroupId = null;
    _userProfile = null;
    _firebaseUser = null;
    _pendingInviteCode = null;
    _activeVolunteer = 'Volunteer';
    notifyListeners();
  }

  // --- Invite-Link Join ---
  Future<GroupModel?> previewGroupByCode(String code) async {
    final trimmed = code.trim();
    for (final group in _allGroups.values) {
      if (group.code == trimmed) return group;
    }
    return FirestoreService.fetchGroupByCode(trimmed);
  }

  // Adds the signed-in user to a group's roster (both the legacy display-name
  // list every screen reads, and the uid/role-tracked memberAccounts list) if
  // they aren't already on it. Shared by every way someone can end up
  // attached to a group - creating one, joining by code, or joining via an
  // invite link - so all three consistently show up on the Team page.
  GroupModel _withCurrentUserAsMember(GroupModel group, {String role = 'volunteer'}) {
    final user = _firebaseUser;
    final profile = _userProfile;
    if (user == null || profile == null) return group;
    if (group.memberAccounts.any((m) => m.uid == user.uid)) return group;

    return group.copyWith(
      members: group.members.contains(profile.fullName) ? group.members : [...group.members, profile.fullName],
      memberAccounts: [
        ...group.memberAccounts,
        GroupMemberModel(
          uid: user.uid,
          name: profile.fullName,
          email: profile.email,
          photoURL: profile.photoURL,
          role: role,
        ),
      ],
    );
  }

  Future<void> joinAsVolunteer(GroupModel group) async {
    final user = _firebaseUser;
    final profile = _userProfile;
    if (user == null || profile == null) return;

    final updatedGroup = _withCurrentUserAsMember(group, role: 'volunteer');

    await FirestoreService.setGroup(updatedGroup);
    await FirestoreService.linkGroupToUser(user.uid, updatedGroup.id);

    // Seed immediately rather than waiting for the listener round-trip, so
    // the UI doesn't sit on an empty dashboard for the moment it takes the
    // new group subscription to attach.
    _allGroups[updatedGroup.id] = updatedGroup;
    _activeGroupId = updatedGroup.id;
    _activeVolunteer = profile.fullName;
    _pendingInviteCode = null;
    notifyListeners();

    await _registerPushForActiveGroup();
  }

  // --- Collection Actions ---
  Future<void> addCollection(CollectionModel collection) async {
    final current = activeGroup;
    if (current == null) return;
    await FirestoreService.setGroup(current.copyWith(
      collections: [collection, ...current.collections],
      updatedAt: DateTime.now().toIso8601String(),
    ));
  }

  Future<void> editCollection(CollectionModel collection) async {
    final current = activeGroup;
    if (current == null) return;
    final updatedCollections = current.collections.map((c) => c.id == collection.id ? collection : c).toList();
    await FirestoreService.setGroup(current.copyWith(
      collections: updatedCollections,
      updatedAt: DateTime.now().toIso8601String(),
    ));
  }

  Future<void> deleteCollection(String id) async {
    final current = activeGroup;
    if (current == null) return;
    await FirestoreService.setGroup(current.copyWith(
      collections: current.collections.where((c) => c.id != id).toList(),
      updatedAt: DateTime.now().toIso8601String(),
    ));
  }

  // --- Expense Actions ---
  Future<void> addExpense(ExpenseModel expense) async {
    final current = activeGroup;
    if (current == null) return;
    await FirestoreService.setGroup(current.copyWith(
      expenses: [expense, ...current.expenses],
      updatedAt: DateTime.now().toIso8601String(),
    ));
  }

  Future<void> deleteExpense(String id) async {
    final current = activeGroup;
    if (current == null) return;
    await FirestoreService.setGroup(current.copyWith(
      expenses: current.expenses.where((e) => e.id != id).toList(),
      updatedAt: DateTime.now().toIso8601String(),
    ));
  }

  // --- Pledge Actions ---
  Future<void> addPledge(PledgeModel pledge) async {
    final current = activeGroup;
    if (current == null) return;
    await FirestoreService.setGroup(current.copyWith(
      pledges: [pledge, ...current.pledges],
      updatedAt: DateTime.now().toIso8601String(),
    ));
  }

  Future<void> recordPledgePayment({
    required PledgeModel pledge,
    required double paymentAmount,
    required String paymentMode,
    required String collectedBy,
  }) async {
    final current = activeGroup;
    if (current == null) return;

    final newReceiptNo = generateNextReceiptNo();
    final newCollection = CollectionModel(
      id: 'col-${DateTime.now().millisecondsSinceEpoch}',
      receiptNo: newReceiptNo,
      donorName: pledge.donorName,
      phone: pledge.phone,
      address: pledge.address,
      amount: paymentAmount,
      paymentMode: paymentMode,
      collectedBy: collectedBy,
      date: DateFormatter.todayIso(),
      notes: 'Pledge Settlement (#${pledge.id})',
    );

    final updatedCollected = pledge.collectedAmount + paymentAmount;
    final isFulfilled = updatedCollected >= pledge.pledgeAmount;

    final updatedPledge = pledge.copyWith(
      collectedAmount: updatedCollected,
      status: isFulfilled ? 'fulfilled' : 'partial',
      linkedCollectionIds: [...pledge.linkedCollectionIds, newCollection.id],
    );

    final updatedPledges = current.pledges.map((p) => p.id == pledge.id ? updatedPledge : p).toList();

    await FirestoreService.setGroup(current.copyWith(
      collections: [newCollection, ...current.collections],
      pledges: updatedPledges,
      updatedAt: DateTime.now().toIso8601String(),
    ));
  }

  Future<void> deletePledge(String id) async {
    final current = activeGroup;
    if (current == null) return;
    await FirestoreService.setGroup(current.copyWith(
      pledges: current.pledges.where((p) => p.id != id).toList(),
      updatedAt: DateTime.now().toIso8601String(),
    ));
  }

  // --- Prasadam Schedule Actions ---
  Future<void> addPrasadam(PrasadamModel item) async {
    final current = activeGroup;
    if (current == null) return;
    await FirestoreService.setGroup(current.copyWith(
      prasadamSchedule: [item, ...current.prasadamSchedule],
      updatedAt: DateTime.now().toIso8601String(),
    ));
  }

  Future<void> deletePrasadam(String id) async {
    final current = activeGroup;
    if (current == null) return;
    await FirestoreService.setGroup(current.copyWith(
      prasadamSchedule: current.prasadamSchedule.where((p) => p.id != id).toList(),
      updatedAt: DateTime.now().toIso8601String(),
    ));
  }

  // --- Group Management ---
  Future<GroupModel> createGroup({
    required String name,
    required String festivalType,
    required double targetGoal,
    required String upiId,
    required String upiPayeeName,
    required String location,
    required List<String> members,
  }) async {
    final code = (100000 + Random().nextInt(900000)).toString();
    final newGroup = _withCurrentUserAsMember(
      GroupModel(
        id: 'group-${DateTime.now().millisecondsSinceEpoch}',
        name: name,
        code: code,
        festivalType: festivalType,
        targetGoal: targetGoal,
        upiId: upiId,
        upiPayeeName: upiPayeeName,
        location: location,
        members: members.isNotEmpty ? members : ['Treasurer', 'President'],
      ),
      role: 'admin',
    );

    await FirestoreService.setGroup(newGroup);
    final user = _firebaseUser;
    if (user != null) {
      await FirestoreService.linkGroupToUser(user.uid, newGroup.id);
    }

    _allGroups[newGroup.id] = newGroup;
    _activeGroupId = newGroup.id;
    notifyListeners();
    await _registerPushForActiveGroup();
    return newGroup;
  }

  Future<void> switchGroup(String groupId) async {
    if (_allGroups.containsKey(groupId)) {
      _activeGroupId = groupId;
      notifyListeners();
      await _registerPushForActiveGroup();
    }
  }

  Future<bool> joinGroupByCode(String code) async {
    GroupModel? group;
    for (final g in _allGroups.values) {
      if (g.code == code.trim()) {
        group = g;
        break;
      }
    }
    group ??= await FirestoreService.fetchGroupByCode(code.trim());
    if (group == null) return false;

    final updatedGroup = _withCurrentUserAsMember(group, role: 'volunteer');
    await FirestoreService.setGroup(updatedGroup);

    final user = _firebaseUser;
    if (user != null) {
      await FirestoreService.linkGroupToUser(user.uid, updatedGroup.id);
    }

    _allGroups[updatedGroup.id] = updatedGroup;
    _activeGroupId = updatedGroup.id;
    notifyListeners();
    await _registerPushForActiveGroup();
    return true;
  }

  Future<void> updateGroup(GroupModel updatedGroup) async {
    await FirestoreService.setGroup(updatedGroup.copyWith(
      updatedAt: DateTime.now().toIso8601String(),
    ));
  }

  Future<void> updateMemberRole({
    required String memberName,
    required String designation,
    required bool isAdmin,
  }) async {
    final current = activeGroup;
    if (current == null) return;

    final roleStr = (isAdmin || designation.toLowerCase() == 'admin') ? 'admin' : 'volunteer';

    final existingAccounts = List<GroupMemberModel>.from(current.memberAccounts);
    final idx = existingAccounts.indexWhere((m) => m.name.toLowerCase() == memberName.toLowerCase());

    if (idx >= 0) {
      existingAccounts[idx] = existingAccounts[idx].copyWith(
        role: roleStr,
        designation: designation,
      );
    } else {
      existingAccounts.add(GroupMemberModel(
        uid: '',
        name: memberName,
        role: roleStr,
        designation: designation,
      ));
    }

    final updatedGroup = current.copyWith(
      memberAccounts: existingAccounts,
      updatedAt: DateTime.now().toIso8601String(),
    );

    await FirestoreService.setGroup(updatedGroup);
    _allGroups[updatedGroup.id] = updatedGroup;
    notifyListeners();
  }

  Future<void> removeMember(String memberName) async {
    final current = activeGroup;
    if (current == null) return;

    final updatedMembers = current.members.where((m) => m != memberName).toList();
    final updatedAccounts = current.memberAccounts.where((m) => m.name != memberName).toList();

    final updatedGroup = current.copyWith(
      members: updatedMembers,
      memberAccounts: updatedAccounts,
      updatedAt: DateTime.now().toIso8601String(),
    );

    await FirestoreService.setGroup(updatedGroup);
    _allGroups[updatedGroup.id] = updatedGroup;
    notifyListeners();
  }

  String generateNextReceiptNo() {
    final count = (activeGroup?.collections.length ?? 0) + 101;
    return 'CB-$count';
  }

  void setActiveVolunteer(String name) {
    _activeVolunteer = name;
    notifyListeners();
  }

  void setSearchQuery(String query) {
    _searchQuery = query;
    notifyListeners();
  }

  void setCategoryFilter(String? category) {
    _selectedCategoryFilter = category;
    notifyListeners();
  }

  void setPaymentModeFilter(String? mode) {
    _selectedPaymentModeFilter = mode;
    notifyListeners();
  }
}
