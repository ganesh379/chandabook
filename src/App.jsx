import React, { useState, useEffect } from 'react';
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
import UpiQrModal from './components/UpiQrModal';
import VolunteerProfileModal from './components/VolunteerProfileModal';
import UserProfileModal from './components/UserProfileModal';
import { 
  loadAllGroups, 
  saveAllGroups, 
  getActiveGroupId, 
  setActiveGroupId 
} from './utils/storage';
import { 
  initFirebase, 
  subscribeToGroupRealtime, 
  syncGroupToFirestore,
  signInWithGoogle,
  logoutUser,
  subscribeToAuth 
} from './firebase';

export default function App() {
  const [allGroups, setAllGroups] = useState(() => loadAllGroups());
  const [activeGroupId, setGroupId] = useState(() => getActiveGroupId());
  const [activeTab, setActiveTab] = useState('dashboard');
  const [firebaseConnected, setFirebaseConnected] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [unlockedViaCode, setUnlockedViaCode] = useState(false);
  const [showVolunteerModal, setShowVolunteerModal] = useState(false);
  const [autoOpenExpenseModal, setAutoOpenExpenseModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isFirstTimeProfile, setIsFirstTimeProfile] = useState(false);

  // Modals state
  const [showAddChanda, setShowAddChanda] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupModalInitialMode, setGroupModalInitialMode] = useState('list');
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [showUpiQr, setShowUpiQr] = useState(false);

  // PWA Deferred Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  // Groups List & Active Group object
  const groupsList = Object.values(allGroups);
  const isAuthenticatedOrUnlocked = !!(currentUser || unlockedViaCode);
  const activeGroup = isAuthenticatedOrUnlocked ? (allGroups[activeGroupId] || (groupsList.length > 0 ? groupsList[0] : null)) : null;

  // URL Query Param Invite Link Detector (?inviteMember=CODE or ?join=CODE)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const inviteCode = params.get('inviteMember') || params.get('join') || params.get('code');
    if (inviteCode && groupsList.length > 0) {
      const matched = groupsList.find(g => g.code === inviteCode.trim());
      if (matched) {
        setGroupId(matched.id);
        setActiveGroupId(matched.id);
        setUnlockedViaCode(true);
        if (params.get('inviteMember')) {
          setShowVolunteerModal(true);
        }
      }
    }
  }, [allGroups]);

  // Check if logged in user has completed basic profile
  const checkMemberProfileCompletion = (user) => {
    if (!user) return;
    const profile = JSON.parse(localStorage.getItem('chandabook_user_profile') || '{}');
    if (!profile.isProfileComplete || !profile.phone) {
      setIsFirstTimeProfile(true);
      setShowProfileModal(true);
    }
  };

  // Initialize Firebase and Listen to Auth state
  useEffect(() => {
    const db = initFirebase();
    setFirebaseConnected(!!db);

    const unsubscribeAuth = subscribeToAuth((user) => {
      setCurrentUser(user);
      if (user) {
        checkMemberProfileCompletion(user);
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
    if (activeGroup && firebaseConnected) {
      syncGroupToFirestore(activeGroup);
    }
  }, [allGroups, activeGroupId, firebaseConnected]);

  // Real-time Firestore Listener for active group
  useEffect(() => {
    if (!firebaseConnected || !activeGroup?.id) return;
    const unsubscribe = subscribeToGroupRealtime(activeGroup.id, (remoteGroup) => {
      if (remoteGroup && remoteGroup.id) {
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

  // Google Login Handler
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithGoogle();
      if (result?.user) {
        setCurrentUser(result.user);
        checkMemberProfileCompletion(result.user);
        setActiveTab('dashboard');
      }
    } catch (err) {
      alert("Google Login Note: " + (err.message || "Failed to sign in with Google."));
    }
  };

  // Complete Logout Handler
  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
    setUnlockedViaCode(false);
    setGroupId(null);
    setActiveGroupId(null);
  };

  const handleJoinViaCode = (code, passcode = '') => {
    const matched = groupsList.find(g => g.code === code);
    if (matched) {
      if (matched.adminPasscode && passcode) {
        if (matched.adminPasscode !== passcode) {
          return false;
        }
      }
      setGroupId(matched.id);
      setActiveGroupId(matched.id);
      setUnlockedViaCode(true);
      setActiveTab('dashboard');
      return true;
    }
    return false;
  };

  const handleSelectGroup = (id) => {
    setGroupId(id);
    setActiveGroupId(id);
    setActiveTab('dashboard');
  };

  const handleCreateGroup = (newGroup) => {
    setAllGroups(prev => {
      const next = { ...prev, [newGroup.id]: newGroup };
      saveAllGroups(next);
      return next;
    });
    handleSelectGroup(newGroup.id);
  };

  const handleUpdateActiveGroup = (updatedGroup) => {
    setAllGroups(prev => ({
      ...prev,
      [updatedGroup.id]: updatedGroup
    }));
  };

  // Trigger Log Expense Redirection & Auto-Open Modal
  const handleOpenAddExpense = () => {
    setActiveTab('expenses');
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
    setActiveTab('leaderboard');
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
        onSelectTab={setActiveTab}
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

      {/* Main Container */}
      <main className="app-container">
        {!isAuthenticatedOrUnlocked ? (
          <GuestLoginGate 
            currentUser={currentUser}
            onGoogleSignIn={handleGoogleSignIn}
            onJoinViaCode={handleJoinViaCode}
            groupsList={groupsList}
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
                  👤 My Profile & Contact Details
                </button>

                <button 
                  onClick={handleLogout}
                  className="btn btn-danger"
                  style={{ padding: '12px', fontSize: '0.9rem', width: '100%', gap: '6px', marginTop: '6px' }}
                >
                  🚪 Logout / Sign Out
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
                onSelectTab={setActiveTab}
                onViewReceipt={setSelectedReceipt}
              />
            )}

            {activeTab === 'leaderboard' && (
              <MembersLeaderboard 
                group={activeGroup}
                onUpdateGroup={handleUpdateActiveGroup}
                onViewReceipt={setSelectedReceipt}
              />
            )}

            {activeTab === 'chanda' && (
              <ChandaList 
                group={activeGroup}
                onOpenAddChanda={() => setShowAddChanda(true)}
                onDeleteCollection={handleDeleteCollection}
                onViewReceipt={setSelectedReceipt}
              />
            )}

            {activeTab === 'expenses' && (
              <ExpensesList 
                group={activeGroup}
                onAddExpense={handleAddExpense}
                onDeleteExpense={handleDeleteExpense}
                autoOpenAddModal={autoOpenExpenseModal}
                onResetAutoOpen={() => setAutoOpenExpenseModal(false)}
              />
            )}

            {activeTab === 'prasadam' && (
              <PrasadamSchedule 
                group={activeGroup}
                onUpdateGroup={handleUpdateActiveGroup}
              />
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
              />
            )}
          </>
        )}
      </main>

      {/* Mobile Bottom Tab Navigation */}
      {isAuthenticatedOrUnlocked && activeGroup && (
        <MobileBottomNav 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
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
          onClose={() => setShowGroupModal(false)}
          initialMode={groupModalInitialMode}
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
    </div>
  );
}
