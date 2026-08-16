import 'dart:math';
import 'package:flutter/foundation.dart';
import '../models/group_model.dart';
import '../models/collection_model.dart';
import '../models/expense_model.dart';
import '../models/pledge_model.dart';
import '../models/prasadam_model.dart';
import '../models/user_profile_model.dart';
import '../services/local_storage_service.dart';
import '../services/firebase_service.dart';
import '../core/utils/financial_calculator.dart';
import '../core/utils/date_formatter.dart';

class AppStateProvider extends ChangeNotifier {
  Map<String, GroupModel> _allGroups = {};
  String? _activeGroupId;
  String _activeVolunteer = 'Rahul (Treasurer)';
  UserProfileModel? _userProfile;
  bool _isLoading = true;
  bool _isSyncing = false;
  String _searchQuery = '';
  String? _selectedCategoryFilter;
  String? _selectedPaymentModeFilter;

  Map<String, GroupModel> get allGroups => _allGroups;
  String? get activeGroupId => _activeGroupId;
  String get activeVolunteer => _activeVolunteer;
  UserProfileModel? get userProfile => _userProfile;
  bool get isLoading => _isLoading;
  bool get isSyncing => _isSyncing;
  String get searchQuery => _searchQuery;
  String? get selectedCategoryFilter => _selectedCategoryFilter;
  String? get selectedPaymentModeFilter => _selectedPaymentModeFilter;

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

  // Initialize and load saved state
  Future<void> initialize() async {
    _isLoading = true;
    notifyListeners();

    try {
      _allGroups = await LocalStorageService.loadAllGroups();
      _activeGroupId = await LocalStorageService.getActiveGroupId();
      _userProfile = await LocalStorageService.getUserProfile();
      final savedVolunteer = await LocalStorageService.getActiveVolunteer();
      if (savedVolunteer != null && savedVolunteer.isNotEmpty) {
        _activeVolunteer = savedVolunteer;
      }

      // If no group exists, create default festival group
      if (_allGroups.isEmpty) {
        final defaultGroup = _createDefaultGroup();
        _allGroups[defaultGroup.id] = defaultGroup;
        _activeGroupId = defaultGroup.id;
        await _saveLocalState();
      } else if (_activeGroupId == null || !_allGroups.containsKey(_activeGroupId)) {
        _activeGroupId = _allGroups.keys.first;
        await LocalStorageService.setActiveGroupId(_activeGroupId);
      }
    } catch (e) {
      debugPrint('Init error: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  GroupModel _createDefaultGroup() {
    final code = (100000 + Random().nextInt(900000)).toString();
    final today = DateFormatter.todayIso();
    return GroupModel(
      id: 'group-${DateTime.now().millisecondsSinceEpoch}',
      name: 'Vinayaka Chavithi Utsav 2026',
      code: code,
      festivalType: 'vinayaka_chavithi',
      targetGoal: 100000,
      upiId: 'utsavcommittee@upi',
      upiPayeeName: 'Vinayaka Utsav Samithi',
      location: 'Central Colony Pandal',
      year: '2026',
      members: ['Rahul (Treasurer)', 'Vikram (President)', 'Suresh (Secretary)', 'Anand (Volunteer)'],
      collections: [
        CollectionModel(
          id: 'col-1',
          receiptNo: 'CB-101',
          donorName: 'Suresh Patil & Family',
          phone: '9876543210',
          address: 'Flat 402, Block B',
          amount: 5001,
          paymentMode: 'Cash',
          collectedBy: 'Rahul (Treasurer)',
          date: today,
          notes: 'Special Pooja Sankalpam',
        ),
        CollectionModel(
          id: 'col-2',
          receiptNo: 'CB-102',
          donorName: 'Meera Deshmukh',
          phone: '9822012345',
          address: 'House No 12, Main Road',
          amount: 11000,
          paymentMode: 'UPI / GPay / PhonePe',
          collectedBy: 'Vikram (President)',
          date: today,
          notes: 'Maha Prasadam Sponsor',
        ),
        CollectionModel(
          id: 'col-3',
          receiptNo: 'CB-103',
          donorName: 'Aryan Gupta',
          phone: '9845098765',
          address: 'Plot 77, Green Avenue',
          amount: 2500,
          paymentMode: 'UPI / GPay / PhonePe',
          collectedBy: 'Rahul (Treasurer)',
          date: today,
        ),
      ],
      expenses: [
        ExpenseModel(
          id: 'exp-1',
          title: 'Eco-Friendly Ganesha Idol Advance',
          amount: 15000,
          category: 'idol',
          paidBy: 'Rahul (Treasurer)',
          date: today,
          notes: 'Artisan Advance Receipt #24',
        ),
        ExpenseModel(
          id: 'exp-2',
          title: 'Pandal & Stage Setup Advance',
          amount: 8000,
          category: 'pandal',
          paidBy: 'Vikram (President)',
          date: today,
          notes: 'Tent House Booking',
        ),
      ],
      pledges: [
        PledgeModel(
          id: 'plg-1',
          donorName: 'Kishore Reddy',
          phone: '9880011223',
          address: 'Villa 14, Royal Palm',
          pledgeAmount: 21000,
          collectedAmount: 0,
          status: 'pending',
          date: today,
          notes: 'Will transfer via GPay before Laddu Auction',
        ),
      ],
      prasadamSchedule: [
        PrasadamModel(
          id: 'prs-1',
          date: today,
          slot: 'morning',
          sponsorName: 'Meera Deshmukh & Family',
          sponsorPhone: '9822012345',
          menuItems: 'Pulihora, Rava Kesari & Chana Sundal',
          estimatedCount: 250,
          status: 'confirmed',
          costEstimate: 5000,
        ),
      ],
    );
  }

  // --- Collection Actions ---
  Future<void> addCollection(CollectionModel collection) async {
    final current = activeGroup;
    if (current == null) return;

    final updated = current.copyWith(
      collections: [collection, ...current.collections],
      updatedAt: DateTime.now().toIso8601String(),
    );

    _allGroups[updated.id] = updated;
    notifyListeners();
    await _saveLocalState();
    _triggerCloudSync(updated);
  }

  Future<void> editCollection(CollectionModel collection) async {
    final current = activeGroup;
    if (current == null) return;

    final updatedCollections = current.collections.map((c) => c.id == collection.id ? collection : c).toList();
    final updated = current.copyWith(
      collections: updatedCollections,
      updatedAt: DateTime.now().toIso8601String(),
    );

    _allGroups[updated.id] = updated;
    notifyListeners();
    await _saveLocalState();
    _triggerCloudSync(updated);
  }

  Future<void> deleteCollection(String id) async {
    final current = activeGroup;
    if (current == null) return;

    final updated = current.copyWith(
      collections: current.collections.where((c) => c.id != id).toList(),
      updatedAt: DateTime.now().toIso8601String(),
    );

    _allGroups[updated.id] = updated;
    notifyListeners();
    await _saveLocalState();
    _triggerCloudSync(updated);
  }

  // --- Expense Actions ---
  Future<void> addExpense(ExpenseModel expense) async {
    final current = activeGroup;
    if (current == null) return;

    final updated = current.copyWith(
      expenses: [expense, ...current.expenses],
      updatedAt: DateTime.now().toIso8601String(),
    );

    _allGroups[updated.id] = updated;
    notifyListeners();
    await _saveLocalState();
    _triggerCloudSync(updated);
  }

  Future<void> deleteExpense(String id) async {
    final current = activeGroup;
    if (current == null) return;

    final updated = current.copyWith(
      expenses: current.expenses.where((e) => e.id != id).toList(),
      updatedAt: DateTime.now().toIso8601String(),
    );

    _allGroups[updated.id] = updated;
    notifyListeners();
    await _saveLocalState();
    _triggerCloudSync(updated);
  }

  // --- Pledge Actions ---
  Future<void> addPledge(PledgeModel pledge) async {
    final current = activeGroup;
    if (current == null) return;

    final updated = current.copyWith(
      pledges: [pledge, ...current.pledges],
      updatedAt: DateTime.now().toIso8601String(),
    );

    _allGroups[updated.id] = updated;
    notifyListeners();
    await _saveLocalState();
    _triggerCloudSync(updated);
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

    final updated = current.copyWith(
      collections: [newCollection, ...current.collections],
      pledges: updatedPledges,
      updatedAt: DateTime.now().toIso8601String(),
    );

    _allGroups[updated.id] = updated;
    notifyListeners();
    await _saveLocalState();
    _triggerCloudSync(updated);
  }

  Future<void> deletePledge(String id) async {
    final current = activeGroup;
    if (current == null) return;

    final updated = current.copyWith(
      pledges: current.pledges.where((p) => p.id != id).toList(),
      updatedAt: DateTime.now().toIso8601String(),
    );

    _allGroups[updated.id] = updated;
    notifyListeners();
    await _saveLocalState();
    _triggerCloudSync(updated);
  }

  // --- Prasadam Schedule Actions ---
  Future<void> addPrasadam(PrasadamModel item) async {
    final current = activeGroup;
    if (current == null) return;

    final updated = current.copyWith(
      prasadamSchedule: [item, ...current.prasadamSchedule],
      updatedAt: DateTime.now().toIso8601String(),
    );

    _allGroups[updated.id] = updated;
    notifyListeners();
    await _saveLocalState();
    _triggerCloudSync(updated);
  }

  Future<void> deletePrasadam(String id) async {
    final current = activeGroup;
    if (current == null) return;

    final updated = current.copyWith(
      prasadamSchedule: current.prasadamSchedule.where((p) => p.id != id).toList(),
      updatedAt: DateTime.now().toIso8601String(),
    );

    _allGroups[updated.id] = updated;
    notifyListeners();
    await _saveLocalState();
    _triggerCloudSync(updated);
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
    final newGroup = GroupModel(
      id: 'group-${DateTime.now().millisecondsSinceEpoch}',
      name: name,
      code: code,
      festivalType: festivalType,
      targetGoal: targetGoal,
      upiId: upiId,
      upiPayeeName: upiPayeeName,
      location: location,
      members: members.isNotEmpty ? members : ['Treasurer', 'President'],
    );

    _allGroups[newGroup.id] = newGroup;
    _activeGroupId = newGroup.id;
    notifyListeners();
    await _saveLocalState();
    _triggerCloudSync(newGroup);
    return newGroup;
  }

  Future<void> switchGroup(String groupId) async {
    if (_allGroups.containsKey(groupId)) {
      _activeGroupId = groupId;
      await LocalStorageService.setActiveGroupId(groupId);
      notifyListeners();
    }
  }

  Future<bool> joinGroupByCode(String code) async {
    // Check locally first
    for (final group in _allGroups.values) {
      if (group.code == code.trim()) {
        _activeGroupId = group.id;
        await LocalStorageService.setActiveGroupId(group.id);
        notifyListeners();
        return true;
      }
    }

    // Try fetching from Cloud Firestore
    _isSyncing = true;
    notifyListeners();
    final remoteGroup = await FirebaseService.fetchGroupByCode(code.trim());
    _isSyncing = false;

    if (remoteGroup != null) {
      _allGroups[remoteGroup.id] = remoteGroup;
      _activeGroupId = remoteGroup.id;
      await _saveLocalState();
      notifyListeners();
      return true;
    }

    notifyListeners();
    return false;
  }

  Future<void> updateGroup(GroupModel updatedGroup) async {
    final groupWithTimestamp = updatedGroup.copyWith(
      updatedAt: DateTime.now().toIso8601String(),
    );
    _allGroups[groupWithTimestamp.id] = groupWithTimestamp;
    notifyListeners();
    await _saveLocalState();
    _triggerCloudSync(groupWithTimestamp);
  }

  String generateNextReceiptNo() {
    final count = (activeGroup?.collections.length ?? 0) + 101;
    return 'CB-$count';
  }

  Future<void> setActiveVolunteer(String name) async {
    _activeVolunteer = name;
    await LocalStorageService.setActiveVolunteer(name);
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

  Future<void> _saveLocalState() async {
    await LocalStorageService.saveAllGroups(_allGroups);
    await LocalStorageService.setActiveGroupId(_activeGroupId);
  }

  void _triggerCloudSync(GroupModel group) {
    _isSyncing = true;
    FirebaseService.syncGroupToFirestore(group).then((_) {
      _isSyncing = false;
      notifyListeners();
    }).catchError((_) {
      _isSyncing = false;
      notifyListeners();
    });
  }
}
