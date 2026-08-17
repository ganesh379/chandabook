import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_state_provider.dart';
import '../core/theme/app_theme.dart';
import '../core/constants/app_constants.dart';
import 'dashboard_screen.dart';
import 'chanda_list_screen.dart';
import 'expenses_screen.dart';
import 'members_leaderboard_screen.dart';
import 'reports_settings_screen.dart';
import 'add_chanda_dialog.dart';
import 'group_selector_screen.dart';
import 'upi_qr_screen.dart';
import 'notifications_screen.dart';

class MainNavigationScreen extends StatefulWidget {
  const MainNavigationScreen({super.key});

  @override
  State<MainNavigationScreen> createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends State<MainNavigationScreen> {
  int _currentIndex = 0;

  final List<Widget> _screens = [
    const DashboardScreen(),
    const ChandaListScreen(),
    const ExpensesScreen(),
    const MembersLeaderboardScreen(),
    const ReportsSettingsScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppStateProvider>();
    final group = state.activeGroup;
    final activeFestival = AppConstants.getFestivalType(group?.festivalType);

    return Scaffold(
      appBar: AppBar(
        titleSpacing: 16,
        title: InkWell(
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const GroupSelectorScreen()),
            );
          },
          borderRadius: BorderRadius.circular(8),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(activeFestival.icon, style: const TextStyle(fontSize: 20)),
              const SizedBox(width: 8),
              Flexible(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Flexible(
                          child: Text(
                            group?.name ?? 'ChandaBook',
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const Icon(Icons.arrow_drop_down, size: 18, color: AppTheme.textMuted),
                      ],
                    ),
                    if (group != null)
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                            decoration: BoxDecoration(
                              color: AppTheme.primarySaffron.withOpacity(0.15),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Text(
                                  'CODE: ',
                                  style: TextStyle(
                                    fontSize: 9,
                                    fontWeight: FontWeight.bold,
                                    color: AppTheme.primarySaffronDark,
                                  ),
                                ),
                                Text(
                                  group.code,
                                  style: const TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                    letterSpacing: 1,
                                    color: AppTheme.primarySaffronDark,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                  ],
                ),
              ),
            ],
          ),
        ),
        actions: [
          // Live Activity / Notifications Button
          IconButton(
            icon: const Icon(Icons.notifications_outlined, color: AppTheme.textMain),
            tooltip: 'Live Alerts & Activity',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const NotificationsScreen()),
              );
            },
          ),
          // UPI QR Button
          IconButton(
            icon: const Icon(Icons.qr_code_2, color: AppTheme.textMain),
            tooltip: 'UPI QR Code',
            onPressed: () {
              if (group != null) {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => UpiQrScreen(group: group)),
                );
              }
            },
          ),
          // Volunteer Badge
          PopupMenuButton<String>(
            tooltip: 'Change Active Collector',
            initialValue: state.activeVolunteer,
            onSelected: (volunteer) {
              state.setActiveVolunteer(volunteer);
            },
            itemBuilder: (context) {
              return (group?.members ?? ['Treasurer']).map((m) {
                return PopupMenuItem<String>(
                  value: m,
                  child: Row(
                    children: [
                      Icon(
                        Icons.person,
                        size: 16,
                        color: m == state.activeVolunteer ? AppTheme.primarySaffron : AppTheme.textMuted,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        m,
                        style: TextStyle(
                          fontWeight: m == state.activeVolunteer ? FontWeight.bold : FontWeight.normal,
                          color: m == state.activeVolunteer ? AppTheme.primarySaffron : AppTheme.textMain,
                        ),
                      ),
                    ],
                  ),
                );
              }).toList();
            },
            child: Container(
              margin: const EdgeInsets.only(right: 12),
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppTheme.borderSubtle),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const CircleAvatar(
                    radius: 9,
                    backgroundColor: AppTheme.primarySaffron,
                    child: Icon(Icons.person, size: 12, color: Colors.white),
                  ),
                  const SizedBox(width: 6),
                  ConstrainedBox(
                    constraints: const BoxConstraints(maxWidth: 80),
                    child: Text(
                      state.activeVolunteer.split(' ').first,
                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          showModalBottomSheet(
            context: context,
            isScrollControlled: true,
            backgroundColor: Colors.transparent,
            builder: (_) => const AddChandaDialog(),
          );
        },
        backgroundColor: AppTheme.primarySaffron,
        elevation: 4,
        icon: const Icon(Icons.add_circle, color: Colors.white),
        label: const Text(
          'Add Chanda',
          style: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
            letterSpacing: 0.2,
          ),
        ),
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.dashboard_outlined),
            activeIcon: Icon(Icons.dashboard),
            label: 'Home',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.receipt_long_outlined),
            activeIcon: Icon(Icons.receipt_long),
            label: 'Chanda',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.payments_outlined),
            activeIcon: Icon(Icons.payments),
            label: 'Expenses',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.emoji_events_outlined),
            activeIcon: Icon(Icons.emoji_events),
            label: 'Team',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.tune_outlined),
            activeIcon: Icon(Icons.tune),
            label: 'More',
          ),
        ],
      ),
    );
  }
}
