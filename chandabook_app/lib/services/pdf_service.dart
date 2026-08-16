import 'dart:typed_data';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import '../models/collection_model.dart';
import '../models/group_model.dart';
import '../core/utils/date_formatter.dart';
import '../core/utils/number_to_words.dart';
import '../core/utils/financial_calculator.dart';

class PdfService {
  // Generate Single Printable Chanda Receipt
  static Future<Uint8List> generateReceiptPdf({
    required GroupModel group,
    required CollectionModel collection,
  }) async {
    final pdf = pw.Document();
    final words = NumberToWords.convert(collection.amount);
    final formattedAmount = DateFormatter.formatCurrency(collection.amount);

    pdf.addPage(
      pw.Page(
        pageFormat: PdfPageFormat.a5,
        margin: const pw.EdgeInsets.all(24),
        build: (pw.Context context) {
          return pw.Container(
            padding: const pw.EdgeInsets.all(16),
            decoration: pw.BoxDecoration(
              border: pw.Border.all(color: PdfColors.orange800, width: 2),
              borderRadius: const pw.BorderRadius.all(pw.Radius.circular(12)),
            ),
            child: pw.Column(
              crossAxisAlignment: pw.CrossAxisAlignment.start,
              children: [
                // Header
                pw.Center(
                  child: pw.Column(
                    children: [
                      pw.Text(
                        '🕉️ SRI GANESHAYA NAMAHA 🕉️',
                        style: pw.TextStyle(
                          fontSize: 10,
                          fontWeight: pw.FontWeight.bold,
                          color: PdfColors.orange900,
                        ),
                      ),
                      pw.SizedBox(height: 4),
                      pw.Text(
                        group.name.toUpperCase(),
                        style: pw.TextStyle(
                          fontSize: 16,
                          fontWeight: pw.FontWeight.bold,
                          color: PdfColors.red900,
                        ),
                      ),
                      if (group.location.isNotEmpty)
                        pw.Text(
                          group.location,
                          style: const pw.TextStyle(fontSize: 9, color: PdfColors.grey700),
                        ),
                      pw.SizedBox(height: 6),
                      pw.Container(
                        padding: const pw.EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                        decoration: const pw.BoxDecoration(
                          color: PdfColors.orange100,
                          borderRadius: pw.BorderRadius.all(pw.Radius.circular(4)),
                        ),
                        child: pw.Text(
                          'OFFICIAL CHANDA DONATION RECEIPT',
                          style: pw.TextStyle(
                            fontSize: 10,
                            fontWeight: pw.FontWeight.bold,
                            color: PdfColors.orange900,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                pw.SizedBox(height: 12),
                pw.Divider(color: PdfColors.orange400, thickness: 1),
                pw.SizedBox(height: 8),

                // Receipt No & Date
                pw.Row(
                  mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                  children: [
                    pw.Text('Receipt No: ${collection.receiptNo}',
                        style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 11)),
                    pw.Text('Date: ${collection.date}',
                        style: const pw.TextStyle(fontSize: 10, color: PdfColors.grey800)),
                  ],
                ),
                pw.SizedBox(height: 12),

                // Details Grid
                _buildReceiptRow('Received with thanks from:', collection.donorName, isBold: true),
                if (collection.phone.isNotEmpty)
                  _buildReceiptRow('Contact Number:', collection.phone),
                if (collection.address.isNotEmpty)
                  _buildReceiptRow('Address / Colony:', collection.address),
                _buildReceiptRow('Payment Mode:', collection.paymentMode),
                _buildReceiptRow('The Sum of (In Words):', words, isItalic: true),
                _buildReceiptRow('Amount Paid (in INR):', formattedAmount, isHighlight: true),

                if (collection.notes.isNotEmpty)
                  _buildReceiptRow('Note / Remarks:', collection.notes),

                pw.Spacer(),

                // Verification & Signature
                pw.Row(
                  mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: pw.CrossAxisAlignment.end,
                  children: [
                    pw.Column(
                      crossAxisAlignment: pw.CrossAxisAlignment.start,
                      children: [
                        pw.BarcodeWidget(
                          data: 'CHANDABOOK:${group.code}:${collection.receiptNo}:${collection.amount}',
                          barcode: pw.Barcode.qrCode(),
                          width: 48,
                          height: 48,
                        ),
                        pw.SizedBox(height: 2),
                        pw.Text('Digital Verification QR',
                            style: const pw.TextStyle(fontSize: 6, color: PdfColors.grey600)),
                      ],
                    ),
                    pw.Column(
                      crossAxisAlignment: pw.CrossAxisAlignment.center,
                      children: [
                        pw.Text(collection.collectedBy,
                            style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 10)),
                        pw.Container(
                          width: 100,
                          height: 1,
                          color: PdfColors.grey800,
                          margin: const pw.EdgeInsets.symmetric(vertical: 2),
                        ),
                        pw.Text('Authorized Volunteer / Collector',
                            style: const pw.TextStyle(fontSize: 8, color: PdfColors.grey700)),
                      ],
                    ),
                  ],
                ),
                pw.SizedBox(height: 4),
                pw.Center(
                  child: pw.Text(
                    'May the divine blessings bring joy, health and prosperity!',
                    style: pw.TextStyle(fontSize: 8, fontStyle: pw.FontStyle.italic, color: PdfColors.orange900),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );

    return pdf.save();
  }

  // Print or Share Receipt
  static Future<void> printReceipt(GroupModel group, CollectionModel collection) async {
    final bytes = await generateReceiptPdf(group: group, collection: collection);
    await Printing.layoutPdf(
      onLayout: (PdfPageFormat format) async => bytes,
      name: 'Receipt_${collection.receiptNo}_${collection.donorName}',
    );
  }

  // Generate Full Festival Statement PDF
  static Future<Uint8List> generateStatementPdf(GroupModel group) async {
    final pdf = pw.Document();
    final financials = FinancialCalculator.compute(group);

    pdf.addPage(
      pw.MultiPage(
        pageFormat: PdfPageFormat.a4,
        margin: const pw.EdgeInsets.all(32),
        build: (pw.Context context) {
          return [
            // Header
            pw.Center(
              child: pw.Column(
                children: [
                  pw.Text(
                    group.name.toUpperCase(),
                    style: pw.TextStyle(fontSize: 20, fontWeight: pw.FontWeight.bold, color: PdfColors.orange900),
                  ),
                  pw.Text('COMPLETE FESTIVAL FINANCIAL STATEMENT & AUDIT REPORT',
                      style: pw.TextStyle(fontSize: 10, fontWeight: pw.FontWeight.bold, color: PdfColors.grey800)),
                  pw.Text('Generated on: ${DateFormatter.formatDateTime(DateTime.now())}',
                      style: const pw.TextStyle(fontSize: 8, color: PdfColors.grey600)),
                ],
              ),
            ),
            pw.SizedBox(height: 16),

            // Financial Summary Card
            pw.Container(
              padding: const pw.EdgeInsets.all(12),
              decoration: pw.BoxDecoration(
                color: PdfColors.orange50,
                borderRadius: const pw.BorderRadius.all(pw.Radius.circular(8)),
                border: pw.Border.all(color: PdfColors.orange300),
              ),
              child: pw.Row(
                mainAxisAlignment: pw.MainAxisAlignment.spaceAround,
                children: [
                  _buildSummaryItem('Total Collections', DateFormatter.formatCurrency(financials.totalCollected), PdfColors.green800),
                  _buildSummaryItem('Total Expenses', DateFormatter.formatCurrency(financials.totalExpenses), PdfColors.red800),
                  _buildSummaryItem('Net In-Hand Balance', DateFormatter.formatCurrency(financials.netBalance), PdfColors.blue800),
                  _buildSummaryItem('Target Goal', DateFormatter.formatCurrency(group.targetGoal), PdfColors.orange900),
                ],
              ),
            ),
            pw.SizedBox(height: 16),

            // Top Volunteer Collectors Table
            pw.Text('VOLUNTEER COLLECTOR SUMMARY', style: pw.TextStyle(fontSize: 12, fontWeight: pw.FontWeight.bold)),
            pw.SizedBox(height: 6),
            pw.Table.fromTextArray(
              headers: ['Rank', 'Volunteer Name', 'No. of Donors', 'Total Collected'],
              data: financials.memberStats.asMap().entries.map((entry) {
                final idx = entry.key + 1;
                final stat = entry.value;
                return [
                  '#$idx',
                  stat.name,
                  stat.count.toString(),
                  DateFormatter.formatCurrency(stat.total),
                ];
              }).toList(),
              headerStyle: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 9),
              cellStyle: const pw.TextStyle(fontSize: 8),
              headerDecoration: const pw.BoxDecoration(color: PdfColors.grey200),
            ),
            pw.SizedBox(height: 16),

            // Expense Breakdown Table
            pw.Text('EXPENSE BREAKDOWN BY CATEGORY', style: pw.TextStyle(fontSize: 12, fontWeight: pw.FontWeight.bold)),
            pw.SizedBox(height: 6),
            pw.Table.fromTextArray(
              headers: ['Category', 'Amount (INR)', 'Share (%)'],
              data: financials.categoryBreakdowns.map((cat) {
                return [
                  cat.label,
                  DateFormatter.formatCurrency(cat.amount),
                  '${cat.percent}%',
                ];
              }).toList(),
              headerStyle: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 9),
              cellStyle: const pw.TextStyle(fontSize: 8),
              headerDecoration: const pw.BoxDecoration(color: PdfColors.grey200),
            ),
            pw.SizedBox(height: 16),

            // Collections List
            pw.Text('ALL DONATIONS & CHANDA COLLECTIONS (${group.collections.length})',
                style: pw.TextStyle(fontSize: 12, fontWeight: pw.FontWeight.bold)),
            pw.SizedBox(height: 6),
            pw.Table.fromTextArray(
              headers: ['Receipt #', 'Donor Name', 'Amount', 'Mode', 'Collector', 'Date'],
              data: group.collections.map((c) {
                return [
                  c.receiptNo,
                  c.donorName,
                  DateFormatter.formatCurrency(c.amount),
                  c.paymentMode,
                  c.collectedBy,
                  c.date,
                ];
              }).toList(),
              headerStyle: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 9),
              cellStyle: const pw.TextStyle(fontSize: 8),
              headerDecoration: const pw.BoxDecoration(color: PdfColors.grey200),
            ),
          ];
        },
      ),
    );

    return pdf.save();
  }

  static Future<void> printStatement(GroupModel group) async {
    final bytes = await generateStatementPdf(group);
    await Printing.layoutPdf(
      onLayout: (PdfPageFormat format) async => bytes,
      name: 'Statement_${group.name.replaceAll(' ', '_')}',
    );
  }

  static pw.Widget _buildReceiptRow(String label, String value, {bool isBold = false, bool isItalic = false, bool isHighlight = false}) {
    return pw.Padding(
      padding: const pw.EdgeInsets.symmetric(vertical: 2.5),
      child: pw.Row(
        crossAxisAlignment: pw.CrossAxisAlignment.start,
        children: [
          pw.SizedBox(
            width: 140,
            child: pw.Text(label, style: const pw.TextStyle(fontSize: 9, color: PdfColors.grey800)),
          ),
          pw.Expanded(
            child: pw.Text(
              value,
              style: pw.TextStyle(
                fontSize: isHighlight ? 12 : 9.5,
                fontWeight: isBold || isHighlight ? pw.FontWeight.bold : pw.FontWeight.normal,
                fontStyle: isItalic ? pw.FontStyle.italic : pw.FontStyle.normal,
                color: isHighlight ? PdfColors.green900 : PdfColors.black,
              ),
            ),
          ),
        ],
      ),
    );
  }

  static pw.Widget _buildSummaryItem(String label, String value, PdfColor color) {
    return pw.Column(
      children: [
        pw.Text(label, style: const pw.TextStyle(fontSize: 8, color: PdfColors.grey700)),
        pw.SizedBox(height: 2),
        pw.Text(value, style: pw.TextStyle(fontSize: 11, fontWeight: pw.FontWeight.bold, color: color)),
      ],
    );
  }
}
