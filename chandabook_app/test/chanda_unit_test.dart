import '../lib/models/collection_model.dart';
import '../lib/models/expense_model.dart';
import '../lib/models/pledge_model.dart';
import '../lib/models/prasadam_model.dart';
import '../lib/models/group_model.dart';
import '../lib/core/utils/number_to_words.dart';

void main() {
  print('Running ChandaBook Unit Tests...');

  // Test 1: Number to Words conversion
  assert(NumberToWords.convert(501) == 'Five Hundred One Rupees Only', 'Failed 501 conversion');
  assert(NumberToWords.convert(1116) == 'One Thousand One Hundred Sixteen Rupees Only', 'Failed 1116 conversion');
  assert(NumberToWords.convert(25000) == 'Twenty Five Thousand Rupees Only', 'Failed 25000 conversion');
  assert(NumberToWords.convert(100000) == 'One Lakh Rupees Only', 'Failed 100000 conversion');
  assert(NumberToWords.convert(5000000) == 'Fifty Lakh Rupees Only', 'Failed 5000000 conversion');
  print('✅ Number to Words Tests Passed');

  // Test 2: Collection Model Serialization
  final col = CollectionModel(
    id: 'col-1',
    receiptNo: 'CB-101',
    donorName: 'Suresh Patil',
    phone: '9876543210',
    amount: 5001.0,
    paymentMode: 'Cash',
    collectedBy: 'Treasurer',
    date: '2026-08-16',
  );

  final colJson = col.toJson();
  final colDeserialized = CollectionModel.fromJson(colJson);
  assert(colDeserialized.donorName == 'Suresh Patil');
  assert(colDeserialized.amount == 5001.0);
  assert(colDeserialized.receiptNo == 'CB-101');
  print('✅ Collection Model Serialization Passed');

  // Test 3: Expense Model Serialization
  final exp = ExpenseModel(
    id: 'exp-1',
    title: 'Ganesh Idol Advance',
    amount: 15000.0,
    category: 'idol',
    paidBy: 'Treasurer',
    date: '2026-08-16',
  );
  final expJson = exp.toJson();
  final expDeserialized = ExpenseModel.fromJson(expJson);
  assert(expDeserialized.amount == 15000.0);
  assert(expDeserialized.category == 'idol');
  print('✅ Expense Model Serialization Passed');

  // Test 4: Pledge Outstanding & Status
  final pledge = PledgeModel(
    id: 'plg-1',
    donorName: 'Kishore Reddy',
    pledgeAmount: 21000.0,
    collectedAmount: 5000.0,
    date: '2026-08-16',
  );
  assert(pledge.outstandingAmount == 16000.0);
  assert(!pledge.isFulfilled);

  final fulfilledPledge = pledge.copyWith(collectedAmount: 21000.0, status: 'fulfilled');
  assert(fulfilledPledge.outstandingAmount == 0.0);
  assert(fulfilledPledge.isFulfilled);
  print('✅ Pledge Calculations Passed');

  // Test 5: Full Group Model
  final group = GroupModel(
    id: 'grp-1',
    name: 'Balaji Ganesh Utsav',
    code: '847291',
    festivalType: 'vinayaka_chavithi',
    targetGoal: 100000.0,
    collections: [col],
    expenses: [exp],
    pledges: [pledge],
  );
  final groupJson = group.toJson();
  final groupDeserialized = GroupModel.fromJson(groupJson);
  assert(groupDeserialized.name == 'Balaji Ganesh Utsav');
  assert(groupDeserialized.collections.length == 1);
  assert(groupDeserialized.expenses.length == 1);
  assert(groupDeserialized.pledges.length == 1);
  print('✅ Group Model Serialization Passed');

  print('\n🎉 ALL TESTS PASSED SUCCESSFULLY! 🎉');
}
