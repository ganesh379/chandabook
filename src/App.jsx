import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import Navbar from './components/Navbar';
import MobileBottomNav from './components/MobileBottomNav';
import GuestLoginGate from './components/GuestLoginGate';
import UserAuthLanding from './components/UserAuthLanding';
import Dashboard from './components/Dashboard';
import MembersLeaderboard from './components/MembersLeaderboard';
import ChandaList from './components/ChandaList';
import AddChandaModal from './components/AddChandaModal';
import ExpensesList from './components/ExpensesList';
import DailyLedger from './components/DailyLedger';
import ReceiptModal from './components/ReceiptModal';
import ReportsSettings from './components/ReportsSettings';
import GroupSelectorModal from './components/GroupSelectorModal';
import PrasadamSchedule from './components/PrasadamSchedule';
import PledgesList from './components/PledgesList';
import AnalyticsCharts from './components/AnalyticsCharts';
import ReceiptLookup from './components/ReceiptLookup';
import TransparencyPage from './components/TransparencyPage';
import UpiQrModal from './components/UpiQrModal';
import VolunteerProfileModal from './components/VolunteerProfileModal';
import UserProfileModal from './components/UserProfileModal';
import {
  loadAllGroups,
  saveAllGroups,
  getActiveGroupId,
  setActiveGroupId,
  computeGroupFinancials
} from './utils/storage';
import {
  initFirebase,
  subscribeToGroupRealtime,
  syncGroupToFirestore,
  signInWithGoogle,
  logoutUser,
  subscribeToAuth,
  fetchGroupByCode,
  registerPushToken,
  subscribeToForegroundPush,
  fetchUserProfile,
  saveUserProfile,
  linkGroupToUser,
  fetchUserGroupsFromFirestore
} from './firebase';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  isNotificationBannerDismissed,
  dismissNotificationBanner,
  checkAndNotifyMilestones
} from './utils/notifications';

const VALID_TABS = [
  'dashboard',
  'leaderboard',
  'chanda',
  'expenses',
  'pledges',
  'prasadam',
  'analytics',
  'ledger',
  'settings',
  'landing'
];

const getInitialTab = () => {
  try {
    const hash = window.location.hash.replace('#', '').trim();
    if (hash && VALID_TABS.includes(hash)) {
      return hash;
    }
    const urlTab = new URLSearchParams(window.location.search).get('tab');
    if (urlTab && VALID_TABS.includes(urlTab)) {
      return urlTab;
    }
    const stored = localStorage.getItem('chandabook_active_tab');
    if (stored && VALID_TABS.includes(stored)) {
      return stored;
    }
  } catch (e) {}
  return 'dashboard';
};

export default function App() {
  const [allGroups, setAllGroups] = useState(() => loadAllGroups());
  const [activeGroupId, setGroupId] = useState(() => getActiveGroupId());
  const [activeTab, setActiveTab] = useState(() => getInitialTab());
  const [firebaseConnected, setFirebaseConnected] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true); // true until Firebase auth resolves
  const [showVolunteerModal, setShowVolunteerModal] = useState(false);
  const [autoOpenExpenseModal, setAutoOpenExpenseModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isFirstTimeProfile, setIsFirstTimeProfile] = useState(false);

  // Pending invite code from URL (applied after user logs in)
  const [pendingInviteCode, setPendingInviteCode] = useState(null);
  const [pendingIsInviteMember, setPendingIsInviteMember] = useState(false);

  // Guard: skip re-syncing to Firestore when the change came FROM Firestore
  const skipNextSync = useRef(false);

  // Modals state
  const [showAddChanda, setShowAddChanda] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupModalInitialMode, setGroupModalInitialMode] = useState('list');
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [showUpiQr, setShowUpiQr] = useState(false);

  // PWA Deferred Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  // Public Transparency Report Route (?public=CODE) - bypasses auth entirely
  const [publicCode] = useState(() => new URLSearchParams(window.location.search).get('public'));

  // Donor Receipt Lookup (auth-independent)
  const [showReceiptLookup, setShowReceiptLookup] = useState(false);

  // Milestone Notifications
  const [showNotifyBanner, setShowNotifyBanner] = useState(false);
  const [milestoneToast, setMilestoneToast] = useState(null);

  // Groups List & Active Group object
  const groupsList = Object.values(allGroups);
  const isAuthenticated = !!currentUser;
  const activeGroup = isAuthenticated ? (allGroups[activeGroupId] || (groupsList.length > 0 ? groupsList[0] : null)) : null;

  // Admin check: current user has role='admin' in the active group's memberAccounts list
  const isAdmin = (() => {
    if (!currentUser?.uid || !activeGroup) return false;
    const member = (activeGroup.memberAccounts || []).find(m => m.uid === currentUser.uid);
    if (member) return member.role === 'admin';
    if (activeGroup.createdBy && activeGroup.createdBy === currentUser.uid) return true;
    if (!activeGroup.memberAccounts || activeGroup.memberAccounts.length === 0) return true;
    return false;
  })();

  // URL Query Param Invite Link Detector (?inviteMember=CODE or ?join=CODE)
  // Stores the invite code as pending; it will be processed after login.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const inviteCode = (params.get('inviteMember') || params.get('join') || params.get('code') || '').trim();
    if (!inviteCode) return;

    // Store the invite code to process after login
    setPendingInviteCode(inviteCode);
    if (params.get('inviteMember')) {
      setPendingIsInviteMember(true);
    }

    // Remove invite params so refresh doesn't re-trigger
    const cleanUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, '', cleanUrl);
  }, []);

  // Process pending invite code after user logs in
  useEffect(() => {
    if (!currentUser || !pendingInviteCode) return;

    let cancelled = false;
    const processInvite = async () => {
      // Check local cache first
      let matched = Object.values(loadAllGroups()).find(g => g.code === pendingInviteCode);

      // Not cached locally — try Firestore
      if (!matched) {
        const remote = await fetchGroupByCode(pendingInviteCode);
        if (cancelled || !remote) {
          setPendingInviteCode(null);
          setPendingIsInviteMember(false);
          return;
        }
        matched = remote;
        setAllGroups(prev => ({ ...prev, [remote.id]: remote }));
      }

      if (matched && !cancelled) {
        setGroupId(matched.id);
        setActiveGroupId(matched.id);
        setActiveTab('dashboard');
        if (currentUser?.uid) {
          linkGroupToUser(currentUser.uid, matched.id);
        }
        if (pendingIsInviteMember) {
          setShowVolunteerModal(true);
        }
      }

      setPendingInviteCode(null);
      setPendingIsInviteMember(false);
    };

    processInvite();
    return () => { cancelled = true; };
  }, [currentUser, pendingInviteCode]);

  // Sync user profile & groups from Firestore on login
  const syncUserDataOnLogin = async (user) => {
    if (!user) return;
    try {
      // 1. Fetch user profile from Firestore or initialize from Google
      const remoteProfile = await fetchUserProfile(user.uid);
      if (remoteProfile) {
        localStorage.setItem('chandabook_user_profile', JSON.stringify(remoteProfile));
      } else {
        // Auto-save Google account info so user profile exists in Firestore permanently
        const defaultProfile = {
          fullName: user.displayName || 'Committee Member',
          email: user.email || '',
          photoURL: user.photoURL || '',
          phone: '',
          city: '',
          isProfileComplete: true
        };
        localStorage.setItem('chandabook_user_profile', JSON.stringify(defaultProfile));
        await saveUserProfile(user.uid, defaultProfile);
      }

      // 2. Fetch and restore user's groups from Firestore (across devices / cleared storage)
      const remoteGroups = await fetchUserGroupsFromFirestore(user.uid);
      if (remoteGroups && remoteGroups.length > 0) {
        setAllGroups(prev => {
          const merged = { ...prev };
          remoteGroups.forEach(g => {
            if (g && g.id) {
              merged[g.id] = g;
            }
          });
          saveAllGroups(merged);
          return merged;
        });

        // If no active group selected, select the first remote group
        if (!activeGroupId) {
          setGroupId(remoteGroups[0].id);
          setActiveGroupId(remoteGroups[0].id);
        }
      }
    } catch (err) {
      console.warn("User data sync error:", err);
    }
  };

  // Initialize Firebase and Listen to Auth state
  useEffect(() => {
    const db = initFirebase();
    setFirebaseConnected(!!db);

    const unsubscribeAuth = subscribeToAuth((user) => {
      setCurrentUser(user);
      setAuthLoading(false);
      if (user) {
        syncUserDataOnLogin(user);
      }
    });

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      if (unsubscribeAuth) unsubscribeAuth();
    };
  }, []);

  // Sync groups to LocalStorage & Firestore whenever allGroups changes
  useEffect(() => {
    saveAllGroups(allGroups);
    if (activeGroup && firebaseConnected && !skipNextSync.current) {
      syncGroupToFirestore(activeGroup);
    }
    skipNextSync.current = false;
  }, [allGroups, activeGroupId, firebaseConnected]);

  // Real-time Firestore Listener for active group
  useEffect(() => {
    if (!firebaseConnected || !activeGroup?.id) return;
    const unsubscribe = subscribeToGroupRealtime(activeGroup.id, (remoteGroup) => {
      if (remoteGroup && remoteGroup.id) {
        skipNextSync.current = true;
        setAllGroups(prev => ({
          ...prev,
          [remoteGroup.id]: remoteGroup
        }));
      }
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [activeGroupId, firebaseConnected]);

  // Show the "enable milestone alerts" banner once per group, if not already decided
  useEffect(() => {
    if (activeGroup?.id && isNotificationSupported() && getNotificationPermission() === 'default' && !isNotificationBannerDismissed()) {
      setShowNotifyBanner(true);
    }
  }, [activeGroup?.id]);

  // Check goal-progress milestones whenever the active group's totals change
  useEffect(() => {
    if (!activeGroup) return;
    const financials = computeGroupFinancials(activeGroup);
    const result = checkAndNotifyMilestones(activeGroup, financials);
    if (result) {
      setMilestoneToast(result);
      try { confetti({ particleCount: 120, spread: 100, origin: { y: 0.4 } }); } catch (e) {}
      const timer = setTimeout(() => setMilestoneToast(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [activeGroup]);

  const handleEnableNotifications = async () => {
    await requestNotificationPermission();
    // Also register this device for real push, so committee activity arrives
    // even with the app closed. Silent if unconfigured — the Settings toggle
    // is where the actual error is surfaced.
    if (activeGroup) {
      await registerPushToken(activeGroup, currentUser?.displayName || '');
    }
    dismissNotificationBanner();
    setShowNotifyBanner(false);
  };

  // Foreground pushes don't wake the service worker, so show them in-app.
  useEffect(() => {
    let unsubscribe = () => {};
    let cancelled = false;
    subscribeToForegroundPush(({ title, body }) => {
      if (!title) return;
      setMilestoneToast({ title, body });
      setTimeout(() => setMilestoneToast(null), 6000);
    }).then(fn => {
      if (cancelled) fn(); else unsubscribe = fn;
    });
    return () => { cancelled = true; unsubscribe(); };
  }, []);

  const handleDismissNotifyBanner = () => {
    dismissNotificationBanner();
    setShowNotifyBanner(false);
  };

  const handleSelectTab = (tab) => {
    if (VALID_TABS.includes(tab)) {
      setActiveTab(tab);
      try {
        localStorage.setItem('chandabook_active_tab', tab);
        if (window.location.hash !== `#${tab}`) {
          window.history.replaceState(null, '', `#${tab}`);
        }
      } catch (e) {}
    }
  };

  // Sync tab with URL Hash & LocalStorage
  useEffect(() => {
    if (activeTab && VALID_TABS.includes(activeTab)) {
      try {
        localStorage.setItem('chandabook_active_tab', activeTab);
        if (window.location.hash !== `#${activeTab}`) {
          window.history.replaceState(null, '', `#${activeTab}`);
        }
      } catch (e) {}
    }
  }, [activeTab]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').trim();
      if (hash && VALID_TABS.includes(hash) && hash !== activeTab) {
        setActiveTab(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [activeTab]);

  // Google Login Handler
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithGoogle();
      if (result?.user) {
        setCurrentUser(result.user);
        syncUserDataOnLogin(result.user);
      }
    } catch (err) {
      alert("Google Login Note: " + (err.message || "Failed to sign in with Google."));
    }
  };

  // Complete Logout Handler
  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
    setGroupId(null);
    setActiveGroupId(null);
  };

  const handleJoinViaCode = async (code, passcode = '') => {
    let matched = groupsList.find(g => g.code === code);

    // Not cached locally yet (fresh device) - try Firestore directly
    if (!matched) {
      const remote = await fetchGroupByCode(code);
      if (remote) {
        matched = remote;
        setAllGroups(prev => ({ ...prev, [remote.id]: remote }));
      }
    }

    if (matched) {
      if (matched.adminPasscode && passcode) {
        if (matched.adminPasscode !== passcode) {
          return false;
        }
      }
      setGroupId(matched.id);
      setActiveGroupId(matched.id);
      if (currentUser?.uid) {
        linkGroupToUser(currentUser.uid, matched.id);
      }
      return true;
    }
    return false;
  };

  const handleSelectGroup = (id) => {
    setGroupId(id);
    setActiveGroupId(id);
  };

  const handleCreateGroup = (newGroup) => {
    const groupWithCreator = {
      ...newGroup,
      ownerUid: currentUser?.uid || null,
      creatorEmail: currentUser?.email || null
    };
    setAllGroups(prev => {
      const next = { ...prev, [groupWithCreator.id]: groupWithCreator };
      saveAllGroups(next);
      return next;
    });
    handleSelectGroup(groupWithCreator.id);
    if (currentUser?.uid) {
      linkGroupToUser(currentUser.uid, groupWithCreator.id);
    }
  };

  const handleUpdateActiveGroup = (updatedGroup) => {
    setAllGroups(prev => ({
      ...prev,
      [updatedGroup.id]: updatedGroup
    }));
  };

  // Trigger Log Expense Redirection & Auto-Open Modal
  const handleOpenAddExpense = () => {
    handleSelectTab('expenses');
    setAutoOpenExpenseModal(true);
  };

  // Submit Volunteer Profile from WhatsApp link
  const handleSubmitVolunteerProfile = (memberObj) => {
    if (!activeGroup) return;
    const existingMembers = activeGroup.members || [];
    const existingMembersData = activeGroup.membersData || [];

    const updatedMembers = [...existingMembers, memberObj.name];
    const updatedMembersData = [...existingMembersData, memberObj];

    handleUpdateActiveGroup({
      ...activeGroup,
      members: updatedMembers,
      membersData: updatedMembersData
    });

    setShowVolunteerModal(false);
    handleSelectTab('leaderboard');
  };

  // Delete Entire Group (Admin Action)
  const handleDeleteGroup = (groupId) => {
    setAllGroups(prev => {
      const next = { ...prev };
      delete next[groupId];
      saveAllGroups(next);
      return next;
    });
    const remaining = Object.keys(allGroups).filter(id => id !== groupId);
    if (remaining.length > 0) {
      handleSelectGroup(remaining[0]);
    } else {
      setGroupId(null);
      setActiveGroupId(null);
    }
  };

  // Add Chanda Collection
  const handleAddCollection = (newCollection) => {
    if (!activeGroup) return;
    const collections = [newCollection, ...(activeGroup.collections || [])];
    handleUpdateActiveGroup({
      ...activeGroup,
      collections
    });
  };

  // Delete Chanda Collection
  const handleDeleteCollection = (id) => {
    if (!window.confirm("Are you sure you want to delete this donation receipt entry?")) return;
    const collections = (activeGroup.collections || []).filter(c => c.id !== id);
    handleUpdateActiveGroup({
      ...activeGroup,
      collections
    });
  };

  // Add Expense
  const handleAddExpense = (newExpense) => {
    if (!activeGroup) return;
    const expenses = [newExpense, ...(activeGroup.expenses || [])];
    handleUpdateActiveGroup({
      ...activeGroup,
      expenses
    });
  };

  // Delete Expense
  const handleDeleteExpense = (id) => {
    if (!window.confirm("Are you sure you want to delete this expense record?")) return;
    const expenses = (activeGroup.expenses || []).filter(e => e.id !== id);
    handleUpdateActiveGroup({
      ...activeGroup,
      expenses
    });
  };

  // Handle PWA Install Click
  const handleInstallPWA = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => {
        setDeferredPrompt(null);
        setShowInstallBanner(false);
      });
    }
  };

  const openGroupModalWithMode = (mode) => {
    setGroupModalInitialMode(mode);
    setShowGroupModal(true);
  };

  // Public transparency report - fully bypasses login/group state
  if (publicCode) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
        <TransparencyPage code={publicCode} groupsList={groupsList} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <Navbar 
        activeGroup={activeGroup}
        onOpenGroupModal={() => openGroupModalWithMode('list')}
        firebaseConnected={firebaseConnected}
        currentUser={currentUser}
        onGoogleSignIn={handleGoogleSignIn}
        onLogout={handleLogout}
        onSelectTab={handleSelectTab}
        onOpenUpiQr={() => setShowUpiQr(true)}
      />

      {/* PWA Install Banner */}
      {showInstallBanner && (
        <div className="no-print" style={{
          background: 'linear-gradient(90deg, #d97706, #f59e0b)',
          color: '#0f172a',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontWeight: 700,
          fontSize: '0.85rem'
        }}>
          <span>📲 Install ChandaBook App on your phone for instant access!</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleInstallPWA} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
              Install Now
            </button>
            <button onClick={() => setShowInstallBanner(false)} style={{ background: 'none', border: 'none', color: '#0f172a', fontWeight: 800, cursor: 'pointer' }}>✕</button>
          </div>
        </div>
      )}

      {/* Milestone Notification Opt-In Banner */}
      {showNotifyBanner && (
        <div className="no-print" style={{
          background: 'rgba(37, 99, 235, 0.15)',
          borderBottom: '1px solid rgba(37, 99, 235, 0.3)',
          color: 'var(--text-main)',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
          fontSize: '0.82rem'
        }}>
          <span>🔔 Get alerts for every new chanda &amp; expense, plus goal milestones — even when the app is closed.</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleEnableNotifications} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
              Enable
            </button>
            <button onClick={handleDismissNotifyBanner} style={{ background: 'none', border: 'none', color: 'var(--text-main)', fontWeight: 800, cursor: 'pointer' }}>✕</button>
          </div>
        </div>
      )}

      {/* Milestone Reached Toast - normal document flow, matches the PWA/notify banners below the header so it never overlaps navbar content on narrow screens */}
      {milestoneToast && (
        <div className="no-print" style={{ padding: '10px 16px' }}>
          <div className="glass-card" style={{ padding: '14px 16px', border: '1.5px solid #eab308', boxShadow: '0 0 25px rgba(234, 179, 8, 0.3)', maxWidth: '480px', margin: '0 auto' }}>
            <h4 style={{ fontSize: '0.95rem', color: '#fbbf24', marginBottom: '4px' }}>{milestoneToast.title}</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{milestoneToast.body}</p>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="app-container">
        {authLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px' }}>
            <div style={{
              width: '44px', height: '44px', border: '3.5px solid rgba(245, 158, 11, 0.2)',
              borderTopColor: '#f59e0b', borderRadius: '50%',
              animation: 'spin 0.8s linear infinite'
            }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Loading ChandaBook...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : !isAuthenticated ? (
          <GuestLoginGate
            onGoogleSignIn={handleGoogleSignIn}
            onOpenReceiptLookup={() => setShowReceiptLookup(true)}
          />
        ) : !activeGroup ? (
          /* NO ACTIVE GROUP LANDING SCREEN */
          <div style={{ maxWidth: '580px', margin: '30px auto', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="glass-card" style={{ padding: '32px 24px' }}>
              {currentUser && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  marginBottom: '20px',
                  padding: '12px',
                  background: 'var(--bg-input)',
                  borderRadius: '14px'
                }}>
                  <img 
                    src={currentUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.email}`} 
                    alt={currentUser.displayName} 
                    style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid var(--primary-500)' }}
                  />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.9rem' }}>
                      {currentUser.displayName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#34d399' }}>
                      {currentUser.email}
                    </div>
                  </div>
                </div>
              )}

              <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🚩</div>
              <h2 style={{ fontSize: '1.6rem', color: 'var(--text-main)', fontWeight: 800 }}>
                Welcome to ChandaBook!
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '4px', marginBottom: '24px' }}>
                You are not in any festival group yet. Create your committee group or join via WhatsApp code!
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button 
                  onClick={() => openGroupModalWithMode('create')}
                  className="btn btn-primary"
                  style={{ padding: '14px', fontSize: '1rem', width: '100%' }}
                >
                  + Create Your Festival Group
                </button>

                <button 
                  onClick={() => openGroupModalWithMode('join')}
                  className="btn btn-secondary"
                  style={{ padding: '14px', fontSize: '0.95rem', width: '100%' }}
                >
                  🔑 Join Group via 6-Digit Code
                </button>

                <button 
                  onClick={() => {
                    setIsFirstTimeProfile(false);
                    setShowProfileModal(true);
                  }}
                  className="btn btn-secondary"
                  style={{ padding: '12px', fontSize: '0.9rem', width: '100%', gap: '6px' }}
                >
                  👤 My Profile
                </button>

                <button 
                  onClick={handleLogout}
                  className="btn btn-danger"
                  style={{ padding: '12px', fontSize: '0.9rem', width: '100%', gap: '6px', marginTop: '6px' }}
                >
                  🚪 Logout
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'landing' && (
              <UserAuthLanding 
                currentUser={currentUser}
                onGoogleSignIn={handleGoogleSignIn}
                onLogout={handleLogout}
                groupsList={groupsList}
                activeGroupId={activeGroupId}
                onSelectGroup={handleSelectGroup}
                onOpenCreateGroup={() => openGroupModalWithMode('create')}
                onOpenJoinGroup={() => openGroupModalWithMode('join')}
              />
            )}

            {activeTab === 'dashboard' && (
              <Dashboard 
                group={activeGroup}
                onOpenAddChanda={() => setShowAddChanda(true)}
                onOpenAddExpense={handleOpenAddExpense}
                onSelectTab={handleSelectTab}
                onViewReceipt={setSelectedReceipt}
              />
            )}

            {activeTab === 'leaderboard' && (
              <MembersLeaderboard 
                group={activeGroup}
                onUpdateGroup={handleUpdateActiveGroup}
                onViewReceipt={setSelectedReceipt}
                isAdmin={isAdmin}
              />
            )}

            {activeTab === 'chanda' && (
              <ChandaList 
                group={activeGroup}
                onOpenAddChanda={() => setShowAddChanda(true)}
                onDeleteCollection={handleDeleteCollection}
                onViewReceipt={setSelectedReceipt}
                isAdmin={isAdmin}
              />
            )}

            {activeTab === 'expenses' && (
              <ExpensesList 
                group={activeGroup}
                onAddExpense={handleAddExpense}
                onDeleteExpense={handleDeleteExpense}
                autoOpenAddModal={autoOpenExpenseModal}
                onResetAutoOpen={() => setAutoOpenExpenseModal(false)}
                isAdmin={isAdmin}
              />
            )}

            {activeTab === 'pledges' && (
              <PledgesList
                group={activeGroup}
                onUpdateGroup={handleUpdateActiveGroup}
                onAddCollection={handleAddCollection}
                isAdmin={isAdmin}
              />
            )}

            {activeTab === 'prasadam' && (
              <PrasadamSchedule
                group={activeGroup}
                onUpdateGroup={handleUpdateActiveGroup}
                isAdmin={isAdmin}
              />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsCharts group={activeGroup} />
            )}

            {activeTab === 'ledger' && (
              <DailyLedger 
                group={activeGroup}
              />
            )}

            {activeTab === 'settings' && (
              <ReportsSettings 
                group={activeGroup}
                onUpdateGroup={handleUpdateActiveGroup}
                onDeleteGroup={handleDeleteGroup}
                allGroupsMap={allGroups}
                onReplaceAllGroups={setAllGroups}
                onRefreshCloudSync={() => setFirebaseConnected(!!initFirebase())}
                currentUser={currentUser}
                isAdmin={isAdmin}
              />
            )}
          </>
        )}
      </main>

      {/* Mobile Bottom Tab Navigation */}
      {isAuthenticated && activeGroup && (
        <MobileBottomNav 
          activeTab={activeTab}
          setActiveTab={handleSelectTab}
        />
      )}

      {/* MODALS */}
      {showProfileModal && (
        <UserProfileModal 
          currentUser={currentUser}
          onLogout={handleLogout}
          onClose={() => setShowProfileModal(false)}
          isFirstTime={isFirstTimeProfile}
        />
      )}

      {showVolunteerModal && activeGroup && (
        <VolunteerProfileModal 
          group={activeGroup}
          currentUser={currentUser}
          onSubmitProfile={handleSubmitVolunteerProfile}
          onClose={() => setShowVolunteerModal(false)}
        />
      )}

      {showGroupModal && (
        <GroupSelectorModal
          groupsMap={allGroups}
          activeGroupId={activeGroupId}
          onSelectGroup={handleSelectGroup}
          onCreateGroup={handleCreateGroup}
          onImportGroup={handleCreateGroup}
          onClose={() => setShowGroupModal(false)}
          initialMode={groupModalInitialMode}
          currentUser={currentUser}
        />
      )}

      {showAddChanda && activeGroup && (
        <AddChandaModal 
          group={activeGroup}
          onAddCollection={handleAddCollection}
          onClose={() => setShowAddChanda(false)}
          onViewReceipt={setSelectedReceipt}
        />
      )}

      {selectedReceipt && activeGroup && (
        <ReceiptModal 
          collection={selectedReceipt}
          group={activeGroup}
          onClose={() => setSelectedReceipt(null)}
        />
      )}

      {showUpiQr && activeGroup && (
        <UpiQrModal
          group={activeGroup}
          onUpdateGroup={handleUpdateActiveGroup}
          onClose={() => setShowUpiQr(false)}
        />
      )}

      {showReceiptLookup && (
        <ReceiptLookup
          groupsList={groupsList}
          onClose={() => setShowReceiptLookup(false)}
        />
      )}
    </div>
  );
}
