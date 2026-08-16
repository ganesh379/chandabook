import 'package:url_launcher/url_launcher.dart';
import '../models/collection_model.dart';
import '../models/group_model.dart';
import '../models/pledge_model.dart';
import '../models/prasadam_model.dart';
import '../core/utils/date_formatter.dart';
import '../core/utils/number_to_words.dart';

class WhatsAppService {
  static Future<bool> launchWhatsApp(String phone, String text) async {
    String cleanPhone = phone.replaceAll(RegExp(r'[^0-9]'), '');
    if (cleanPhone.length == 10) {
      cleanPhone = '91$cleanPhone';
    }

    final encodedText = Uri.encodeComponent(text);
    final Uri url = Uri.parse(cleanPhone.isNotEmpty 
        ? 'https://wa.me/$cleanPhone?text=$encodedText' 
        : 'https://wa.me/?text=$encodedText');

    try {
      if (await canLaunchUrl(url)) {
        return await launchUrl(url, mode: LaunchMode.externalApplication);
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  static String buildReceiptMessage(GroupModel group, CollectionModel collection) {
    final words = NumberToWords.convert(collection.amount);
    final formattedAmount = DateFormatter.formatCurrency(collection.amount);

    return '🙏 *OFFICIAL CHANDA RECEIPT* 🙏\n'
        '🚩 *${group.name.toUpperCase()}*\n'
        '-----------------------------------\n'
        '🧾 *Receipt No:* ${collection.receiptNo}\n'
        '👤 *Donor Name:* ${collection.donorName}\n'
        '💰 *Amount Paid:* $formattedAmount\n'
        '📝 *In Words:* $words\n'
        '💳 *Mode:* ${collection.paymentMode}\n'
        '📅 *Date:* ${collection.date}\n'
        '🤝 *Collected By:* ${collection.collectedBy}\n'
        '-----------------------------------\n'
        '✨ *May the divine blessings bring health, joy & prosperity to your family!* ✨\n\n'
        '📲 *Digital Receipt powered by ChandaBook*';
  }

  static String buildPledgeReminderMessage(GroupModel group, PledgeModel pledge) {
    final outstanding = DateFormatter.formatCurrency(pledge.outstandingAmount);
    final totalPledged = DateFormatter.formatCurrency(pledge.pledgeAmount);

    return '🙏 *CHANDA PLEDGE REMINDER* 🙏\n'
        '🚩 *${group.name}*\n'
        '-----------------------------------\n'
        'Dear *${pledge.donorName}*,\n'
        'This is a gentle reminder regarding your pledged festival chanda.\n\n'
        '💰 *Pledged Amount:* $totalPledged\n'
        '⏳ *Outstanding Balance:* $outstanding\n'
        '📅 *Pledged On:* ${pledge.date}\n'
        '-----------------------------------\n'
        'Kindly pay at your convenience via Cash or UPI to any committee volunteer.\n\n'
        '🙏 *Thank you for your devotion & generous support!* 🙏\n'
        '— *${group.name} Committee*';
  }

  static String buildVolunteerInviteMessage(GroupModel group) {
    return '🚩 *INVITATION TO JOIN FESTIVAL COMMITTEE* 🚩\n'
        'You have been invited to manage Chanda & Accounts for:\n'
        '🎉 *${group.name}*\n\n'
        '🔑 *6-Digit Join Code:* *${group.code}*\n\n'
        '📲 *How to Join:*\n'
        '1. Open *ChandaBook App*\n'
        '2. Tap "Join Group via Code"\n'
        '3. Enter code: *${group.code}*\n\n'
        'Together let us make this Utsav grand and transparent! 🕉️';
  }

  static String buildPrasadamScheduleMessage(GroupModel group, List<PrasadamModel> schedule) {
    final buffer = StringBuffer();
    buffer.writeln('🍲 *ANNADANAM & PRASADAM SEVA SCHEDULE* 🍲');
    buffer.writeln('🚩 *${group.name}*');
    buffer.writeln('-----------------------------------');

    for (final item in schedule) {
      final slotName = item.slot == 'morning' ? 'Morning Pooja' : 'Evening Maha Prasadam';
      buffer.writeln('📅 *${item.date}* (${slotName})');
      buffer.writeln('👤 *Sponsor:* ${item.sponsorName}');
      if (item.menuItems.isNotEmpty) {
        buffer.writeln('🍛 *Menu:* ${item.menuItems}');
      }
      buffer.writeln('👥 *Devotees:* ~${item.estimatedCount}');
      buffer.writeln('-----------------------------------');
    }

    buffer.writeln('🙏 *May Annapurna Devi bless all sponsors!* 🙏');
    return buffer.toString();
  }
}
